from __future__ import annotations
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base, is_sqlite
from app.models.user import User

# Support PostGIS on PostgreSQL
if not is_sqlite:
    from geoalchemy2 import Geography
    location_type: Any = Geography(geometry_type='POINT', srid=4326)
else:
    location_type = Float  # Fallback type


class UserLocation(Base):
    __tablename__ = "user_locations"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    
    # PostGIS native column (PostgreSQL only)
    location: Mapped[Any | None] = mapped_column(location_type, nullable=True, index=True)

    accuracy: Mapped[float | None] = mapped_column(Float, nullable=True)
    battery_level: Mapped[int | None] = mapped_column(Integer, nullable=True)
    network_type: Mapped[str | None] = mapped_column(String(50), nullable=True)

    source: Mapped[str] = mapped_column(String(50), default="GPS", nullable=False)  # GPS, MANUAL, IMPORTED
    is_current: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relations SQLAlchemy
    user: Mapped[User] = relationship("User", foreign_keys=[user_id])
