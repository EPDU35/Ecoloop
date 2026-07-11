from __future__ import annotations
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base
from app.models.user import User


class CompanyProfile(Base):
    __tablename__ = "company_profiles"

    company_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True, index=True
    )

    company_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    license_info: Mapped[str | None] = mapped_column(String(255), nullable=True)
    coverage_zone: Mapped[str | None] = mapped_column(String(255), nullable=True)

    rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    completed_purchases: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    cancelled_purchases: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    average_payment_delay: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    buyer_reliability_score: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relations SQLAlchemy
    user: Mapped[User] = relationship("User", foreign_keys=[company_id])
