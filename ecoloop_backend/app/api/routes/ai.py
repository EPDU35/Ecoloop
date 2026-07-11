import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any, Optional

from app.config.database import get_db
from app.services.ai.predictor_service import ZonePredictorService
from app.services.ai.matching_service import MatchingService
from app.services.ai.impact_service import ImpactService
from app.services.ai_service import ai_service
from app.middlewares.jwt import get_current_user
from app.models.ai_models import Zone
from app.models.user import User

router = APIRouter()
logger = logging.getLogger("ecoloop.ai_route")

class ZoneRiskRequest(BaseModel):
    zone: str
    population: int = 50000
    historical_waste_kg: float = 2000.0

class Collector(BaseModel):
    id: str
    name: str
    lat: float
    lon: float
    capacity_kg: float
    is_available: bool = True
    rating: float = 4.5

class MatchRequest(BaseModel):
    lot_lat: float
    lot_lon: float
    lot_weight_kg: float
    collectors: List[Collector]

class ImpactRequest(BaseModel):
    total_recycled_kg: float
    participation_months: int
    collections_count: int

def _zone_int_id(zone_uuid) -> int:
    """Le microservice IA attend un zone_id entier (ge=1). On dérive un int
    stable > 0 depuis l'UUID de la zone (le VolumePredictor IA ne connaît pas
    nos UUIDs ; cet identifiant permet au moins un appel réel et reproductible)."""
    return (zone_uuid.int % 999_999) + 1


def _normalize_zone_risk(zone_name: str, volume_pred: dict) -> dict:
    """Aplatit la réponse /api/predict/volume vers le contrat frontend."""
    predicted_volume = float(volume_pred.get("predicted_volume", 0.0) or 0.0)
    confiance = float(volume_pred.get("confiance", 0.9) or 0.9)
    # Heuristique de conversion volume (m³) -> score de risque 0-100
    risk_score = min(98.0, max(12.0, predicted_volume * 2.0))
    priority = "LOW"
    action = "Surveillance"
    if risk_score > 85:
        action = "Ajouter 2 collecteurs d'urgence"
        priority = "URGENT"
    elif risk_score > 60:
        action = "Augmenter la fréquence de collecte de 30%"
        priority = "HIGH"
    return {
        "prediction_id": str(volume_pred.get("zone_id", "")),
        "zone": zone_name,
        "risk_score": round(risk_score, 1),
        "confidence": round(confiance, 3),
        "trend": "up" if risk_score > 60 else "stable",
        "expected_volume_increase_percent": round(risk_score / 3, 1) if risk_score > 60 else 0,
        "reasons": [f"Volume prédit par l'IA : {predicted_volume:.2f} m³"],
        "recommendation": {
            "action": action,
            "priority": priority,
            "estimated_impact": "-30% d'accumulation de déchets" if risk_score > 60 else None,
        },
    }


