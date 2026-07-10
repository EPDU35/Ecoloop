import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Enum, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.config.database import Base

class AIModelStatus(str, enum.Enum):
    TRAINING = "TRAINING"
    STAGING = "STAGING"
    PRODUCTION = "PRODUCTION"
    ARCHIVED = "ARCHIVED"

class AIModel(Base):
    """Table to store versioned AI models to show professional ML lifecycle."""
    __tablename__ = "ai_models"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    version: Mapped[str] = mapped_column(String(20), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. 'Risk Prediction', 'Waste Classification'
    accuracy: Mapped[float] = mapped_column(Float, nullable=True)
    status: Mapped[AIModelStatus] = mapped_column(Enum(AIModelStatus), default=AIModelStatus.STAGING)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Zone(Base):
    """Table to store geographical zones for predictions."""
    __tablename__ = "zones"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    population: Mapped[int] = mapped_column(Integer, nullable=True)
    risk_level: Mapped[float] = mapped_column(Float, default=0.0) # updated by AI
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class WasteEvent(Base):
    """Historical waste events for AI training/predictions."""
    __tablename__ = "waste_events"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    zone_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("zones.id"), nullable=False)
    producer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=True)
    waste_type: Mapped[str] = mapped_column(String(50), nullable=False)
    weight_kg: Mapped[float] = mapped_column(Float, nullable=False)
    weather_condition: Mapped[str] = mapped_column(String(50), nullable=True) # e.g. Rain, Sunny
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class AIPrediction(Base):
    """Predictions made by the AI engine."""
    __tablename__ = "ai_predictions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    zone_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("zones.id"), nullable=True)
    model_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ai_models.id"), nullable=True)
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    expected_volume: Mapped[float] = mapped_column(Float, nullable=True)
    prediction_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    reason: Mapped[dict] = mapped_column(JSON, nullable=True) # JSON array of reasons
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Recommendation(Base):
    """Actionable recommendations derived from predictions."""
    __tablename__ = "recommendations"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    prediction_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ai_predictions.id"), nullable=False)
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    priority: Mapped[str] = mapped_column(String(20), nullable=False) # LOW, MEDIUM, HIGH, URGENT
    impact_estimated: Mapped[str] = mapped_column(String(255), nullable=True)
    is_applied: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class EnvironmentalMetric(Base):
    """Impact tracking."""
    __tablename__ = "environmental_metrics"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    collection_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("collections.id", ondelete="CASCADE"), nullable=False)
    co2_saved_kg: Mapped[float] = mapped_column(Float, nullable=False)
    water_saved_l: Mapped[float] = mapped_column(Float, nullable=True)
    trees_equivalent: Mapped[float] = mapped_column(Float, nullable=True)
    impact_score: Mapped[float] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
