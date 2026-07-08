import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.notification import NotificationType


class NotificationOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    content: str
    type: NotificationType
    entity_type: str | None
    entity_id: uuid.UUID | None
    is_read: bool
    read_at: datetime | None
    created_at: datetime
