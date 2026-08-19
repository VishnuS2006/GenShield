from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.detection_result import DetectionResult
from app.models.enums import Decision, UserRole
from app.models.protected_document import ProtectedDocument
from app.models.user import User
from app.schemas.dashboard import DashboardResponse, RecentDetection

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
async def dashboard(
    _: User = Depends(require_roles(UserRole.SECURITY_ANALYST, UserRole.ADMINISTRATOR)),
    db: AsyncSession = Depends(get_db),
) -> DashboardResponse:
    total_requests = await db.scalar(select(func.count(DetectionResult.id))) or 0
    allowed = await db.scalar(select(func.count()).where(DetectionResult.decision == Decision.ALLOW)) or 0
    warnings = await db.scalar(select(func.count()).where(DetectionResult.decision == Decision.WARN)) or 0
    blocked = await db.scalar(select(func.count()).where(DetectionResult.decision == Decision.BLOCK)) or 0
    average = await db.scalar(select(func.avg(DetectionResult.risk_score))) or 0.0
    protected_sources_count = await db.scalar(select(func.count(ProtectedDocument.id))) or 0

    recent = list(
        await db.scalars(
            select(DetectionResult)
            .options(selectinload(DetectionResult.matched_document))
            .order_by(DetectionResult.created_at.desc())
            .limit(15)
        )
    )
    return DashboardResponse(
        total_requests=total_requests,
        allowed_responses=allowed,
        warnings=warnings,
        blocked_responses=blocked,
        average_risk_score=round(float(average), 2),
        protected_sources_count=protected_sources_count,
        recent_detections=[
            RecentDetection(
                request_id=item.request_id,
                risk_score=item.risk_score,
                decision=item.decision,
                similarity_score=item.similarity_score,
                factual_overlap_score=item.factual_overlap_score,
                facts_matched=item.facts_matched,
                matched_source=item.matched_document.title if item.matched_document else None,
                lineage_tag=item.matched_document.lineage_tag if item.matched_document else None,
                matched_facts=item.matched_facts if isinstance(item.matched_facts, list) else [],
                created_at=item.created_at.isoformat(),
            )
            for item in recent
        ],
    )
