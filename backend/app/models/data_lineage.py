from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class DataLineage(Base):
    __tablename__ = "data_lineage"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    request_id: Mapped[str] = mapped_column(String(36), index=True, nullable=False)
    detection_result_id: Mapped[int] = mapped_column(ForeignKey("detection_results.id", ondelete="CASCADE"), nullable=False)
    protected_document_id: Mapped[int] = mapped_column(ForeignKey("protected_documents.id"), nullable=False)
    lineage_tag: Mapped[str] = mapped_column(String(100), nullable=False)
    similarity_score: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    detection_result = relationship("DetectionResult", back_populates="lineage_records")
    protected_document = relationship("ProtectedDocument")
