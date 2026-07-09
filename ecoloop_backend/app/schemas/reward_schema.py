import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.reward_transaction import RewardAction


class RewardTransactionOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    collection_id: uuid.UUID | None
    action: RewardAction
    points: int
    balance_after: int
    created_at: datetime


class RewardOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    total_kg_recycled: float
    points: int
    level: str
    updated_at: datetime
