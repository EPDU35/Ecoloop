import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.config.database import Base


class ReportStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    CLEANED = "CLEANED"


class IllegalDumpReport(Base):
    __tablename__ = "illegal_dump_reports"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    
    reporter_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Location
    latitude: Mapped[float] = mapped_column(Numeric(9, 6), nullable=False)
    longitude: Mapped[float] = mapped_column(Numeric(9, 6), nullable=False)
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    # Details
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    photo_url: Mapped[str] = mapped_column(String(500), nullable=False)
    estimated_volume_m3: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    
    # System/AI
    status: Mapped[ReportStatus] = mapped_column(Enum(ReportStatus), default=ReportStatus.PENDING, nullable=False, index=True)
    ai_confidence_score: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    ai_tags: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    # Rewards
    reward_awarded: Mapped[int] = mapped_column(default=0, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )
