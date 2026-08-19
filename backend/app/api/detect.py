from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.detection_result import DetectionResult
from app.models.enums import Decision, UserRole
from app.models.protected_document import ProtectedDocument
from app.models.user import User
from app.schemas.detection import DetectRequest, DetectResponse, SecurityAnalysis
from app.services.audit_service import AuditService
from app.services.detection_service import DetectionService
from app.services.lineage_service import LineageService
from app.utils.helpers import new_request_id

router = APIRouter(prefix="/api/detect", tags=["detect"])


@router.post("", response_model=DetectResponse)
async def detect(
    payload: DetectRequest,
    user: User = Depends(require_roles(UserRole.SECURITY_ANALYST, UserRole.ADMINISTRATOR)),
    db: AsyncSession = Depends(get_db),
) -> DetectResponse:
    query = select(ProtectedDocument).options(selectinload(ProtectedDocument.facts))
    if payload.document_ids:
        query = query.where(ProtectedDocument.id.in_(payload.document_ids))
    documents = list(await db.scalars(query))
    request_id = new_request_id()
    outcome = DetectionService().analyze(payload.generated_response, documents)
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
        prompt="[detect-only]",
        generated_response=payload.generated_response,
        risk_score=outcome.risk_score,
        decision=Decision(outcome.decision),
    )
    await db.commit()
    return DetectResponse(
        request_id=request_id,
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
