from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.audit_log import AuditLog
from app.models.enums import Decision

settings = get_settings()


class AuditService:
    async def create(
        self,
        db: AsyncSession,
        request_id: str,
        user_id: int | None,
        prompt: str,
        generated_response: str,
        risk_score: int,
        decision: Decision,
    ) -> AuditLog:
        entry = AuditLog(
            request_id=request_id,
            user_id=user_id,
            prompt=prompt,
            generated_response=generated_response if settings.log_generated_response else "[redacted]",
            risk_score=risk_score,
            decision=decision,
        )
        db.add(entry)
        await db.flush()
        return entry
