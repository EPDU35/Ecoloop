import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, String, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base
from app.models.user import User


class EvidenceType(str, enum.Enum):
    WEIGHT_PHOTO = "WEIGHT_PHOTO"
    QUALITY_PHOTO = "QUALITY_PHOTO"
    GPS_PROOF = "GPS_PROOF"
    USER_CONFIRMATION = "USER_CONFIRMATION"


class VerificationEvidence(Base):
    __tablename__ = "verification_evidences"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # ex: waste_lots, reports
    entity_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)

    type: Mapped[EvidenceType] = mapped_column(Enum(EvidenceType), nullable=False)
    file_url: Mapped[str] = mapped_column(String(500), nullable=False)
    file_hash: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)

    uploaded_by_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relations SQLAlchemy
    uploaded_by: Mapped[User] = relationship("User", foreign_keys=[uploaded_by_id])
