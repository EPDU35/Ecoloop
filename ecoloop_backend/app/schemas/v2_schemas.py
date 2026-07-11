import uuid
from pydantic import BaseModel, Field


class PurchaseOfferCreateSchema(BaseModel):
    price_per_kg: float = Field(gt=0, le=100000)


class VerifyWeightSchema(BaseModel):
    actual_weight_kg: float = Field(gt=0, le=50000)
    verification_method: str = Field(min_length=3, max_length=50)  # MANUAL, BLUETOOTH_SCALE...
    verification_photo_url: str | None = Field(default=None, max_length=500)
    arrival_status: str = Field(default="COLLECTED")  # ARRIVED, ABSENT, REFUSED, COLLECTED


class CollectionMissionCreateSchema(BaseModel):
    collector_id: uuid.UUID
    zone: str = Field(min_length=2, max_length=255)
    capacity_kg: float = Field(gt=0, le=100000)
    center_lat: float = Field(ge=-90, le=90)
    center_lng: float = Field(ge=-180, le=180)
    radius_km: float = Field(gt=0, le=500)
    idempotency_key: str = Field(min_length=5, max_length=255)


class EcoPointsWithdrawalSchema(BaseModel):
    amount: float = Field(gt=0, le=1000000)
    phone: str = Field(min_length=8, max_length=20)
    idempotency_key: str = Field(min_length=5, max_length=255)


class DisputeCreateSchema(BaseModel):
    transaction_id: uuid.UUID
    reason: str = Field(min_length=3, max_length=100)  # WEIGHT_DIFFERENCE, WRONG_MATERIAL...


class DisputeResolveSchema(BaseModel):
    status: str = Field(min_length=3, max_length=50)  # RESOLVED or DISMISSED
    details: str = Field(min_length=5, max_length=1000)
