import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.models.user import UserRole


class ReviewCreateSchema(BaseModel):
    collection_id: uuid.UUID
    reviewed_id: uuid.UUID
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=1000)


class ReviewOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    collection_id: uuid.UUID
    reviewer_id: uuid.UUID
    reviewed_id: uuid.UUID
    reviewer_role: UserRole
    rating: int
    comment: str | None
    created_at: datetime
