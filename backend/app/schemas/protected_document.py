from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import SensitivityLevel


class ProtectedFactCreate(BaseModel):
    fact_type: str = Field(min_length=1, max_length=100)
    fact_value: str = Field(min_length=1)
    importance: int = Field(ge=1, le=5)


class ProtectedFactRead(ProtectedFactCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class ProtectedDocumentBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    department: str = Field(min_length=1, max_length=100)
    content: str = Field(min_length=1)
    sensitivity: SensitivityLevel
    lineage_tag: str = Field(min_length=1, max_length=100)


class ProtectedDocumentCreate(ProtectedDocumentBase):
    facts: list[ProtectedFactCreate]


class ProtectedDocumentUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    department: Optional[str] = Field(default=None, min_length=1, max_length=100)
    content: Optional[str] = Field(default=None, min_length=1)
    sensitivity: Optional[SensitivityLevel] = None
    lineage_tag: Optional[str] = Field(default=None, min_length=1, max_length=100)
    facts: Optional[list[ProtectedFactCreate]] = None


class ProtectedDocumentRead(ProtectedDocumentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
    facts: list[ProtectedFactRead]
