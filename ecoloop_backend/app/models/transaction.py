import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.config.database import Base


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

    collection_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("collections.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    producer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    collector_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)

    gross_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)   # poids × prix/kg
    commission_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    net_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)     # montant réellement payé

    payment_method: Mapped[PaymentMethod] = mapped_column(Enum(PaymentMethod), nullable=False)
    status: Mapped[TransactionStatus] = mapped_column(Enum(TransactionStatus), default=TransactionStatus.EN_ATTENTE, nullable=False, index=True)

    # Référence de l'opérateur de paiement (jamais de données de carte/compte en clair).
    external_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
