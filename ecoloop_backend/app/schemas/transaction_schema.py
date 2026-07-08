import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.transaction import PaymentMethod, TransactionStatus


class TransactionCreateSchema(BaseModel):
    collection_id: uuid.UUID
    payment_method: PaymentMethod


class TransactionOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    collection_id: uuid.UUID
    producer_id: uuid.UUID
    collector_id: uuid.UUID
    gross_amount: float
    commission_amount: float
    net_amount: float
    payment_method: PaymentMethod
    status: TransactionStatus
    created_at: datetime
    paid_at: datetime | None
