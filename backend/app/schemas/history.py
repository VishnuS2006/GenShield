from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import Decision


class HistoryRecord(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    request_id: str
    prompt: str
    generated_response: str
    risk_score: int
    decision: Decision
    created_at: datetime
