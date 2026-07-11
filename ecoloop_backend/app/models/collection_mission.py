from __future__ import annotations
import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base
from app.models.user import User
from app.models.waste import WasteLot


class MissionStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class MissionLotStatus(str, enum.Enum):
    ASSIGNED = "ASSIGNED"
    COLLECTED = "COLLECTE"
    FAILED = "FAILED"
    MISSED = "MISSED"
    CANCELLED = "CANCELLED"


class ArrivalStatus(str, enum.Enum):
    WAITING = "WAITING"
    ARRIVED = "ARRIVED"
    ABSENT = "ABSENT"
    REFUSED = "REFUSED"
    COLLECTED = "COLLECTED"


class MissionLot(Base):
    __tablename__ = "mission_lots"

    mission_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("collection_missions.id", ondelete="CASCADE"), primary_key=True
    )
    lot_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("waste_lots.id", ondelete="CASCADE"), primary_key=True
    )

    sequence_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[MissionLotStatus] = mapped_column(
        Enum(MissionLotStatus), default=MissionLotStatus.ASSIGNED, nullable=False
    )
    arrival_status: Mapped[ArrivalStatus] = mapped_column(
        Enum(ArrivalStatus), default=ArrivalStatus.WAITING, nullable=False
    )

    # Relations SQLAlchemy
    mission: Mapped[CollectionMission] = relationship("CollectionMission", back_populates="mission_lots")
    lot: Mapped[WasteLot] = relationship("WasteLot")


class CollectionMission(Base):
    __tablename__ = "collection_missions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    collector_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    creator_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_collector_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    hub_id: Mapped[uuid.UUID | None] = mapped_column(nullable=True)

    status: Mapped[MissionStatus] = mapped_column(Enum(MissionStatus), default=MissionStatus.PENDING, nullable=False, index=True)
    zone: Mapped[str] = mapped_column(String(255), nullable=False)
    capacity_kg: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    center_lat: Mapped[float] = mapped_column(Float, nullable=False)
    center_lng: Mapped[float] = mapped_column(Float, nullable=False)
    radius_km: Mapped[float] = mapped_column(Float, default=5.0, nullable=False)

    idempotency_key: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)

    assigned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relations SQLAlchemy
    collector: Mapped[User] = relationship("User", foreign_keys=[collector_id])
    creator: Mapped[User] = relationship("User", foreign_keys=[creator_id])
    assigned_collector: Mapped[User | None] = relationship("User", foreign_keys=[assigned_collector_id])
    mission_lots: Mapped[list[MissionLot]] = relationship("MissionLot", back_populates="mission")
