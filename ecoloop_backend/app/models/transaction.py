from __future__ import annotations
import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base
from app.models.user import User
from app.models.waste import WasteLot
from app.models.collection import Collection
from app.models.pricing_rule import PricingRule


class TransactionStatus(str, enum.Enum):
    EN_ATTENTE = "EN_ATTENTE"
    PAYEE = "PAYEE"
    ECHOUEE = "ECHOUEE"
    REMBOURSEE = "REMBOURSEE"


class PaymentMethod(str, enum.Enum):
    MOBILE_MONEY = "MOBILE_MONEY"
    ESPECES = "ESPECES"
    VIREMENT = "VIREMENT"


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    # V1 columns (nullable to support both versions)
    collection_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("collections.id", ondelete="CASCADE"), nullable=True, unique=True, index=True)
    producer_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=True, index=True)
    collector_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=True, index=True)

    gross_amount: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)   # poids × prix/kg
    commission_amount: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    net_amount: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)     # montant réellement payé

    payment_method: Mapped[PaymentMethod | None] = mapped_column(Enum(PaymentMethod), nullable=True)
    status: Mapped[TransactionStatus] = mapped_column(Enum(TransactionStatus), default=TransactionStatus.EN_ATTENTE, nullable=False, index=True)

    external_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # V3.4 columns
    lot_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("waste_lots.id", ondelete="CASCADE"), nullable=True, index=True)
    company_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=True, index=True)
    household_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=True, index=True)
    pricing_rule_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("pricing_rules.id", ondelete="SET NULL"), nullable=True, index=True)

    material: Mapped[str | None] = mapped_column(String(50), nullable=True)
    price_per_kg_applied: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    weight_applied: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    amount_paid_by_company: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    ecoloop_commission: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    household_reward: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)

    guarantee_status: Mapped[str | None] = mapped_column(String(50), default="NOT_GUARANTEED", nullable=True)
    guarantee_provider: Mapped[str | None] = mapped_column(String(50), default="DIRECT_PAYMENT", nullable=True)

    payment_provider: Mapped[str | None] = mapped_column(String(100), nullable=True)
    payment_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    payment_status: Mapped[str | None] = mapped_column(String(50), default="PENDING", nullable=True)
    idempotency_key: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relations SQLAlchemy
    collection: Mapped[Collection | None] = relationship("Collection", foreign_keys=[collection_id])
    producer: Mapped[User | None] = relationship("User", foreign_keys=[producer_id])
    collector: Mapped[User | None] = relationship("User", foreign_keys=[collector_id])
    lot: Mapped[WasteLot | None] = relationship("WasteLot", foreign_keys=[lot_id])
    company: Mapped[User | None] = relationship("User", foreign_keys=[company_id])
    household: Mapped[User | None] = relationship("User", foreign_keys=[household_id])
