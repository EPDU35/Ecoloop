import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.config.database import Base


class CollectorStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    BUSY = "BUSY"
    OFFLINE = "OFFLINE"
    SUSPENDED = "SUSPENDED"


class VerificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"


class CollectorProfile(Base):
    __tablename__ = "collector_profiles"

    # La clé primaire est aussi la clé étrangère vers users (relation 1-to-1)
    id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True, index=True
    )

    status: Mapped[CollectorStatus] = mapped_column(
        Enum(CollectorStatus), default=CollectorStatus.AVAILABLE, nullable=False
    )
    status_updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    verification_status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus), default=VerificationStatus.PENDING, nullable=False
    )

    vehicle_capacity_kg: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    vehicle_type: Mapped[str | None] = mapped_column(String(50), nullable=True)

    service_radius_km: Mapped[float] = mapped_column(Float, default=15.0, nullable=False)

    # Réputation et performance
    average_rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    completed_collections_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_collections_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
