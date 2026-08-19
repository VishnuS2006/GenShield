from pydantic import BaseModel, Field

from app.schemas.detection import SecurityAnalysis


class GenerateRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=4000)
    scenario: str | None = None


class GenerateResponse(BaseModel):
    request_id: str
    prompt: str
    generated_response: str
    security_analysis: SecurityAnalysis
