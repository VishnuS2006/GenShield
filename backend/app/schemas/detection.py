from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import Decision, SensitivityLevel


class SecurityAnalysis(BaseModel):
    similarity_score: float
    facts_matched: int
    facts_total: int
    factual_overlap_score: float
    sensitivity: Optional[SensitivityLevel] = None
    risk_score: int
    decision: Decision
    matched_source: Optional[str] = None
    lineage_tag: Optional[str] = None
    matched_facts: list[str] = Field(default_factory=list)


class DetectRequest(BaseModel):
    generated_response: str = Field(min_length=1)
    document_ids: list[int] = Field(default_factory=list)


class DetectResponse(BaseModel):
    request_id: str
    security_analysis: SecurityAnalysis


class DetectionResultRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    request_id: str
    similarity_score: float
    factual_overlap_score: float
    facts_matched: int
    facts_total: int
    sensitivity_score: int
    risk_score: int
    decision: Decision
    matched_document_id: Optional[int] = None
    matched_facts: list[str]
    created_at: datetime
