import asyncio
import os
import sys

# Ajouter le dossier parent au path pour les imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.ext.asyncio import AsyncSession
from app.config.database import AsyncSessionLocal
from app.models.user import User, UserRole
from app.models.ai_models import Zone, AIPrediction, Recommendation
from app.config.security import hash_password
import uuid
from datetime import datetime, timezone, timedelta

async def seed_data():
    async with AsyncSessionLocal() as session:
        print("🌱 Démarrage du Seed Demo VIBEATHON...")
        
        # 1. Nettoyage partiel (optionnel, pour éviter les doublons si relancé)
        # On pourrait faire un truncate, mais pour la démo on va vérifier l'existence
        
        print("🧑‍🤝‍🧑 Création des utilisateurs...")
        
        # JURY
        jury_id = uuid.uuid4()
        jury = User(
            id=jury_id,
            email="mairie@abobo.ci",
            hashed_password=hash_password("Demo2026!"),
            full_name="Mairie d'Abobo",
            role=UserRole.MAIRIE,
            phone="+2250102030405",
            is_active=True
        )
        session.add(jury)

        # PRODUCTEUR (Restaurant Le Délice)
        prod_id = uuid.uuid4()
        prod = User(
            id=prod_id,
            email="producteur@restaurant.ci",
            hashed_password=hash_password("Demo2026!"),
            full_name="Restaurant Le Délice",
            role=UserRole.PRODUCTEUR,
            phone="+2250000000001",
            is_active=True
        )
        session.add(prod)

        # COLLECTEUR (Transport Express)
        coll_id = uuid.uuid4()
        coll = User(
            id=coll_id,
            email="collecteur@express.ci",
            hashed_password=hash_password("Demo2026!"),
            full_name="Transport Express",
            role=UserRole.COLLECTEUR,
            phone="+2250000000002",
            is_active=True
        )
        session.add(coll)
        
        # INDUSTRIEL (EcoRecycle CI)
        ind_id = uuid.uuid4()
        ind = User(
            id=ind_id,
            email="industriel@plastique.ci",
            hashed_password=hash_password("Demo2026!"),
            full_name="EcoRecycle CI",
            role=UserRole.INDUSTRIEL,
            phone="+2250000000003",
            is_active=True
        )
        session.add(ind)

        print("🗺️ Création des Zones IA...")
        
        zone_marche = Zone(
            id=uuid.uuid4(),
            name="Marché Central",
            latitude=5.316667,
            longitude=-4.033333,
            population=15000,
            risk_level=87.0
        )
        zone_commerce = Zone(
            id=uuid.uuid4(),
            name="Quartier Commerce",
            latitude=5.320000,
            longitude=-4.040000,
            population=8000,
            risk_level=63.0
        )
        zone_res = Zone(
            id=uuid.uuid4(),
            name="Zone Résidentielle",
            latitude=5.350000,
            longitude=-4.000000,
            population=12000,
            risk_level=18.0
        )
        session.add_all([zone_marche, zone_commerce, zone_res])
        await session.flush()

        print("🔮 Génération des prédictions IA...")
        
        pred_marche = AIPrediction(
            id=uuid.uuid4(),
            zone_id=zone_marche.id,
            risk_score=87.0,
            confidence=91.0,
            expected_volume=1200.0,
            prediction_date=datetime.now(timezone.utc),
            reason=["+35% volume déchets", "-20% capacité collecte", "Pluie prévue"]
        )
        
        pred_commerce = AIPrediction(
            id=uuid.uuid4(),
            zone_id=zone_commerce.id,
            risk_score=63.0,
            confidence=85.0,
            expected_volume=500.0,
            prediction_date=datetime.now(timezone.utc),
            reason=["Hausse modérée d'activité commerciale"]
        )
        
        pred_res = AIPrediction(
            id=uuid.uuid4(),
            zone_id=zone_res.id,
            risk_score=18.0,
            confidence=95.0,
            expected_volume=200.0,
            prediction_date=datetime.now(timezone.utc),
            reason=["Volume stable", "Aucune anomalie"]
        )
        session.add_all([pred_marche, pred_commerce, pred_res])
        await session.flush()
        
        print("⚡ Ajout des recommandations IA...")
        
        rec_marche = Recommendation(
            id=uuid.uuid4(),
            prediction_id=pred_marche.id,
            action="Ajouter 2 collecteurs",
            priority="URGENT",
            impact_estimated="-30% d'accumulation"
        )
        session.add(rec_marche)

        try:
            await session.commit()
            print("✅ SEED DEMO TERMINE AVEC SUCCES !")
        except Exception as e:
            await session.rollback()
            print(f"❌ Erreur lors du seed : {e}")

if __name__ == "__main__":
    asyncio.run(seed_data())
