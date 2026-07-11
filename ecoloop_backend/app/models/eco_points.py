from __future__ import annotations
import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base
from app.models.user import User
from app.models.transaction import Transaction


class TransactionType(str, enum.Enum):
    LOT_PAYMENT = "LOT_PAYMENT"
    WITHDRAW = "WITHDRAW"
    BONUS = "BONUS"
    PENALTY = "PENALTY"


class EcoPointStatus(str, enum.Enum):
    PENDING = "PENDING"
    AVAILABLE = "AVAILABLE"
    LOCKED = "LOCKED"
    USED = "USED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"


class EcoPointAccount(Base):
    __tablename__ = "eco_point_accounts"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)

    eco_points_balance_cache: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relations SQLAlchemy
    user: Mapped[User] = relationship("User", foreign_keys=[user_id])
    transactions: Mapped[list[EcoPointTransaction]] = relationship("EcoPointTransaction", back_populates="account")


class EcoPointTransaction(Base):
    __tablename__ = "eco_point_transactions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    account_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("eco_point_accounts.id", ondelete="CASCADE"), index=True, nullable=False)

    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    type: Mapped[TransactionType] = mapped_column(Enum(TransactionType), nullable=False)
    status: Mapped[EcoPointStatus] = mapped_column(Enum(EcoPointStatus), default=EcoPointStatus.PENDING, nullable=False)

    related_transaction_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True)
    idempotency_key: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relations SQLAlchemy
    account: Mapped[EcoPointAccount] = relationship("EcoPointAccount", back_populates="transactions")
