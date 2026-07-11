import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, text
from sqlalchemy.orm import Mapped, mapped_column

from app.config.database import Base


class RewardAction(str, enum.Enum):
    COLLECTION_COMPLETED = "COLLECTION_COMPLETED"
    SIGNUP_BONUS = "SIGNUP_BONUS"
    REFERRAL = "REFERRAL"
    PENALTY = "PENALTY"
    ILLEGAL_DUMP_REPORT = "ILLEGAL_DUMP_REPORT"
    ADMIN_ADJUSTMENT = "ADMIN_ADJUSTMENT"


class RewardTransaction(Base):
    __tablename__ = "reward_transactions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    collection_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("collections.id", ondelete="SET NULL"), nullable=True, index=True
    )

    action: Mapped[RewardAction] = mapped_column(Enum(RewardAction), nullable=False)
    points: Mapped[int] = mapped_column(Integer, nullable=False)
    balance_after: Mapped[int] = mapped_column(Integer, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    __table_args__ = (
        Index(
            "uq_reward_transaction_collection_completed",
            "collection_id",
            postgresql_where=text("action = 'COLLECTION_COMPLETED'"),
            unique=True,
        ),
    )
