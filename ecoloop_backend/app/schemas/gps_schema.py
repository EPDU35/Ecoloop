import uuid
from datetime import datetime
from pydantic import BaseModel, Field


class GpsUpdateSchema(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    accuracy_meters: float | None = Field(default=None, ge=0)


class GpsOutSchema(BaseModel):
    collector_id: uuid.UUID
    latitude: float
    longitude: float
    accuracy_meters: float | None
    updated_at: datetime

    class Config:
        from_attributes = True
