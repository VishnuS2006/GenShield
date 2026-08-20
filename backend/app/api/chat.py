from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.chat_conversation import ChatConversation
from app.models.chat_message import ChatMessage
from app.models.detection_result import DetectionResult
from app.models.enums import Decision, MessageRole
from app.models.protected_document import ProtectedDocument
from app.models.user import User
from app.schemas.chat import (
    ChatConversationCreate,
    ChatConversationListItem,
    ChatConversationRead,
    ChatMessageUpdate,
    ChatConversationUpdate,
    ChatExchangeResponse,
    ChatMessageRead,
    ChatPromptRequest,
)
from app.schemas.detection import SecurityAnalysis
from app.services.audit_service import AuditService
from app.services.company_knowledge_service import CompanyKnowledgeService
from app.services.detection_service import DetectionService
from app.services.lineage_service import LineageService
from app.services.llm_service import get_llm_provider
from app.services.retrieval_service import RetrievalService
from app.services.risk_engine import RiskEngine
from app.utils.helpers import new_request_id

router = APIRouter(prefix="/api/chat", tags=["chat"])


def _build_verified_message(outcome, prompt: str, generated_response: str) -> str:
    matched_source = outcome.matched_document.title if outcome.matched_document else "No protected source matched"
    lineage_tag = outcome.matched_document.lineage_tag if outcome.matched_document else "No lineage tag available"
    sensitivity = outcome.sensitivity.value if outcome.sensitivity else "UNKNOWN"
    matched_facts = outcome.matched_facts[:4] if outcome.matched_facts else []
    fact_lines = "\n".join(f"- {fact}" for fact in matched_facts) if matched_facts else "- No direct protected fact strings were reproduced."
    warning_note = (
        "This answer is being returned with a warning because the generated draft showed moderate alignment with protected enterprise context. Review the highlighted source match before reusing it in a broader channel."
        if outcome.decision == Decision.WARN.value
        else "This answer passed the current protection policy and can be used within the normal assistant workflow."
    )
    return (
        "## Verified Response\n"
        f"The following answer was generated for the prompt: \"{prompt}\" and then verified by GenShield before delivery.\n\n"
        "## Assistant Answer\n"
        f"{generated_response}\n\n"
        "## Security Verification Summary\n"
        f"- Decision: {outcome.decision}\n"
        f"- Risk score: {outcome.risk_score} / 100\n"
        f"- Risk level: {outcome.risk_level}\n"
        f"- Sensitivity: {sensitivity}\n"
        f"- Semantic similarity: {round(outcome.similarity_score * 100)}%\n"
        f"- Factual overlap: {round(outcome.factual_overlap_score * 100)}%\n"
        f"- Matched source: {matched_source}\n"
        f"- Lineage: {lineage_tag}\n\n"
        "## Warning Guidance\n"
        f"{warning_note}\n\n"
        "## Evidence Snapshot\n"
        f"{fact_lines}\n\n"
        "## Safe Handling Guidance\n"
        "- Share externally only after confirming the content is intended for that audience.\n"
        "- Remove confidential figures, exact timelines, credentials, internal weaknesses, and privileged legal details if the audience is broader than the approved internal scope.\n"
        "- Escalate to a reviewer when the answer touches finance, security operations, roadmap details, legal exposure, or regulated data.\n\n"
        "## Verification Status\n"
        "This output was reviewed by the semantic detection pipeline using similarity scoring, factual overlap checks, sensitivity weighting, and policy enforcement before it was shown in chat."
    )


def _build_high_risk_message(outcome: DetectionOutcome, prompt: str) -> str:
    matched_source = outcome.matched_document.title if outcome.matched_document else "a protected internal source"
    return (
        "## High Risk Response Withheld\n"
        f"GenShield blocked the response for the prompt: \"{prompt}\".\n\n"
        f"- Decision: {outcome.decision}\n"
        f"- Risk score: {outcome.risk_score} / 100\n"
        f"- Risk level: {outcome.risk_level}\n"
        f"- Matched source: {matched_source}\n"
        f"- Semantic similarity: {round(outcome.similarity_score * 100)}%\n"
        f"- Factual overlap: {round(outcome.factual_overlap_score * 100)}%\n\n"
        "The generated answer overlapped too closely with protected company information, so the content was withheld. Ask for a higher-level, non-confidential summary instead."
    )


def _render_conversation_context(conversation: ChatConversation, max_messages: int = 8, max_chars: int = 2500) -> str:
    ordered_messages = sorted(conversation.messages, key=lambda item: item.created_at)
    recent_messages = ordered_messages[-max_messages:]
    lines: list[str] = []
    total = 0
    for message in recent_messages:
        speaker = "User" if message.role == MessageRole.USER else "Assistant"
        line = f"{speaker}: {message.content.strip()}"
        if total + len(line) > max_chars and lines:
            break
        lines.append(line)
        total += len(line)
    return "\n".join(lines)


