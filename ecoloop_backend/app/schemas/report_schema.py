from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, HttpUrl


class IllegalDumpReportCreate(BaseModel):
    latitude: float = Field(..., description="Latitude of the illegal dump")
    longitude: float = Field(..., description="Longitude of the illegal dump")
    address: Optional[str] = Field(None, description="Optional address of the location")
    description: Optional[str] = Field(None, description="Description of the waste")
    estimated_volume_m3: Optional[float] = Field(None, description="Estimated volume in cubic meters")
    photo_url: str = Field(..., description="URL of the uploaded photo from Cloudinary")


class IllegalDumpReportOut(BaseModel):
    id: UUID
    reporter_id: Optional[UUID]
    latitude: float
    longitude: float
    address: Optional[str]
    description: Optional[str]
    photo_url: str
    estimated_volume_m3: Optional[float]
    status: str
    ai_confidence_score: Optional[float]
    ai_tags: Optional[dict]
    reward_awarded: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class IllegalDumpValidationStatus(BaseModel):
    status: str = Field(..., description="New status, e.g., VERIFIED, REJECTED, CLEANED")
    reward_points: Optional[int] = Field(None, description="Points to award if VERIFIED")
