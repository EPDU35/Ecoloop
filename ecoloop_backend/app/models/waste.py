import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.config.database import Base


class WasteCategory(str, enum.Enum):
    PLASTIQUE = "PLASTIQUE"
    CARTON = "CARTON"
    METAL = "METAL"
    VERRE = "VERRE"
    ORGANIQUE = "ORGANIQUE"
    ELECTRONIQUE = "ELECTRONIQUE"
    AUTRE = "AUTRE"


class LotStatus(str, enum.Enum):
    DISPONIBLE = "DISPONIBLE"
    RESERVE = "RESERVE"
    COLLECTE = "COLLECTE"
    ANNULE = "ANNULE"


class WasteLot(Base):
    __tablename__ = "waste_lots"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    # Clé étrangère explicite : garantit l'intégrité référentielle au niveau DB,
    # pas seulement au niveau applicatif.
    producer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    collector_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    category: Mapped[WasteCategory] = mapped_column(Enum(WasteCategory), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    weight_kg: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    price_per_kg: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    # L'URL de la photo est stockée ici, jamais le binaire (voir dossier technique : Cloudinary).
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    latitude: Mapped[float] = mapped_column(Numeric(9, 6), nullable=False)
    longitude: Mapped[float] = mapped_column(Numeric(9, 6), nullable=False)

    status: Mapped[LotStatus] = mapped_column(Enum(LotStatus), default=LotStatus.DISPONIBLE, nullable=False, index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
