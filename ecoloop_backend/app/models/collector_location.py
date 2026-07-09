import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column

from app.config.database import Base


class CollectorLocation(Base):
    __tablename__ = "collector_locations"

    collector_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True, index=True
    )

    latitude: Mapped[float] = mapped_column(Numeric(9, 6), nullable=False)
    longitude: Mapped[float] = mapped_column(Numeric(9, 6), nullable=False)
    accuracy_meters: Mapped[float | None] = mapped_column(Float, nullable=True)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), index=True
    )
