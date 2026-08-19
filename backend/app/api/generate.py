from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.detection_result import DetectionResult
from app.models.enums import Decision
from app.models.protected_document import ProtectedDocument
from app.models.user import User
from app.schemas.detection import SecurityAnalysis
from app.schemas.generate import GenerateRequest, GenerateResponse
from app.services.audit_service import AuditService
from app.services.detection_service import DetectionService
from app.services.lineage_service import LineageService
from app.services.llm_service import get_llm_provider
from app.services.retrieval_service import RetrievalService
from app.utils.helpers import new_request_id

router = APIRouter(prefix="/api/generate", tags=["generate"])


@router.post("", response_model=GenerateResponse)
async def generate(
    payload: GenerateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GenerateResponse:
    documents = list(
        await db.scalars(select(ProtectedDocument).options(selectinload(ProtectedDocument.facts)))
    )
    retrieved = RetrievalService().retrieve(payload.prompt, documents)
    context = "\n".join(
        f"- {match.document.title}: {match.document.content}" for match in retrieved
    )
    generated_response = await get_llm_provider().generate_response(payload.prompt, context)
    request_id = new_request_id()
    relevant_docs = [match.document for match in retrieved] or documents
    outcome = DetectionService().analyze(generated_response, relevant_docs)
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
    await db.commit()
    return GenerateResponse(
        request_id=request_id,
        prompt=payload.prompt,
        generated_response=generated_response,
        security_analysis=SecurityAnalysis(
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
        ),
    )
