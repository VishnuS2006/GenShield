from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import Decision


class DetectionResult(Base):
    __tablename__ = "detection_results"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    request_id: Mapped[str] = mapped_column(String(36), unique=True, index=True, nullable=False)
    similarity_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    factual_overlap_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    facts_matched: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    facts_total: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    sensitivity_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    risk_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    decision: Mapped[Decision] = mapped_column(Enum(Decision), nullable=False)
    matched_document_id: Mapped[Optional[int]] = mapped_column(ForeignKey("protected_documents.id"), nullable=True)
    matched_facts: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    matched_document = relationship("ProtectedDocument")
    lineage_records = relationship("DataLineage", back_populates="detection_result")
