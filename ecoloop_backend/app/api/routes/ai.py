from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.services.ai.predictor_service import ZonePredictorService
from app.services.ai.matching_service import MatchingService
from app.services.ai.impact_service import ImpactService
from app.middlewares.jwt import get_current_user
from app.models.user import User, UserRole
from app.models.company_profile import CompanyProfile
from app.models.household_profile import HouseholdProfile
from app.models.collector_profile import CollectorProfile, CollectorType
from app.models.eco_points import EcoPointAccount

router = APIRouter()

class OnboardingAssistantRequest(BaseModel):
    text: str

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

@router.post("/zones-risk", summary="Prédiction IA du risque de saturation des zones")
async def predict_zone_risk(req: ZoneRiskRequest, current_user: User = Depends(get_current_user)):
    """
    Évalue le risque de saturation d'une zone et propose des recommandations.
    """
    # Dans un cas réel, ces données (population, historique) viendraient de la DB via les tables `zones` et `waste_events`.
    prediction = await ZonePredictorService.analyze_zone_risk(req.zone, req.population, req.historical_waste_kg)
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


@router.post("/onboarding-assistant", summary="Assistant IA d'onboarding utilisateur")
async def onboarding_assistant(
    req: OnboardingAssistantRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Extrait les informations du profil utilisateur par IA et initialise son profil spécifique.
    """
    text_lower = req.text.lower()
    
    extracted_data = {}
    profile_type = None

    if "recycleur" in text_lower or "industriel" in text_lower or "entreprise" in text_lower:
        profile_type = "COMPANY"
        extracted_data["company_name"] = "RecycleNet" if "recyclenet" in text_lower else "Industriel Partner"
        extracted_data["license_info"] = "LIC-REF-99" if "license" in text_lower or "licence" in text_lower else None
        extracted_data["coverage_zone"] = "Abidjan Zone Nord" if "abidjan" in text_lower else "Zone Standard"
        
        company = await db.get(CompanyProfile, current_user.id)
        if not company:
            company = CompanyProfile(
                company_id=current_user.id,
                company_name=extracted_data["company_name"],
                license_info=extracted_data["license_info"],
                coverage_zone=extracted_data["coverage_zone"],
                buyer_reliability_score=1.0
            )
            db.add(company)
        else:
            company.company_name = extracted_data["company_name"]
            company.license_info = extracted_data["license_info"]
            company.coverage_zone = extracted_data["coverage_zone"]

    elif "collecteur" in text_lower or "chauffeur" in text_lower or "logistique" in text_lower:
        profile_type = "COLLECTOR"
        extracted_data["vehicle_type"] = "Camionette" if "camion" in text_lower else "Moto"
        extracted_data["vehicle_capacity_kg"] = 250.0 if "250" in text_lower else 100.0
        extracted_data["coverage_zone"] = "Koumassi" if "koumassi" in text_lower else "Zone Standard"

        collector = await db.get(CollectorProfile, current_user.id)
        if not collector:
            collector = CollectorProfile(
                id=current_user.id,
                collector_type=CollectorType.COLLECTOR_PARTNER,
                vehicle_type=extracted_data["vehicle_type"],
                vehicle_capacity_kg=extracted_data["vehicle_capacity_kg"],
                coverage_zone=extracted_data["coverage_zone"],
                collector_reliability_score=1.0
            )
            db.add(collector)
        else:
            collector.vehicle_type = extracted_data["vehicle_type"]
            collector.vehicle_capacity_kg = extracted_data["vehicle_capacity_kg"]
            collector.coverage_zone = extracted_data["coverage_zone"]

    else:
        profile_type = "HOUSEHOLD"
        extracted_data["address_geo"] = "Abidjan Cocody" if "cocody" in text_lower else "Adresse Non Spécifiée"

        household = await db.get(HouseholdProfile, current_user.id)
        if not household:
            household = HouseholdProfile(
                user_id=current_user.id,
                address_geo=extracted_data["address_geo"],
                seller_reliability_score=1.0
            )
            db.add(household)
        else:
            household.address_geo = extracted_data["address_geo"]

        await EcoPointsService.get_or_create_account(db, current_user.id)

    await db.commit()
    
    return {
        "status": "success",
        "message": f"Onboarding assisté par IA complété pour le type: {profile_type}.",
        "extracted_data": extracted_data
    }
