import os
import uuid
import asyncio
import logging
from typing import Optional
from datetime import datetime

import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from models.waste_classifier.model import WasteClassifier
from models.waste_classifier.preprocess import preprocess_image, get_recycling_tips
from models.prediction.price_prediction import PricePredictor
from models.prediction.volume_prediction import VolumePredictor
from models.fraud_detection.fraud_model import FraudDetector

from api.routes.classify_routes import router as classify_router
from api.routes.predict_routes import router as predict_router
from api.routes.fraud_routes import router as fraud_router
from api.middleware.auth import verify_token
from config.settings import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("ecoloop_ai")


class PricePredictionRequest(BaseModel):
    material: str = Field(..., description="Nom du matériau (ex: 'plastique', 'aluminium', 'papier')", examples=["plastique"])
    periods: Optional[int] = Field(default=30, description="Nombre de jours de prédiction", ge=1, le=365)


class VolumePredictionRequest(BaseModel):
    zone_id: int = Field(..., description="Identifiant unique de la zone de collecte", ge=1)
    date: str = Field(..., description="Date cible au format YYYY-MM-DD", examples=["2026-07-15"])
    features: Optional[dict] = Field(default=None, description="Caractéristiques supplémentaires optionnelles")


class TransactionCheckRequest(BaseModel):
    id: Optional[str] = Field(default=None, description="Identifiant unique de la transaction")
    poids: float = Field(..., description="Poids de la transaction en kilogrammes", gt=0)
    prix: float = Field(..., description="Prix de la transaction en euros", gt=0)
    user_id: Optional[str] = Field(default=None, description="Identifiant de l'utilisateur effectuant la transaction")
    heure: Optional[int] = Field(default=12, description="Heure de la transaction (0-23)", ge=0, le=23)
    jour_semaine: Optional[int] = Field(default=0, description="Jour de la semaine (0=Lundi, 6=Dimanche)", ge=0, le=6)


class HealthResponse(BaseModel):
    status: str = Field(..., description="Statut global de l'API ('ok' ou 'degraded')")
    models_loaded: dict = Field(..., description="Dictionnaire indiquant l'état de chargement de chaque modèle IA")
    version: str = "1.0.0"
    environment: str = "development"


class ClassificationResponse(BaseModel):
    categorie: str = Field(..., description="Catégorie du déchet identifié")
    confiance: float = Field(..., description="Score de confiance (0.0 à 1.0)")
    tips: list = Field(default=[], description="Conseils de recyclage pour cette catégorie")
    timestamp: str = Field(..., description="Horodatage de la classification")


class PricePredictionResponse(BaseModel):
    material: str = Field(..., description="Matériau analysé")
    predictions: list = Field(..., description="Liste des prédictions de prix")
    periods: int = Field(..., description="Nombre de périodes prédites")
    timestamp: str = Field(..., description="Horodatage de la prédiction")


class VolumePredictionResponse(BaseModel):
    zone_id: int = Field(..., description="Identifiant de la zone")
    date: str = Field(..., description="Date cible")
    predicted_volume: float = Field(..., description="Volume prédit en m³")
    timestamp: str = Field(..., description="Horodatage de la prédiction")


class FraudCheckResponse(BaseModel):
    transaction_id: str = Field(..., description="Identifiant de la transaction")
    is_fraudulent: bool = Field(..., description="Indique si la transaction est suspecte")
    fraud_score: float = Field(..., description="Score de risque de fraude (0.0 à 1.0)")
    details: dict = Field(default={}, description="Détails supplémentaires de l'analyse")
    timestamp: str = Field(..., description="Horodatage de la vérification")


app = FastAPI(
    title="EcoLoop AI API",
    description="API Intelligence Artificielle pour la plateforme EcoLoop",
    version="1.0.0",
    docs_url="/docs" if settings.ENV != "production" else None,
    redoc_url="/redoc" if settings.ENV != "production" else None,
    openapi_url="/openapi.json" if settings.ENV != "production" else None,
)

if settings.ALLOWED_ORIGINS in ("*", ""):
    allow_origins = ["*"]
else:
    allow_origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

waste_classifier: Optional[WasteClassifier] = None
price_predictor: Optional[PricePredictor] = None
volume_predictor: Optional[VolumePredictor] = None
fraud_detector: Optional[FraudDetector] = None


@app.on_event("startup")
async def startup_event():
    global waste_classifier, price_predictor, volume_predictor, fraud_detector

    logger.info(f"Démarrage de l'API EcoLoop AI (env: {settings.ENV})...")

    try:
        waste_classifier = WasteClassifier()
        from api.routes.classify_routes import set_classifier
        set_classifier(waste_classifier)
        logger.info("Modèle WasteClassifier chargé avec succès")
    except Exception as e:
        logger.error(f"Erreur chargement WasteClassifier : {e}")
        waste_classifier = None

    try:
        price_predictor = PricePredictor()
        from api.routes.predict_routes import set_price_predictor
        set_price_predictor(price_predictor)
        logger.info("Modèle PricePredictor chargé avec succès")
    except Exception as e:
        logger.error(f"Erreur chargement PricePredictor : {e}")
        price_predictor = None

    try:
        volume_predictor = VolumePredictor()
        from api.routes.predict_routes import set_volume_predictor
        set_volume_predictor(volume_predictor)
        logger.info("Modèle VolumePredictor chargé avec succès")
    except Exception as e:
        logger.error(f"Erreur chargement VolumePredictor : {e}")
        volume_predictor = None

    try:
        fraud_detector = FraudDetector()
        from api.routes.fraud_routes import set_fraud_detector
        set_fraud_detector(fraud_detector)
        logger.info("Modèle FraudDetector chargé avec succès")
    except Exception as e:
        logger.error(f"Erreur chargement FraudDetector : {e}")
        fraud_detector = None

    logger.info("Initialisation terminée")

    import httpx
    async def keep_alive_task():
        url = os.environ.get("RENDER_EXTERNAL_URL")
        if not url:
            return
        ping_url = f"{url.rstrip('/')}/api/health"
        async with httpx.AsyncClient(timeout=10.0) as client:
            while True:
                await asyncio.sleep(8 * 60)
                try:
                    await client.get(ping_url)
                    logger.info("Keep-alive ping sent successfully")
                except Exception as e:
                    logger.warning(f"Keep-alive ping failed: {e}")

    if os.environ.get("RENDER_EXTERNAL_URL"):
        asyncio.create_task(keep_alive_task())


app.include_router(classify_router)
app.include_router(predict_router)
app.include_router(fraud_router)


@app.get(
    "/api/health",
    response_model=HealthResponse,
    summary="Vérification de santé de l'API",
    description="Retourne le statut de l'API et l'état de chargement de chaque modèle IA."
)
async def health_check():
    models_status = {
        "waste_classifier": waste_classifier is not None,
        "price_predictor": price_predictor is not None,
        "volume_predictor": volume_predictor is not None,
        "fraud_detector": fraud_detector is not None,
    }
    all_loaded = all(models_status.values())
    return HealthResponse(
        status="ok" if all_loaded else "degraded",
        models_loaded=models_status,
        version="1.0.0",
        environment=settings.ENV,
    )


if __name__ == "__main__":
    uvicorn.run(
        "api.ai_server:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        log_level="info",
        reload=settings.ENV == "development",
    )
