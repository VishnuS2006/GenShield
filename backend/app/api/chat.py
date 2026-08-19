from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
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
from app.utils.helpers import new_request_id

router = APIRouter(prefix="/api/chat", tags=["chat"])


async def _get_user_conversation(db: AsyncSession, conversation_id: int, user_id: int) -> ChatConversation:
    conversation = await db.scalar(
        select(ChatConversation)
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
        messages=[ChatMessageRead.model_validate(message) for message in ordered_messages],
    )


@router.get("/conversations", response_model=list[ChatConversationListItem])
async def list_conversations(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ChatConversationListItem]:
    conversations = list(
        await db.scalars(
            select(ChatConversation)
            .options(selectinload(ChatConversation.messages))
            .where(ChatConversation.user_id == user.id)
            .order_by(ChatConversation.updated_at.desc())
        )
    )
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


@router.post("/conversations/{conversation_id}/messages", response_model=ChatExchangeResponse)
async def send_message(
    conversation_id: int,
    payload: ChatPromptRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChatExchangeResponse:
    conversation = await _get_user_conversation(db, conversation_id, user.id)

    user_message = ChatMessage(
        conversation_id=conversation.id,
        user_id=user.id,
        role=MessageRole.USER,
        content=payload.prompt.strip(),
    )
    db.add(user_message)
    await db.flush()

    retrieved_records = await CompanyKnowledgeService().retrieve(db, payload.prompt)
    context = CompanyKnowledgeService().render_context(retrieved_records)
    generated_response = await get_llm_provider().generate_response(payload.prompt, context)

    protected_documents = list(
        await db.scalars(select(ProtectedDocument).options(selectinload(ProtectedDocument.facts)))
    )
    outcome = DetectionService().analyze(generated_response, protected_documents)
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
        prompt=payload.prompt,
        generated_response=generated_response,
        risk_score=outcome.risk_score,
        decision=Decision(outcome.decision),
    )

    assistant_content = generated_response
    if outcome.decision == Decision.BLOCK.value:
        assistant_content = (
            "GenShield blocked this response because it may disclose protected company information. "
            "A security analyst can review the related detection metadata."
        )

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
        conversation.title = payload.prompt.strip()[:80]

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
        decision=Decision(outcome.decision),
        matched_source=outcome.matched_document.title if outcome.matched_document else None,
        lineage_tag=outcome.matched_document.lineage_tag if outcome.matched_document else None,
        matched_facts=outcome.matched_facts,
    )
    return ChatExchangeResponse(
        conversation=_to_conversation_read(refreshed_conversation),
        user_message=ChatMessageRead.model_validate(user_message),
        assistant_message=ChatMessageRead.model_validate(assistant_message),
        security_analysis=analysis,
    )
