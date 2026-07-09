"""
EcoLoop AI - Serveur API Principal
===================================

Point d'entrée principal de l'API FastAPI pour la plateforme EcoLoop.
Fournit les endpoints pour :
- Classification des déchets par intelligence artificielle
- Prédiction des prix des matériaux recyclables
- Prédiction des volumes de collecte par zone
- Détection de fraude sur les transactions

Lancement : uvicorn api.ai_server:app --host 0.0.0.0 --port 8000
"""

import os
import uuid
import logging
from typing import Optional
from datetime import datetime

import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# --- Import des modèles IA ---
from models.waste_classifier.model import WasteClassifier
from models.waste_classifier.preprocess import preprocess_image, get_recycling_tips
from models.prediction.price_prediction import PricePredictor
from models.prediction.volume_prediction import VolumePredictor
from models.fraud_detection.fraud_model import FraudDetector

# --- Import des routes ---
from api.routes.classify_routes import router as classify_router
from api.routes.predict_routes import router as predict_router
from api.routes.fraud_routes import router as fraud_router

# --- Import du middleware d'authentification ---
from api.middleware.auth import verify_token

# --- Configuration du logging ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("ecoloop_ai")


# =============================================================================
# Modèles Pydantic pour la validation des requêtes et réponses
# =============================================================================

class PricePredictionRequest(BaseModel):
    """Requête de prédiction de prix pour un matériau recyclable."""
    material: str = Field(
        ...,
        description="Nom du matériau (ex: 'plastique', 'aluminium', 'papier')",
        examples=["plastique"]
    )
    periods: Optional[int] = Field(
        default=30,
        description="Nombre de jours de prédiction (par défaut : 30)",
        ge=1,
        le=365
    )


class VolumePredictionRequest(BaseModel):
    """Requête de prédiction de volume de collecte pour une zone donnée."""
    zone_id: int = Field(
        ...,
        description="Identifiant unique de la zone de collecte",
        ge=1
    )
    date: str = Field(
        ...,
        description="Date cible au format YYYY-MM-DD",
        examples=["2026-07-15"]
    )
    features: Optional[dict] = Field(
        default=None,
        description="Caractéristiques supplémentaires optionnelles pour affiner la prédiction"
    )


class TransactionCheckRequest(BaseModel):
    """Requête de vérification de fraude sur une transaction."""
    id: Optional[str] = Field(
        default=None,
        description="Identifiant unique de la transaction"
    )
    poids: float = Field(
        ...,
        description="Poids de la transaction en kilogrammes",
        gt=0
    )
    prix: float = Field(
        ...,
        description="Prix de la transaction en euros",
        gt=0
    )
    user_id: Optional[str] = Field(
        default=None,
        description="Identifiant de l'utilisateur effectuant la transaction"
    )
    heure: Optional[int] = Field(
        default=12,
        description="Heure de la transaction (0-23)",
        ge=0,
        le=23
    )
    jour_semaine: Optional[int] = Field(
        default=0,
        description="Jour de la semaine (0=Lundi, 6=Dimanche)",
        ge=0,
        le=6
    )


class HealthResponse(BaseModel):
    """Réponse du endpoint de vérification de santé de l'API."""
    status: str = Field(
        ...,
        description="Statut global de l'API ('ok' ou 'degraded')"
    )
    models_loaded: dict = Field(
        ...,
        description="Dictionnaire indiquant l'état de chargement de chaque modèle IA"
    )


class ClassificationResponse(BaseModel):
    """Réponse de classification d'un déchet."""
    categorie: str = Field(..., description="Catégorie du déchet identifié")
    confiance: float = Field(..., description="Score de confiance (0.0 à 1.0)")
    tips: list = Field(default=[], description="Conseils de recyclage pour cette catégorie")
    timestamp: str = Field(..., description="Horodatage de la classification")


class PricePredictionResponse(BaseModel):
    """Réponse de prédiction de prix."""
    material: str = Field(..., description="Matériau analysé")
    predictions: list = Field(..., description="Liste des prédictions de prix")
    periods: int = Field(..., description="Nombre de périodes prédites")
    timestamp: str = Field(..., description="Horodatage de la prédiction")


class VolumePredictionResponse(BaseModel):
    """Réponse de prédiction de volume."""
    zone_id: int = Field(..., description="Identifiant de la zone")
    date: str = Field(..., description="Date cible")
    predicted_volume: float = Field(..., description="Volume prédit en m³")
    timestamp: str = Field(..., description="Horodatage de la prédiction")


