from __future__ import annotations
import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base
from app.models.user import User
from app.models.waste import WasteLot


class OfferStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"


class PurchaseOffer(Base):
    __tablename__ = "purchase_offers"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    lot_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("waste_lots.id", ondelete="CASCADE"), nullable=False, index=True)
    company_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    price_per_kg: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    initial_price_per_kg: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    final_price_per_kg: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    modified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    status: Mapped[OfferStatus] = mapped_column(Enum(OfferStatus), default=OfferStatus.PENDING, nullable=False, index=True)
    currency: Mapped[str] = mapped_column(String(10), default="XOF", nullable=False)
    idempotency_key: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)

    accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    accepted_by_user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relations SQLAlchemy
    lot: Mapped[WasteLot] = relationship("WasteLot", foreign_keys=[lot_id])
    company: Mapped[User] = relationship("User", foreign_keys=[company_id])
    accepted_by_user: Mapped[User | None] = relationship("User", foreign_keys=[accepted_by_user_id])