def _render_protected_context(matches) -> str:
    blocks: list[str] = []
    for match in matches:
        facts = ", ".join(f.fact_value for f in match.relevant_facts[:4]) or "None"
        blocks.append(
            f"[{match.document.lineage_tag}] {match.document.title}\n"
            f"Business Unit: {match.document.department}\n"
            f"Region: Protected\n"
            f"{match.document.content}\n"
            f"Relevant Facts: {facts}"
        )
    return "\n\n".join(blocks)


def _message_risk_level(risk_score: int | None) -> str | None:
    if risk_score is None:
        return None
    return RiskEngine.classify_risk_level(risk_score)


async def _get_user_conversation(db: AsyncSession, conversation_id: int, user_id: int) -> ChatConversation:
    conversation = await db.scalar(
        select(ChatConversation)
        .execution_options(populate_existing=True)
        .options(selectinload(ChatConversation.messages))
        .where(ChatConversation.id == conversation_id, ChatConversation.user_id == user_id)
    )
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return conversation


def _to_conversation_read(conversation: ChatConversation) -> ChatConversationRead:
    ordered_messages = sorted(conversation.messages, key=lambda item: item.created_at)
    return ChatConversationRead(
        id=conversation.id,
        title=conversation.title,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        messages=[
            ChatMessageRead(
                id=message.id,
                role=message.role,
                content=message.content,
                request_id=message.request_id,
                decision=message.decision,
                risk_score=message.risk_score,
                risk_level=_message_risk_level(message.risk_score),
                similarity_score=message.similarity_score,
                matched_source=message.matched_source,
                lineage_tag=message.lineage_tag,
                created_at=message.created_at,
            )
            for message in ordered_messages
        ],
    )


@router.get("/conversations", response_model=list[ChatConversationListItem])
async def list_conversations(
    search: str | None = Query(default=None, min_length=1, max_length=200),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ChatConversationListItem]:
    query = (
        select(ChatConversation)
        .options(selectinload(ChatConversation.messages))
        .where(ChatConversation.user_id == user.id)
        .order_by(ChatConversation.updated_at.desc())
    )
    if search:
        pattern = f"%{search.strip()}%"
        query = (
            query.join(ChatConversation.messages, isouter=True)
            .where(
                or_(
                    ChatConversation.title.ilike(pattern),
                    ChatMessage.content.ilike(pattern),
                )
            )
            .group_by(ChatConversation.id)
            .order_by(func.max(ChatConversation.updated_at).desc())
        )
    conversations = list(await db.scalars(query))
    items: list[ChatConversationListItem] = []
    for conversation in conversations:
        last_message = max(conversation.messages, key=lambda item: item.created_at, default=None)
        items.append(
            ChatConversationListItem(
                id=conversation.id,
                title=conversation.title,
                last_message_preview=(last_message.content[:120] if last_message else None),
                last_decision=last_message.decision if last_message else None,
                updated_at=conversation.updated_at,
            )
        )
    return items