class FraudCheckResponse(BaseModel):
    """Réponse de vérification de fraude."""
    transaction_id: str = Field(..., description="Identifiant de la transaction")
    is_fraudulent: bool = Field(..., description="Indique si la transaction est suspecte")
    fraud_score: float = Field(..., description="Score de risque de fraude (0.0 à 1.0)")
    details: dict = Field(default={}, description="Détails supplémentaires de l'analyse")
    timestamp: str = Field(..., description="Horodatage de la vérification")


# =============================================================================
# Initialisation de l'application FastAPI
# =============================================================================

app = FastAPI(
    title="EcoLoop AI API",
    description="API Intelligence Artificielle pour la plateforme EcoLoop",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# --- Configuration CORS (Cross-Origin Resource Sharing) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Initialisation des modèles IA au démarrage
# =============================================================================

# Variables globales pour les modèles
waste_classifier: Optional[WasteClassifier] = None
price_predictor: Optional[PricePredictor] = None
volume_predictor: Optional[VolumePredictor] = None
fraud_detector: Optional[FraudDetector] = None


@app.on_event("startup")
async def startup_event():
    """
    Événement de démarrage : charge tous les modèles IA en mémoire.
    Les erreurs de chargement sont capturées pour permettre un démarrage
    en mode dégradé (certains modèles peuvent ne pas être disponibles).
    """
    global waste_classifier, price_predictor, volume_predictor, fraud_detector

    logger.info("🚀 Démarrage de l'API EcoLoop AI...")

    # Chargement du classificateur de déchets
    try:
        waste_classifier = WasteClassifier()
        from api.routes.classify_routes import set_classifier
        set_classifier(waste_classifier)
        logger.info("✅ Modèle WasteClassifier chargé avec succès")
    except Exception as e:
        logger.error(f"❌ Erreur chargement WasteClassifier : {e}")
        waste_classifier = None

    # Chargement du prédicteur de prix
    try:
        price_predictor = PricePredictor()
        from api.routes.predict_routes import set_price_predictor
        set_price_predictor(price_predictor)
        logger.info("✅ Modèle PricePredictor chargé avec succès")
    except Exception as e:
        logger.error(f"❌ Erreur chargement PricePredictor : {e}")
        price_predictor = None

    # Chargement du prédicteur de volume
    try:
        volume_predictor = VolumePredictor()
        from api.routes.predict_routes import set_volume_predictor
        set_volume_predictor(volume_predictor)
        logger.info("✅ Modèle VolumePredictor chargé avec succès")
    except Exception as e:
        logger.error(f"❌ Erreur chargement VolumePredictor : {e}")
        volume_predictor = None

    # Chargement du détecteur de fraude
    try:
        fraud_detector = FraudDetector()
        from api.routes.fraud_routes import set_fraud_detector
        set_fraud_detector(fraud_detector)
        logger.info("✅ Modèle FraudDetector chargé avec succès")
    except Exception as e:
        logger.error(f"❌ Erreur chargement FraudDetector : {e}")
        fraud_detector = None

    logger.info("🏁 Initialisation terminée")


# =============================================================================
# Inclusion des routeurs
# =============================================================================

app.include_router(classify_router)
app.include_router(predict_router)
app.include_router(fraud_router)


# =============================================================================
# Endpoints principaux
# =============================================================================

@app.get(
    "/api/health",
    response_model=HealthResponse,
    summary="Vérification de santé de l'API",
    description="Retourne le statut de l'API et l'état de chargement de chaque modèle IA."
)
async def health_check():
    """
    Endpoint de vérification de santé (health check).
    
    Retourne :
    - Le statut global de l'API ('ok' si tous les modèles sont chargés, 'degraded' sinon)
    - L'état de chargement de chaque modèle IA
    """
    models_status = {
        "waste_classifier": waste_classifier is not None,
        "price_predictor": price_predictor is not None,
        "volume_predictor": volume_predictor is not None,
        "fraud_detector": fraud_detector is not None,
    }

    # Déterminer le statut global
    all_loaded = all(models_status.values())
    status = "ok" if all_loaded else "degraded"

    return HealthResponse(
        status=status,
        models_loaded=models_status
    )


# =============================================================================
# Point d'entrée pour l'exécution directe
# =============================================================================

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=False
    )