@router.post("/zones-risk", summary="Prédiction IA du risque de saturation des zones")
async def predict_zone_risk(
    req: ZoneRiskRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Évalue le risque de saturation d'une zone et propose des recommandations.
    1) Résout la zone par son nom en DB, puis appelle le vrai microservice IA
       (`/api/predict/volume`) via `ai_service.predict_volume`.
    2) En cas d'échec IA (modèle non chargé, service down, zone absente),
       fallback vers le moteur heuristique local `ZonePredictorService`.
    """
    db_zone = (await db.execute(select(Zone).where(Zone.name == req.zone))).scalar_one_or_none()
    if db_zone is not None:
        try:
            volume_pred = await ai_service.predict_volume(
                zone_id=_zone_int_id(db_zone.id),
                date=datetime.now(timezone.utc).date().isoformat(),
            )
            data = _normalize_zone_risk(req.zone, volume_pred)
            # Mise à jour du niveau de risque livré par l'IA (audit trail DB)
            db_zone.risk_level = data["risk_score"]
            await db.flush()
            return {"status": "success", "data": data}
        except Exception as e:
            logger.warning("AI predict_volume indisponible (%s) — fallback mock local", e)

    # Fallback mock (comportement précédent)
    prediction = await ZonePredictorService.analyze_zone_risk(
        req.zone, req.population, req.historical_waste_kg
    )
    return {"status": "success", "data": prediction}

@router.post("/match-collector", summary="Scoring et matching IA des collecteurs")
async def match_collector(req: MatchRequest, current_user: User = Depends(get_current_user)):
    """
    Score une liste de collecteurs pour un lot donné.
    """
    collectors_dict = [c.dict() for c in req.collectors]
    results = await MatchingService.get_best_collectors(
        req.lot_lat, req.lot_lon, req.lot_weight_kg, collectors_dict
    )
    return {"status": "success", "data": {"matches": results}}

@router.post("/impact", summary="Calcul de l'EcoScore et Impact")
async def get_impact(req: ImpactRequest, current_user: User = Depends(get_current_user)):
    """
    Calcule l'EcoScore d'un producteur et les équivalences écologiques.
    """
    ecoscore = ImpactService.calculate_ecoscore(
        req.total_recycled_kg, req.participation_months, req.collections_count
    )
    
    # 1 kg de déchets recyclés = ~0.3 kg de CO2 évité en moyenne (simplifié)
    co2_saved = req.total_recycled_kg * 0.3
    equivalences = ImpactService.calculate_equivalences(co2_saved)
    
    return {
        "status": "success",
        "data": {
            "ecoscore": ecoscore,
            "impact": {
                "co2_saved_kg": round(co2_saved, 1),
                **equivalences
            }
        }
    }


# =====================================================================
# Routes proxy vers le microservice IA (ecoloop_ai)
# =====================================================================

class PricePredictionRequest(BaseModel):
    material: str
    periods: int = 30


class VolumePredictionRequest(BaseModel):
    zone_id: int
    date: str


class FraudCheckRequest(BaseModel):
    poids: float
    prix: float
    heure: int = 12
    jour_semaine: int = 0


def _ai_error(e: Exception):
    """Transforme une erreur httpx en HTTPException/503 propre."""
    detail = str(e)
    if "timeout" in detail.lower() or "connect" in detail.lower():
        return HTTPException(status_code=503, detail="Service IA temporairement indisponible (cold start). Réessayez dans 30s.")
    return HTTPException(status_code=502, detail=f"Erreur du service IA: {detail}")


@router.get("/health", summary="Santé du microservice IA")
async def ai_health():
    try:
        result = await ai_service.health()
        return result
    except Exception as e:
        raise _ai_error(e)


@router.post("/classify", summary="Classifier un déchét par image (YOLO)")
async def classify_waste(file: UploadFile = File(...)):
    """
    Proxy vers le microservice IA. Renvoie le format AnalyzeResult enrichi
    (category, confidence, all_scores, total_items, items_trouves, tips, etc.).
    """
    try:
        result = await ai_service.classify_image(file)
        return result
    except Exception as e:
        raise _ai_error(e)


@router.get("/classify/categories", summary="Liste des catégories de déchets supportées par l'IA")
async def classify_categories():
    try:
        result = await ai_service.get_categories()
        return result
    except Exception as e:
        raise _ai_error(e)


@router.post("/predict/price", summary="Prédire le prix d'un matériau (Prophet)")
async def predict_price(req: PricePredictionRequest):
    try:
        result = await ai_service.predict_price(req.material, req.periods)
        return result
    except Exception as e:
        raise _ai_error(e)


@router.post("/predict/volume", summary="Prédire le volume de collecte (XGBoost)")
async def predict_volume(req: VolumePredictionRequest):
    try:
        result = await ai_service.predict_volume(req.zone_id, req.date)
        return result
    except Exception as e:
        raise _ai_error(e)


@router.post("/fraud/check", summary="Vérifier une transaction (Isolation Forest)")
async def check_fraud(req: FraudCheckRequest):
    try:
        transaction_data = {
            "poids": req.poids,
            "prix": req.prix,
            "heure": req.heure,
            "jour_semaine": req.jour_semaine,
        }
        result = await ai_service.check_fraud(transaction_data)
        return result
    except Exception as e:
        raise _ai_error(e)