@router.post("/conversations", response_model=ChatConversationRead, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    payload: ChatConversationCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChatConversationRead:
    conversation = ChatConversation(user_id=user.id, title=payload.title.strip() or "New conversation")
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    return await _get_user_conversation(db, conversation.id, user.id)


@router.get("/conversations/{conversation_id}", response_model=ChatConversationRead)
async def get_conversation(
    conversation_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChatConversationRead:
    conversation = await _get_user_conversation(db, conversation_id, user.id)
    return _to_conversation_read(conversation)


@router.patch("/conversations/{conversation_id}", response_model=ChatConversationRead)
async def rename_conversation(
    conversation_id: int,
    payload: ChatConversationUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChatConversationRead:
    conversation = await _get_user_conversation(db, conversation_id, user.id)
    conversation.title = payload.title.strip()
    await db.commit()
    return await _get_user_conversation(db, conversation_id, user.id)


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    conversation = await _get_user_conversation(db, conversation_id, user.id)
    await db.delete(conversation)
    await db.commit()
    return None


@router.post("/conversations/{conversation_id}/messages", response_model=ChatExchangeResponse)
async def send_message(
    conversation_id: int,
    payload: ChatPromptRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChatExchangeResponse:
    conversation = await _get_user_conversation(db, conversation_id, user.id)

    prompt = payload.prompt.strip()
    user_message = ChatMessage(
        conversation_id=conversation.id,
        user_id=user.id,
        role=MessageRole.USER,
        content=prompt,
    )
    db.add(user_message)
    await db.flush()

    protected_documents = list(
        await db.scalars(select(ProtectedDocument).options(selectinload(ProtectedDocument.facts)))
    )
    retrieved_records = await CompanyKnowledgeService().retrieve(db, prompt)
    public_context = CompanyKnowledgeService().render_context(retrieved_records)
    protected_matches = RetrievalService().retrieve(prompt, protected_documents)
    protected_context = _render_protected_context(protected_matches)
    combined_context = public_context
    if protected_context:
        combined_context = f"{public_context}\n\n{protected_context}".strip()
    conversation_context = _render_conversation_context(conversation)
    generated_response = await get_llm_provider().generate_response(prompt, combined_context, conversation_context)

    outcome = DetectionService().analyze(generated_response, protected_documents, prompt=prompt)
    request_id = new_request_id()

    detection = DetectionResult(
        request_id=request_id,
        similarity_score=outcome.similarity_score,
        factual_overlap_score=outcome.factual_overlap_score,
        facts_matched=outcome.facts_matched,
        facts_total=outcome.facts_total,
        sensitivity_score=outcome.sensitivity_score,
        risk_score=outcome.risk_score,
        decision=Decision(outcome.decision),
        matched_document_id=outcome.matched_document.id if outcome.matched_document else None,
        matched_facts=outcome.matched_facts,
    )
    db.add(detection)
    await db.flush()
    await LineageService().create(db, request_id, detection, outcome.matched_document, outcome.similarity_score)
    await AuditService().create(
        db,
        request_id=request_id,
        user_id=user.id,
        prompt=prompt,
        generated_response=generated_response,
        risk_score=outcome.risk_score,
        decision=Decision(outcome.decision),
    )

    if outcome.decision == Decision.BLOCK.value:
        assistant_content = _build_high_risk_message(outcome, prompt)
    else:
        assistant_content = _build_verified_message(outcome, prompt, generated_response)

    assistant_message = ChatMessage(
        conversation_id=conversation.id,
        role=MessageRole.ASSISTANT,
        content=assistant_content,
        request_id=request_id,
        decision=Decision(outcome.decision),
        risk_score=outcome.risk_score,
        similarity_score=outcome.similarity_score,
        matched_source=outcome.matched_document.title if outcome.matched_document else None,
        lineage_tag=outcome.matched_document.lineage_tag if outcome.matched_document else None,
    )
    db.add(assistant_message)

    if conversation.title == "New conversation":
        conversation.title = prompt[:80]

    await db.commit()
    await db.refresh(user_message)
    await db.refresh(assistant_message)
    refreshed_conversation = await _get_user_conversation(db, conversation.id, user.id)

    analysis = SecurityAnalysis(
        similarity_score=outcome.similarity_score,
        facts_matched=outcome.facts_matched,
        facts_total=outcome.facts_total,
        factual_overlap_score=outcome.factual_overlap_score,
        sensitivity=outcome.sensitivity,
        risk_score=outcome.risk_score,
        risk_level=outcome.risk_level,
        decision=Decision(outcome.decision),
        matched_source=outcome.matched_document.title if outcome.matched_document else None,
        lineage_tag=outcome.matched_document.lineage_tag if outcome.matched_document else None,
        matched_facts=outcome.matched_facts,
    )
    return ChatExchangeResponse(
        conversation=_to_conversation_read(refreshed_conversation),
        user_message=ChatMessageRead(
            id=user_message.id,
            role=user_message.role,
            content=user_message.content,
            request_id=user_message.request_id,
            decision=user_message.decision,
            risk_score=user_message.risk_score,
            risk_level=_message_risk_level(user_message.risk_score),
            similarity_score=user_message.similarity_score,
            matched_source=user_message.matched_source,
            lineage_tag=user_message.lineage_tag,
            created_at=user_message.created_at,
        ),
        assistant_message=ChatMessageRead(
            id=assistant_message.id,
            role=assistant_message.role,
            content=assistant_message.content,
            request_id=assistant_message.request_id,
            decision=assistant_message.decision,
            risk_score=assistant_message.risk_score,
            risk_level=_message_risk_level(assistant_message.risk_score),
            similarity_score=assistant_message.similarity_score,
            matched_source=assistant_message.matched_source,
            lineage_tag=assistant_message.lineage_tag,
            created_at=assistant_message.created_at,
        ),
        security_analysis=analysis,
    )


@router.patch("/conversations/{conversation_id}/messages/{message_id}", response_model=ChatExchangeResponse)
async def edit_message(
    conversation_id: int,
    message_id: int,
    payload: ChatMessageUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChatExchangeResponse:
    conversation = await _get_user_conversation(db, conversation_id, user.id)
    ordered_messages = sorted(conversation.messages, key=lambda item: item.created_at)
    target_index = next((index for index, message in enumerate(ordered_messages) if message.id == message_id), None)
    if target_index is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

    target_message = ordered_messages[target_index]
    if target_message.role != MessageRole.USER or target_message.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only user messages can be edited")

    messages_to_delete = ordered_messages[target_index:]
    for message in messages_to_delete:
        await db.delete(message)
    await db.flush()

    await db.refresh(conversation, attribute_names=["messages"])
    return await send_message(
        conversation_id=conversation_id,
        payload=ChatPromptRequest(prompt=payload.content),
        user=user,
        db=db,
    )


@router.post("/conversations/{conversation_id}/regenerate", response_model=ChatExchangeResponse)
async def regenerate_message(
    conversation_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChatExchangeResponse:
    conversation = await _get_user_conversation(db, conversation_id, user.id)
    last_user_message = next(
        (message for message in sorted(conversation.messages, key=lambda item: item.created_at, reverse=True) if message.role == MessageRole.USER),
        None,
    )
    if not last_user_message:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No user message available to regenerate")
    return await send_message(
        conversation_id=conversation_id,
        payload=ChatPromptRequest(prompt=last_user_message.content),
        user=user,
        db=db,
    )
