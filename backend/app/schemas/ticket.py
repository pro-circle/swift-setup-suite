"""Pydantic schemas: the backend is the final authority on validation."""

from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class Priority(str, Enum):
    low = "Low"
    medium = "Medium"
    high = "High"


class Status(str, Enum):
    open = "Open"
    in_progress = "In Progress"
    resolved = "Resolved"


class TicketCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1)
    priority: Priority


class TicketUpdate(BaseModel):
    """Status and/or priority can be changed after creation."""

    status: Status | None = None
    priority: Priority | None = None


class TicketOut(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    description: str
    priority: Priority
    status: Status
    created_at: datetime
    updated_at: datetime
