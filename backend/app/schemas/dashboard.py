from pydantic import BaseModel

from app.models.enums import Decision


class RecentDetection(BaseModel):
    request_id: str
    risk_score: int
    decision: Decision
    created_at: str


class DashboardResponse(BaseModel):
    total_requests: int
    allowed_responses: int
    warnings: int
    blocked_responses: int
    average_risk_score: float
    recent_detections: list[RecentDetection]
