from __future__ import annotations
import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Numeric, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.waste import WasteLot


class MatchingDecision(Base):
    __tablename__ = "matching_decisions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    lot_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("waste_lots.id", ondelete="CASCADE"), nullable=False, index=True)
    collector_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    distance_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    reliability_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    capacity_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    availability_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    experience_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)

    final_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    selected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    decision_explanation: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relations SQLAlchemy
    lot: Mapped["WasteLot"] = relationship("WasteLot", foreign_keys=[lot_id])
    collector: Mapped["User"] = relationship("User", foreign_keys=[collector_id])
