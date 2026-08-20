from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import Decision, MessageRole
from app.schemas.detection import SecurityAnalysis


class ChatConversationCreate(BaseModel):
    title: str = Field(default="New conversation", min_length=1, max_length=255)


class ChatConversationUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=255)


class ChatPromptRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=4000)


class ChatMessageUpdate(BaseModel):
    content: str = Field(min_length=1, max_length=4000)


class ChatMessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: MessageRole
    content: str
    request_id: str | None = None
    decision: Decision | None = None
    risk_score: int | None = None
    risk_level: str | None = None
    similarity_score: float | None = None
    matched_source: str | None = None
    lineage_tag: str | None = None
    created_at: datetime


class ChatConversationListItem(BaseModel):
    id: int
    title: str
    last_message_preview: str | None = None
    last_decision: Decision | None = None
    updated_at: datetime


class ChatConversationRead(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: list[ChatMessageRead]


class ChatExchangeResponse(BaseModel):
    conversation: ChatConversationRead
    user_message: ChatMessageRead
    assistant_message: ChatMessageRead
    security_analysis: SecurityAnalysis
