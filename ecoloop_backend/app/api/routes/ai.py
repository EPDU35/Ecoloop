import logging

from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from pydantic import BaseModel, Field

from app.middlewares.jwt import get_current_user
from app.services.ai_service import ai_service

logger = logging.getLogger("ecoloop.routes.ai")

router = APIRouter(
    prefix="/api/v1/ai",
    tags=["AI"],
    responses={
        400: {"description": "Requête invalide"},
        500: {"description": "Erreur interne"},
        503: {"description": "Service IA non disponible"},
    },
)


class FraudCheckRequest(BaseModel):
    poids: float = Field(..., gt=0)
    prix: float = Field(..., gt=0)
    user_id: str | None = None
    heure: int = 12
    jour_semaine: int = 0


class PricePredictionRequest(BaseModel):
    material: str
    periods: int = 30


class VolumePredictionRequest(BaseModel):
    zone_id: int
    date: str


@router.get("/health")
async def ai_health():
    try:
        return await ai_service.health()
    except Exception as e:
        logger.error(f"AI health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service IA indisponible")


@router.post("/classify")
async def classify_image(file: UploadFile = File(...), _=Depends(get_current_user)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Veuillez envoyer une image valide")
    try:
        return await ai_service.classify_image(file)
    except Exception as e:
        logger.error(f"Classification failed: {e}")
        raise HTTPException(status_code=503, detail="Service IA indisponible")


@router.get("/classify/categories")
async def get_categories(_=Depends(get_current_user)):
    try:
        return await ai_service.get_categories()
    except Exception as e:
        logger.error(f"Get categories failed: {e}")
        raise HTTPException(status_code=503, detail="Service IA indisponible")


@router.post("/predict/price")
async def predict_price(req: PricePredictionRequest, _=Depends(get_current_user)):
    try:
        return await ai_service.predict_price(req.material, req.periods)
    except Exception as e:
        logger.error(f"Price prediction failed: {e}")
        raise HTTPException(status_code=503, detail="Service IA indisponible")


@router.post("/predict/volume")
async def predict_volume(req: VolumePredictionRequest, _=Depends(get_current_user)):
    try:
        return await ai_service.predict_volume(req.zone_id, req.date)
    except Exception as e:
        logger.error(f"Volume prediction failed: {e}")
        raise HTTPException(status_code=503, detail="Service IA indisponible")


@router.post("/fraud/check")
async def check_fraud(req: FraudCheckRequest, _=Depends(get_current_user)):
    try:
        return await ai_service.check_fraud(req.model_dump())
    except Exception as e:
        logger.error(f"Fraud check failed: {e}")
        raise HTTPException(status_code=503, detail="Service IA indisponible")
