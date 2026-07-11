from __future__ import annotations
import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base
from app.models.user import User


class WasteCategory(str, enum.Enum):
    PLASTIQUE = "PLASTIQUE"
    CARTON = "CARTON"
    METAL = "METAL"
    VERRE = "VERRE"
    ORGANIQUE = "ORGANIQUE"
    ELECTRONIQUE = "ELECTRONIQUE"
    AUTRE = "AUTRE"


class LotStatus(str, enum.Enum):
    CREATED = "CREATED"
    DISPONIBLE = "DISPONIBLE"
    OFFER_RECEIVED = "OFFER_RECEIVED"
    ACCEPTED = "ACCEPTED"
    EN_MISSION = "EN_MISSION"
    COLLECTE = "COLLECTE"
    QUALITY_CHECK = "QUALITY_CHECK"
    PAYE = "PAYE"
    ANNULE = "ANNULE"
    EXPIRED = "EXPIRED"
    SUSPENDED = "SUSPENDED"


class WasteLot(Base):
    __tablename__ = "waste_lots"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    producer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    collector_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    category: Mapped[WasteCategory] = mapped_column(Enum(WasteCategory), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    weight_kg: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)  # Map sur estimated_weight_kg dans le code
    estimated_weight_kg: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0, nullable=False)
    actual_weight_kg: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)

    price_per_kg: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    latitude: Mapped[float] = mapped_column(Numeric(9, 6), nullable=False)
    longitude: Mapped[float] = mapped_column(Numeric(9, 6), nullable=False)

    status: Mapped[LotStatus] = mapped_column(Enum(LotStatus), default=LotStatus.DISPONIBLE, nullable=False, index=True)

    # Audits et validation
    quality_status: Mapped[str | None] = mapped_column(String(50), default="PENDING", nullable=True)
    quality_verified_by_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    quality_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    verification_method: Mapped[str | None] = mapped_column(String(50), nullable=True)  # MANUAL | BLUETOOTH_SCALE...
    weight_verified_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    verification_photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relations SQLAlchemy
    producer: Mapped[User] = relationship("User", foreign_keys=[producer_id])
    collector: Mapped[User | None] = relationship("User", foreign_keys=[collector_id])
    quality_verifier: Mapped[User | None] = relationship("User", foreign_keys=[quality_verified_by_id])
    weight_verifier: Mapped[User | None] = relationship("User", foreign_keys=[weight_verified_by])
