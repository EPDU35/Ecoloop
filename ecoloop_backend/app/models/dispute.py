from __future__ import annotations
import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base
from app.models.user import User
from app.models.transaction import Transaction


class DisputeReason(str, enum.Enum):
    WEIGHT_DIFFERENCE = "WEIGHT_DIFFERENCE"
    WRONG_MATERIAL = "WRONG_MATERIAL"
    COLLECTION_FAILED = "COLLECTION_FAILED"
    PAYMENT_DELAY = "PAYMENT_DELAY"


class DisputeStatus(str, enum.Enum):
    OPEN = "OPEN"
    UNDER_REVIEW = "UNDER_REVIEW"
    RESOLVED = "RESOLVED"
    DISMISSED = "DISMISSED"


class Dispute(Base):
    __tablename__ = "disputes"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    transaction_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False, index=True)
    opened_by_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    reason: Mapped[DisputeReason] = mapped_column(Enum(DisputeReason), nullable=False)
    status: Mapped[DisputeStatus] = mapped_column(Enum(DisputeStatus), default=DisputeStatus.OPEN, nullable=False, index=True)

    resolution_details: Mapped[str | None] = mapped_column(Text, nullable=True)
    resolved_by_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relations SQLAlchemy
    transaction: Mapped[Transaction] = relationship("Transaction", foreign_keys=[transaction_id])
    opened_by: Mapped[User] = relationship("User", foreign_keys=[opened_by_id])
    resolved_by: Mapped[User | None] = relationship("User", foreign_keys=[resolved_by_id])
