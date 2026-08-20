from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.enums import UserRole


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=255)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    is_active: bool
    role: UserRole
    created_at: datetime
    updated_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class UserProfileSummary(BaseModel):
    user: UserRead
    request_count: int
    detection_count: int
    last_activity_at: datetime | None = None


class DetectionSettingsRead(BaseModel):
    similarity_warn_threshold: float
    similarity_block_threshold: float
    risk_warn_threshold: int
    risk_block_threshold: int
    factual_overlap_mode: str
    embedding_model: str


class SettingsRead(BaseModel):
    account: UserRead
    security: dict[str, str]
    detection: DetectionSettingsRead
