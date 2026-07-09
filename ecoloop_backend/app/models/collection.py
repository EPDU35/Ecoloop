import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.config.database import Base
from app.models.user import UserRole


class CollectionStatus(str, enum.Enum):
    RESERVEE = "RESERVEE"
    EN_ROUTE = "EN_ROUTE"
    VALIDEE = "VALIDEE"
    ANNULEE = "ANNULEE"


class Collection(Base):
    __tablename__ = "collections"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    waste_lot_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("waste_lots.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    collector_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    status: Mapped[CollectionStatus] = mapped_column(Enum(CollectionStatus), default=CollectionStatus.RESERVEE, nullable=False)

    # Preuve de collecte : code QR scanné + poids réel mesuré (peut différer de l'annonce).
    validation_code_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    actual_weight_kg: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    estimated_weight_kg: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    weight_verified_by: Mapped[UserRole | None] = mapped_column(Enum(UserRole), nullable=True)
    weight_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    reserved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    validated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
