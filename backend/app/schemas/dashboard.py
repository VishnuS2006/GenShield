from pydantic import BaseModel
from app.models.enums import Decision


class RecentDetection(BaseModel):
    request_id: str
    risk_score: int
    decision: Decision
    similarity_score: float | None = None
    factual_overlap_score: float | None = None
    facts_matched: int | None = None
    matched_source: str | None = None
    lineage_tag: str | None = None
    matched_facts: list[str] = []
    created_at: str


class DashboardResponse(BaseModel):
    total_requests: int
    allowed_responses: int
    warnings: int
    blocked_responses: int
    average_risk_score: float
    protected_sources_count: int = 0
    recent_detections: list[RecentDetection]
