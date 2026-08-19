from sqlalchemy.ext.asyncio import AsyncSession

from app.models.data_lineage import DataLineage
from app.models.detection_result import DetectionResult
from app.models.protected_document import ProtectedDocument


class LineageService:
    async def create(
        self,
        db: AsyncSession,
        request_id: str,
        detection_result: DetectionResult,
        document: ProtectedDocument | None,
        similarity_score: float,
    ) -> DataLineage | None:
        if not document:
            return None
        lineage = DataLineage(
            request_id=request_id,
            detection_result_id=detection_result.id,
            protected_document_id=document.id,
            lineage_tag=document.lineage_tag,
            similarity_score=similarity_score,
        )
        db.add(lineage)
        await db.flush()
        return lineage
