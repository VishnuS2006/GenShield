from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.audit_log import AuditLog
from app.models.enums import Decision
from app.models.user import User
from app.schemas.history import HistoryRecord

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("", response_model=list[HistoryRecord])
async def history(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    decision: Decision | None = None,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[AuditLog]:
    query = select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).offset(offset)
    if decision:
        query = query.where(AuditLog.decision == decision)
    result = await db.scalars(query)
    return list(result)
