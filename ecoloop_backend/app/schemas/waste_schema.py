import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.collection import CollectionStatus
from app.models.waste import LotStatus, WasteCategory


class WasteLotCreateSchema(BaseModel):
    category: WasteCategory
    description: str | None = Field(default=None, max_length=1000)
    weight_kg: float = Field(gt=0, le=50000)
    price_per_kg: float = Field(gt=0, le=1_000_000)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)

    @field_validator("description")
    @classmethod
    def strip_description(cls, v: str | None) -> str | None:
        return v.strip() if v else v


class WasteLotUpdateSchema(BaseModel):
    description: str | None = Field(default=None, max_length=1000)
    weight_kg: float | None = Field(default=None, gt=0, le=50000)
    price_per_kg: float | None = Field(default=None, gt=0, le=1_000_000)


class WasteLotOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    producer_id: uuid.UUID
    collector_id: uuid.UUID | None
    category: WasteCategory
    description: str | None
    weight_kg: float
    price_per_kg: float
    photo_url: str | None
    latitude: float
    longitude: float
    status: LotStatus
    created_at: datetime


class CollectionReserveSchema(BaseModel):
    waste_lot_id: uuid.UUID


class CollectionValidateSchema(BaseModel):
    validation_code: str = Field(min_length=4, max_length=10)
    actual_weight_kg: float = Field(gt=0, le=50000)


class CollectionOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    waste_lot_id: uuid.UUID
    collector_id: uuid.UUID
    status: CollectionStatus
    actual_weight_kg: float | None
    reserved_at: datetime
    validated_at: datetime | None
