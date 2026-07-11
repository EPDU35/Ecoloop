from __future__ import annotations
import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base
from app.models.user import User


class CollectorStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    BUSY = "BUSY"
    OFFLINE = "OFFLINE"
    SUSPENDED = "SUSPENDED"


class VerificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"


class CollectorType(str, enum.Enum):
    COLLECTOR_INTERNAL = "COLLECTOR_INTERNAL"
    COLLECTOR_PARTNER = "COLLECTOR_PARTNER"


class CollectorProfile(Base):
    __tablename__ = "collector_profiles"

    # La clé primaire est aussi la clé étrangère vers users (relation 1-to-1)
    id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True, index=True
    )

    collector_type: Mapped[CollectorType] = mapped_column(
        Enum(CollectorType), default=CollectorType.COLLECTOR_PARTNER, nullable=False
    )
    company_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    status: Mapped[CollectorStatus] = mapped_column(
        Enum(CollectorStatus), default=CollectorStatus.AVAILABLE, nullable=False
    )
    status_updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )

    verification_status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus), default=VerificationStatus.PENDING, nullable=False
    )
    identity_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    vehicle_capacity_kg: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    vehicle_type: Mapped[str | None] = mapped_column(String(50), nullable=True)

    service_radius_km: Mapped[float] = mapped_column(Float, default=15.0, nullable=False)
    coverage_zone: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Réputation et performance
    average_rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    completed_collections_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_collections_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # V3.4 trust ciblé et performance
    collector_reliability_score: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    reputation_score: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    completed_missions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    partner_since: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    new_partner_boost: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    earnings_history: Mapped[str | None] = mapped_column(String(2000), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relations SQLAlchemy
    user: Mapped[User] = relationship("User", foreign_keys=[id])
    company: Mapped[User | None] = relationship("User", foreign_keys=[company_id])
