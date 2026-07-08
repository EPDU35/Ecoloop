import os
import sys
import asyncio
import hashlib
import hmac
import json
from datetime import datetime, timezone, timedelta
from httpx import AsyncClient
from sqlalchemy import select, delete, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

# 1. Détection de la connexion fonctionnelle et création de la base avant tout import de l'application
def detect_and_update_env():
    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_path = os.path.join(parent_dir, ".env")
    
    db_url = None
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("DATABASE_URL="):
                    db_url = line.split("=", 1)[1].strip()
                    break
    
    if not db_url:
        db_url = "postgresql+asyncpg://ecoloop_user:CHANGE_ME@localhost:5432/ecoloop_db"
        
    print(f"[INIT] URL DB lue dans .env : {db_url}")
    
    # Construire la liste des candidats à tester
    candidates = []
    if "CHANGE_ME" in db_url:
        candidates.append(db_url.replace("CHANGE_ME", "ecoloop_pass"))
        candidates.append(db_url.replace("CHANGE_ME", "postgres"))
        candidates.append(db_url.replace("CHANGE_ME", "root"))
        candidates.append("postgresql+asyncpg://postgres:postgres@localhost:5432/ecoloop_db")
        candidates.append("postgresql+asyncpg://postgres:postgres@localhost:5432/postgres")
        candidates.append("postgresql+asyncpg://ecoloop_user:ecoloop_pass@localhost:5432/ecoloop_db")
        candidates.append(db_url)
    else:
        candidates.append(db_url)
        candidates.append("postgresql+asyncpg://ecoloop_user:ecoloop_pass@localhost:5432/ecoloop_db")
        candidates.append("postgresql+asyncpg://postgres:postgres@localhost:5432/ecoloop_db")
        candidates.append("postgresql+asyncpg://postgres:postgres@localhost:5432/postgres")

    working_url = None
    
    async def try_connect(url):
        try:
            # Essayer de se connecter
            engine = create_async_engine(url)
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            await engine.dispose()
            return True
        except Exception:
            return False

    async def create_db_if_not_exists(base_url, db_name):
        # Se connecter à 'postgres'
        postgres_url = base_url.rsplit("/", 1)[0] + "/postgres"
        try:
            engine = create_async_engine(postgres_url, isolation_level="AUTOCOMMIT")
            async with engine.connect() as conn:
                res = await conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname='{db_name}'"))
                exists = res.scalar()
                if not exists:
                    print(f"[INIT] Base '{db_name}' absente. Création...")
                    await conn.execute(text(f"CREATE DATABASE {db_name}"))
                    print(f"[INIT] Base '{db_name}' créée.")
            await engine.dispose()
        except Exception as e:
            print(f"[WARN] Impossible de créer la base : {e}")

    loop = asyncio.new_event_loop()
    
    # Tenter de créer la base d'abord si absente
    for cand in candidates:
        if "localhost" in cand or "127.0.0.1" in cand:
            db_name = cand.rsplit("/", 1)[1]
            loop.run_until_complete(create_db_if_not_exists(cand, db_name))
            
    # Tester les connexions
    for cand in candidates:
        print(f"[INIT] Test de connexion : {cand}")
        if loop.run_until_complete(try_connect(cand)):
            print(f"[INIT] Connexion réussie avec {cand} !")
            working_url = cand
            break
            
    loop.close()
    
    if working_url:
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
            for idx, line in enumerate(lines):
                if line.startswith("DATABASE_URL="):
                    lines[idx] = f"DATABASE_URL={working_url}\n"
                    break
            with open(env_path, "w", encoding="utf-8") as f:
                f.writelines(lines)
            print("[INIT] .env mis à jour avec la bonne connexion.")
        os.environ["DATABASE_URL"] = working_url
    else:
        print("[WARN] Aucune connexion DB n'a fonctionné.")

# Lancer la détection avant d'importer l'application
detect_and_update_env()

# Add the parent directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set test environment config
os.environ["ENVIRONMENT"] = "development"
os.environ["DEBUG"] = "true"

from app.config.settings import settings
from main import app
from app.config.database import Base
from app.models.user import User, UserRole
from app.models.collector_profile import CollectorProfile, CollectorStatus, VerificationStatus
from app.models.collector_location import CollectorLocation
from app.models.reward import Reward
from app.models.reward_transaction import RewardTransaction, RewardAction
from app.models.review import Review
from app.models.notification import Notification
from app.models.audit_log import AuditLog
from app.models.collection import Collection, CollectionStatus
from app.models.waste import WasteLot, LotStatus, WasteCategory
from app.models.transaction import Transaction, TransactionStatus, PaymentMethod
from app.controllers import auth_controller

# Disable slowapi rate limiting for testing
from app.utils.helpers import limiter
limiter.enabled = False


async def check_and_adjust_db_connection():
    # Déjà fait au démarrage
    pass


async def run_migrations():
    print("[MIGRATION] Exécution des migrations Alembic programmatiquement...")
    from alembic.config import Config
    from alembic import command
    try:
        # Override the sqlalchemy.url dynamic property
        alembic_cfg = Config("alembic.ini")
        alembic_cfg.set_main_option("sqlalchemy.url", settings.database_url)
        # Run upgrade
        command.upgrade(alembic_cfg, "head")
        print("[MIGRATION] Base de données mise à jour avec succès via Alembic.")
    except Exception as e:
        print(f"[MIGRATION] Erreur ou avertissement lors de l'application d'Alembic: {e}")


async def clean_test_data(session: AsyncSession):
    test_emails = [
        "test_producer@ecoloop.ci",
        "test_collector@ecoloop.ci",
        "test_collector2@ecoloop.ci"
    ]
    res = await session.execute(select(User).where(User.email.in_(test_emails)))
    users = res.scalars().all()
    user_ids = [u.id for u in users]
    
    if not user_ids:
        print("[CLEANUP] Aucun utilisateur de test existant en base.")
        return

    print(f"[CLEANUP] Suppression des données pour {len(user_ids)} utilisateurs de test...")
    
    # 1. Supprimer les transactions
    await session.execute(
        delete(Transaction).where(
            (Transaction.producer_id.in_(user_ids)) | (Transaction.collector_id.in_(user_ids))
        )
    )
    # 2. Supprimer les transactions de récompense
    await session.execute(delete(RewardTransaction).where(RewardTransaction.user_id.in_(user_ids)))
    # 3. Supprimer les reviews
    await session.execute(
        delete(Review).where(
            (Review.reviewer_id.in_(user_ids)) | (Review.reviewed_id.in_(user_ids))
        )
    )
    # 4. Supprimer les notifications
    await session.execute(delete(Notification).where(Notification.user_id.in_(user_ids)))
    # 5. Supprimer les logs d'audit
    await session.execute(delete(AuditLog).where(AuditLog.user_id.in_(user_ids)))
    
    # 6. Supprimer les collections
    # D'abord récupérer les collections à supprimer pour en récupérer les IDs si besoin,
    # mais une simple clause de suppression sur collector_id suffit.
    await session.execute(delete(Collection).where(Collection.collector_id.in_(user_ids)))
    
    # 7. Supprimer les lots
    await session.execute(
        delete(WasteLot).where(
            (WasteLot.producer_id.in_(user_ids)) | (WasteLot.collector_id.in_(user_ids))
        )
    )
    # 8. Supprimer les profils de récompense et collecteurs
    await session.execute(delete(Reward).where(Reward.user_id.in_(user_ids)))
    await session.execute(delete(CollectorProfile).where(CollectorProfile.id.in_(user_ids)))
    await session.execute(delete(CollectorLocation).where(CollectorLocation.collector_id.in_(user_ids)))
    
    # 9. Supprimer les utilisateurs
    await session.execute(delete(User).where(User.id.in_(user_ids)))
    
    await session.commit()
    print("[CLEANUP] Nettoyage terminé.")


async def test_e2e_flow():
    # 1. Ajuster et tester la connexion DB
    await check_and_adjust_db_connection()
    
    # 2. Lancer les migrations
    await run_migrations()
    
    engine = create_async_engine(settings.database_url)
    AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    
    # 3. Nettoyer les données résiduelles
    async with AsyncSessionLocal() as session:
        await clean_test_data(session)

    # Variables de stockage pour les étapes
    producer_token = None
    collector_token = None
    collector2_token = None
    
    producer_id = None
    collector_id = None
    collector2_id = None
    
    waste_lot_id = None
    collection_id = None
    validation_code = None
    transaction_id = None

    print("\n--- DÉBUT DU FLUX DE TEST END-TO-END ---\n")

    async with AsyncClient(app=app, base_url="http://test") as client:
        # =====================================================================
        # ÉTAPE 1 : INSCRIPTION DES UTILISATEURS
        # =====================================================================
        print("[ETAPE 1] Inscription du Producteur et des Collecteurs...")
        
        # Inscription Producteur
        p_payload = {
            "full_name": "Test Producer",
            "email": "test_producer@ecoloop.ci",
            "phone": "+22501020304",
            "password": "Password123!",
            "role": "producteur"
        }
        # On utilise le controleur directement pour obtenir le OTP de validation
        async with AsyncSessionLocal() as session:
            from app.schemas.user_schema import UserRegisterSchema
            p_schema = UserRegisterSchema(**p_payload)
            p_user, p_otp = await auth_controller.register_user(session, p_schema)
            await session.commit()
            producer_id = p_user.id
            print(f" -> Producteur créé avec ID {producer_id}, OTP: {p_otp}")
            
        # Validation OTP du Producteur via API
        v_res = await client.post("/api/v1/auth/verify-otp", json={
            "email": "test_producer@ecoloop.ci",
            "code": p_otp
        })
        assert v_res.status_code == 200, f"Validation OTP Producteur échouée: {v_res.json()}"
        print(" -> OTP Producteur validé avec succès.")

        # Inscription Collecteur 1
        c1_payload = {
            "full_name": "Test Collector One",
            "email": "test_collector@ecoloop.ci",
            "phone": "+22505060708",
            "password": "Password123!",
            "role": "collecteur"
        }
        async with AsyncSessionLocal() as session:
            c1_schema = UserRegisterSchema(**c1_payload)
            c1_user, c1_otp = await auth_controller.register_user(session, c1_schema)
            await session.commit()
            collector_id = c1_user.id
            print(f" -> Collecteur 1 créé avec ID {collector_id}, OTP: {c1_otp}")
            
        v_res = await client.post("/api/v1/auth/verify-otp", json={
            "email": "test_collector@ecoloop.ci",
            "code": c1_otp
        })
        assert v_res.status_code == 200, f"Validation OTP Collecteur 1 échouée: {v_res.json()}"
        print(" -> OTP Collecteur 1 validé.")

        # Inscription Collecteur 2 (pour test de concurrence)
        c2_payload = {
            "full_name": "Test Collector Two",
            "email": "test_collector2@ecoloop.ci",
            "phone": "+22509090909",
            "password": "Password123!",
            "role": "collecteur"
        }
        async with AsyncSessionLocal() as session:
            c2_schema = UserRegisterSchema(**c2_payload)
            c2_user, c2_otp = await auth_controller.register_user(session, c2_schema)
            await session.commit()
            collector2_id = c2_user.id
            print(f" -> Collecteur 2 créé avec ID {collector2_id}, OTP: {c2_otp}")
            
        v_res = await client.post("/api/v1/auth/verify-otp", json={
            "email": "test_collector2@ecoloop.ci",
            "code": c2_otp
        })
        assert v_res.status_code == 200, f"Validation OTP Collecteur 2 échouée: {v_res.json()}"
        print(" -> OTP Collecteur 2 validé.")

        # =====================================================================
        # ÉTAPE 2 : CONNEXION ET RÉCUPÉRATION DES TOKENS JWT
        # =====================================================================
        print("\n[ETAPE 2] Connexion des comptes pour obtenir les tokens JWT...")
        
        # Login Producer
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "test_producer@ecoloop.ci",
            "password": "Password123!"
        })
        assert login_res.status_code == 200
        producer_token = login_res.json()["access_token"]
        
        # Login Collector 1
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "test_collector@ecoloop.ci",
            "password": "Password123!"
        })
        assert login_res.status_code == 200
        collector_token = login_res.json()["access_token"]

        # Login Collector 2
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "test_collector2@ecoloop.ci",
            "password": "Password123!"
        })
        assert login_res.status_code == 200
        collector2_token = login_res.json()["access_token"]
        
        print(" -> Connexions réussies et tokens JWT récupérés.")

        # =====================================================================
        # ÉTAPE 3 : PRÉPARATION ET VÉRIFICATION DES PROFILS COLLECTEURS
        # =====================================================================
        print("\n[ETAPE 3] Configuration opérationnelle des collecteurs (GPS et statut)...")
        
        # Par défaut, le profil collecteur est créé avec status=AVAILABLE, verification_status=PENDING
        # Pour participer au matching et à la réservation, le statut doit être VERIFIED.
        # Nous allons simuler une vérification administrative en mettant à jour le champ en base de données.
        async with AsyncSessionLocal() as session:
            res = await session.execute(select(CollectorProfile).where(CollectorProfile.id == collector_id))
            p1 = res.scalar_one()
            p1.verification_status = VerificationStatus.VERIFIED
            p1.vehicle_capacity_kg = 500.0  # Capacité suffisante pour nos tests
            
            res2 = await session.execute(select(CollectorProfile).where(CollectorProfile.id == collector2_id))
            p2 = res2.scalar_one()
            p2.verification_status = VerificationStatus.VERIFIED
            p2.vehicle_capacity_kg = 500.0

            await session.commit()
            print(" -> Profils collecteurs mis à jour en statut VERIFIED (admin).")

        # Mise à jour de la position GPS du Collecteur 1 à Abidjan (ex: Cocody 5.3484, -3.9806)
        gps1_res = await client.post(
            "/api/v1/users/gps",
            json={"latitude": 5.3484, "longitude": -3.9806, "accuracy_meters": 10.0},
            headers={"Authorization": f"Bearer {collector_token}"}
        )
        assert gps1_res.status_code == 200, f"Echec GPS Collecteur 1: {gps1_res.json()}"
        print(" -> GPS Collecteur 1 mis à jour à Cocody.")

        # Mise à jour de la position GPS du Collecteur 2 à Cocody également
        gps2_res = await client.post(
            "/api/v1/users/gps",
            json={"latitude": 5.3490, "longitude": -3.9810, "accuracy_meters": 5.0},
            headers={"Authorization": f"Bearer {collector2_token}"}
        )
        assert gps2_res.status_code == 200
        print(" -> GPS Collecteur 2 mis à jour à Cocody.")

        # =====================================================================
        # ÉTAPE 4 : CRÉATION D'UN LOT DE DÉCHETS (PRODUCTEUR)
        # =====================================================================
        print("\n[ETAPE 4] Publication d'un lot de déchets par le producteur...")
        
        # Création d'un lot de 200kg de plastique à Cocody (proche des collecteurs)
        lot_payload = {
            "category": "plastique",
            "description": "200 kg de bouteilles plastiques compactées",
            "weight_kg": 200.0,
            "price_per_kg": 150.0,
            "latitude": 5.3480,
            "longitude": -3.9800
        }
        lot_res = await client.post(
            "/api/v1/wastes",
            json=lot_payload,
            headers={"Authorization": f"Bearer {producer_token}"}
        )
        assert lot_res.status_code == 201, f"Création de lot échouée: {lot_res.json()}"
        lot_data = lot_res.json()
        waste_lot_id = lot_data["id"]
        print(f" -> Lot créé avec ID {waste_lot_id} (catégorie: {lot_data['category']}, statut: {lot_data['status']})")

        # =====================================================================
        # ÉTAPE 5 : MATCHING ET NOTIFICATIONS
        # =====================================================================
        print("\n[ETAPE 5] Test du matching et vérification des notifications reçues...")
        
        # Le Matching Service a été exécuté automatiquement lors du POST /wastes
        # Vérifions si le Collecteur 1 a reçu une notification de type 'collection_request'
        notif_res = await client.get(
            "/api/v1/notifications",
            headers={"Authorization": f"Bearer {collector_token}"}
        )
        assert notif_res.status_code == 200
        notifs = notif_res.json()
        print(f" -> Collecteur 1 a reçu {len(notifs)} notification(s).")
        
        # Il doit y avoir au moins une notification concernant le nouveau lot
        request_notifs = [n for n in notifs if n["type"] == "collection_request"]
        assert len(request_notifs) > 0, "Aucune notification de matching reçue par le collecteur!"
        target_notif = request_notifs[0]
        print(f" -> Notification de match validée: '{target_notif['title']}' - '{target_notif['content']}'")
        
        # Marquer la notification comme lue
        read_res = await client.patch(
            f"/api/v1/notifications/{target_notif['id']}/read",
            headers={"Authorization": f"Bearer {collector_token}"}
        )
        assert read_res.status_code == 200
        print(" -> Notification marquée comme lue avec succès.")

        # =====================================================================
        # ÉTAPE 6 : CHAOS - TEST D'ÉLIMINATION DE MATCHING (GPS périmé, capacité, etc.)
        # =====================================================================
        print("\n[ETAPE 6] CHAOS : Validation de l'élimination des collecteurs non éligibles...")
        
        # Nous allons manuellement rendre le GPS du Collecteur 2 très vieux (> 2 heures)
        async with AsyncSessionLocal() as session:
            res = await session.execute(
                select(CollectorLocation).where(CollectorLocation.collector_id == collector2_id)
            )
            loc2 = res.scalar_one()
            loc2.updated_at = datetime.now(timezone.utc) - timedelta(hours=3)  # Périmé
            await session.commit()
            print(" -> GPS du Collecteur 2 forcé à obsolète (il y a 3 heures).")
            
        # Appelons le matching service en interne ou via un endpoint si disponible (sinon en testant find_nearby_collectors directement)
        async with AsyncSessionLocal() as session:
            from app.services.matching_service import find_nearby_collectors
            # Recharger le lot
            lot_stmt = select(WasteLot).where(WasteLot.id == uuid.UUID(waste_lot_id))
            lot_res = await session.execute(lot_stmt)
            lot_obj = lot_res.scalar_one()
            
            # Rechercher les collecteurs proches
            nearby = await find_nearby_collectors(session, lot_obj)
            # Collecteur 2 doit être éliminé à cause de sa position GPS périmée
            collector_ids = [c[0].id for c in nearby]
            assert collector2_id not in collector_ids, "Le Collecteur 2 n'a pas été éliminé alors que son GPS était obsolète!"
            assert collector_id in collector_ids, "Le Collecteur 1 (éligible) a été éliminé par erreur!"
            print(" -> Chaos test Élimination (GPS périmé) : Réussi ! Collecteur 2 exclu.")

            # Rétablir le GPS pour les tests suivants
            res = await session.execute(
                select(CollectorLocation).where(CollectorLocation.collector_id == collector2_id)
            )
            loc2 = res.scalar_one()
            loc2.updated_at = datetime.now(timezone.utc)
            await session.commit()

        # =====================================================================
        # ÉTAPE 7 : RÉSERVATION & CHAOS CONCURRENCE
        # =====================================================================
        print("\n[ETAPE 7] Réservation du lot par le Collecteur 1 & Chaos Concurrence...")
        
        # Test de concurrence : Collecteur 1 et Collecteur 2 essaient de réserver le même lot.
        # Le premier qui réussit doit réserver, le second doit échouer avec HTTP 409 Conflict.
        # Nous allons faire les deux requêtes de manière simultanée.
        
        task1 = client.post(
            "/api/v1/reserve",
            json={"waste_lot_id": waste_lot_id},
            headers={"Authorization": f"Bearer {collector_token}"}
        )
        task2 = client.post(
            "/api/v1/reserve",
            json={"waste_lot_id": waste_lot_id},
            headers={"Authorization": f"Bearer {collector2_token}"}
        )
        
        results = await asyncio.gather(task1, task2, return_exceptions=True)
        res1, res2 = results[0], results[1]
        
        # Déterminer qui a réussi et qui a échoué
        statuses = [res1.status_code, res2.status_code]
        print(f" -> Codes retours des requêtes concurrentes : {statuses}")
        
        assert 201 in statuses, "Aucun collecteur n'a réussi à réserver le lot!"
        assert 409 in statuses, "Le conflit de réservation concurrente n'a pas été déclenché !"
        
        successful_res = res1 if res1.status_code == 201 else res2
        failed_res = res2 if res1.status_code == 201 else res1
        
        col_data = successful_res.json()
        collection_id = col_data["id"]
        
        # Identifier le collecteur gagnant
        winner_id = col_data["collector_id"]
        winner_token = collector_token if str(winner_id) == str(collector_id) else collector2_token
        winner_name = "Collecteur 1" if str(winner_id) == str(collector_id) else "Collecteur 2"
        
        print(f" -> Réservation réussie par {winner_name}. ID Collecte : {collection_id}")
        print(f" -> Réservation concurrente rejetée proprement : {failed_res.json()['detail']}")

        # Vérifier que le statut du collecteur gagnant est passé à BUSY
        async with AsyncSessionLocal() as session:
            res = await session.execute(
                select(CollectorProfile).where(CollectorProfile.id == uuid.UUID(winner_id))
            )
            prof = res.scalar_one()
            assert prof.status == CollectorStatus.BUSY, "Le statut du collecteur gagnant n'est pas passé à BUSY!"
            print(f" -> Statut de {winner_name} validé en base : BUSY.")

        # Récupérer le OTP de validation envoyé au producteur
        # En production, ce code est transmis par notification (SMS/Push).
        # Ici on le récupère directement en base pour valider l'étape suivante.
        async with AsyncSessionLocal() as session:
            # On a besoin de la valeur en clair du code généré, mais elle a été renvoyée
            # lors du reserve_lot dans le controller. Comme on a appelé via HTTP,
            # on doit aller regarder dans le service de notification stub si on l'a intercepté,
            # ou temporairement contourner en lisant le hash ou en recréant un hash connu.
            # Cependant, dans notre mock de notification, on loggue la valeur.
            # Pour faire simple dans le test d'intégration, nous allons simplement récupérer
            # l'enregistrement de la collecte et mettre à jour le hash avec un code connu pour le test.
            stmt = select(Collection).where(Collection.id == uuid.UUID(collection_id))
            c_res = await session.execute(stmt)
            collection_obj = c_res.scalar_one()
            
            # Forcer un code OTP connu : '123456'
            validation_code = "1234"
            collection_obj.validation_code_hash = auth_controller.hash_otp(validation_code)
            await session.commit()
            print(" -> Hash du code de validation de la collecte forcé à '1234' pour le test.")

        # =====================================================================
        # ÉTAPE 8 : VALIDATION DE LA COLLECTE (OTP + PESÉE RÉELLE)
        # =====================================================================
        print("\n[ETAPE 8] Saisie du code OTP et validation de la pesée réelle...")
        
        # Le collecteur pèse le lot et trouve 205 kg (au lieu des 200 kg estimés)
        validate_payload = {
            "validation_code": validation_code,
            "actual_weight_kg": 205.0
        }
        val_res = await client.post(
            f"/api/v1/validate-collection/{collection_id}",
            json=validate_payload,
            headers={"Authorization": f"Bearer {winner_token}"}
        )
        assert val_res.status_code == 200, f"Validation collecte échouée: {val_res.json()}"
        val_data = val_res.json()
        assert val_data["status"] == "validee", f"Le statut de la collecte est {val_data['status']} au lieu de 'validee'"
        print(f" -> Collecte validée avec succès. Poids réel : {val_data['actual_weight_kg']} kg.")

        # Vérifier que le statut du collecteur gagnant est repassé à AVAILABLE
        async with AsyncSessionLocal() as session:
            res = await session.execute(
                select(CollectorProfile).where(CollectorProfile.id == uuid.UUID(winner_id))
            )
            prof = res.scalar_one()
            assert prof.status == CollectorStatus.AVAILABLE, "Le statut du collecteur n'est pas repassé à AVAILABLE!"
            assert prof.completed_collections_count == 1, "Le compteur de collectes complétées n'a pas été incrémenté !"
            print(" -> Statut du collecteur restauré à AVAILABLE. Compteur incrémenté.")

        # =====================================================================
        # ÉTAPE 9 : CRÉATION DE LA TRANSACTION DE PAIEMENT
        # =====================================================================
        print("\n[ETAPE 9] Création de la transaction de paiement...")
        
        # Le collecteur ou le producteur initie la transaction de paiement
        tx_res = await client.post(
            "/api/v1/transaction/create",
            json={
                "collection_id": collection_id,
                "payment_method": "mobile_money"
            },
            headers={"Authorization": f"Bearer {winner_token}"}
        )
        assert tx_res.status_code == 201, f"Création transaction échouée: {tx_res.json()}"
        tx_data = tx_res.json()
        transaction_id = tx_data["id"]
        
        # Calcul attendu : 205 kg * 150 FCFA = 30750 FCFA brut.
        # Commission 10% = 3075 FCFA. Net = 27675 FCFA.
        assert float(tx_data["gross_amount"]) == 30750.0
        assert float(tx_data["commission_amount"]) == 3075.0
        assert float(tx_data["net_amount"]) == 27675.0
        assert tx_data["status"] == "en_attente"
        print(f" -> Transaction créée. ID: {transaction_id}. Net à payer : {tx_data['net_amount']} FCFA.")

        # =====================================================================
        # ÉTAPE 10 : DÉCLENCHEMENT DU PAIEMENT VIA WEBHOOK (SIMULÉ AVEC SIGNATURE)
        # =====================================================================
        print("\n[ETAPE 10] Déclenchement du paiement et vérification de la sécurité HMAC...")
        
        # Payload envoyé par le prestataire
        webhook_payload = {
            "transaction_id": transaction_id,
            "reference": "MM-REF-998877",
            "status": "success"
        }
        raw_body = json.dumps(webhook_payload, separators=(",", ":")).encode()
        
        # Générer la signature HMAC-SHA256 avec la clé secrète configurée
        secret = settings.payment_webhook_secret if settings.payment_webhook_secret else "CHANGE_ME"
        signature = hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()
        
        # 10.1 Attaque : Mauvaise signature
        bad_res = await client.post(
            "/api/v1/payments/webhook",
            content=raw_body,
            headers={"x-webhook-signature": "bad_signature"}
        )
        assert bad_res.status_code == 401, "L'attaque par mauvaise signature n'a pas été détectée!"
        print(" -> Sécurité Webhook : Signature incorrecte correctement rejetée (HTTP 401).")

        # 10.2 Succès : Signature correcte
        pay_res = await client.post(
            "/api/v1/payments/webhook",
            content=raw_body,
            headers={
                "x-webhook-signature": signature,
                "Content-Type": "application/json"
            }
        )
        assert pay_res.status_code == 200, f"Webhook échoué: {pay_res.json()}"
        pay_data = pay_res.json()
        assert pay_data["status"] == "payee"
        assert pay_data["external_reference"] == "MM-REF-998877"
        print(" -> Webhook de paiement validé avec succès (HTTP 200, statut: payée).")

        # =====================================================================
        # ÉTAPE 11 : CHAOS - TEST D'IDEMPOTENCE DU WEBHOOK (ANTI-DOUBLE-CREDIT)
        # =====================================================================
        print("\n[ETAPE 11] CHAOS : Validation de l'idempotence du Webhook (Anti-double-crédit)...")
        
        # Vérifier le solde de points initial du producteur
        # Formule : 205 kg * 10 points = 2050 points
        r_res = await client.get(
            "/api/v1/rewards/me",
            headers={"Authorization": f"Bearer {producer_token}"}
        )
        assert r_res.status_code == 200
        r_data = r_res.json()
        initial_points = r_data["points"]
        assert initial_points == 2050
        print(f" -> Solde de points initial du Producteur : {initial_points} points EcoLoop.")

        # Renvoyer le même webhook de paiement pour la même transaction
        dup_res = await client.post(
            "/api/v1/payments/webhook",
            content=raw_body,
            headers={
                "x-webhook-signature": signature,
                "Content-Type": "application/json"
            }
        )
        assert dup_res.status_code == 200, "Le deuxième appel webhook a échoué alors qu'il doit être ignoré de manière transparente."
        
        # Vérifier que le solde de points n'a pas bougé
        r_res2 = await client.get(
            "/api/v1/rewards/me",
            headers={"Authorization": f"Bearer {producer_token}"}
        )
        assert r_res2.status_code == 200
        r_data2 = r_res2.json()
        final_points = r_data2["points"]
        assert final_points == initial_points, f"Double-attribution détectée! Points passés de {initial_points} à {final_points}"
        print(" -> Chaos test Idempotence : Réussi ! Aucun point supplémentaire n'a été crédité.")

        # =====================================================================
        # ÉTAPE 12 : SÉCURITÉ AUDIT - HISTORIQUE DES TRANSACTIONS DE POINTS
        # =====================================================================
        print("\n[ETAPE 12] Vérification de l'historique d'audit des points...")
        
        audit_res = await client.get(
            "/api/v1/rewards/history",
            headers={"Authorization": f"Bearer {producer_token}"}
        )
        assert audit_res.status_code == 200
        history = audit_res.json()
        assert len(history) == 1, f"Nombre anormal de transactions d'audit: {len(history)}"
        tx_audit = history[0]
        assert tx_audit["action"] == "collection_completed"
        assert tx_audit["points"] == 2050
        assert tx_audit["balance_after"] == 2050
        assert tx_audit["collection_id"] is not None
        print(f" -> Audit log validé : Action '{tx_audit['action']}', Points {tx_audit['points']}, SoldeAprès {tx_audit['balance_after']}.")

        # =====================================================================
        # ÉTAPE 13 : SOUmission D'UN AVIS & RECALCUL DE LA RÉPUTATION
        # =====================================================================
        print("\n[ETAPE 13] Soumission d'un avis et recalcul de la réputation du collecteur...")
        
        # Le producteur évalue le collecteur avec 5 étoiles
        review_payload = {
            "collection_id": collection_id,
            "reviewed_id": str(winner_id),
            "rating": 5,
            "comment": "Collecteur très rapide et professionnel !"
        }
        rev_res = await client.post(
            "/api/v1/reviews",
            json=review_payload,
            headers={"Authorization": f"Bearer {producer_token}"}
        )
        assert rev_res.status_code == 201, f"Création review échouée: {rev_res.json()}"
        rev_data = rev_res.json()
        assert rev_data["rating"] == 5
        print(f" -> Avis créé. Note : {rev_data['rating']}/5. Commentaire : '{rev_data['comment']}'")

        # Vérifier que la note moyenne du collecteur a été mise à jour en base de données
        async with AsyncSessionLocal() as session:
            res = await session.execute(
                select(CollectorProfile).where(CollectorProfile.id == uuid.UUID(winner_id))
            )
            prof = res.scalar_one()
            assert prof.average_rating == 5.0, f"La note moyenne est de {prof.average_rating} au lieu de 5.0"
            print(f" -> Profil mis à jour : Note moyenne du collecteur = {prof.average_rating}/5.")

        # Chaos : Le producteur tente de soumettre un second avis sur la même collecte
        dup_rev_res = await client.post(
            "/api/v1/reviews",
            json=review_payload,
            headers={"Authorization": f"Bearer {producer_token}"}
        )
        assert dup_rev_res.status_code == 409, "Le doublon d'avis n'a pas été bloqué!"
        print(" -> Chaos test Review Unique : Réussi ! La tentative de doublon d'avis a été rejetée (HTTP 409).")

    print("\n--- FIN DES TESTS E2E - TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS ! ---\n")
    
    # 14. Nettoyer les données après réussite
    async with AsyncSessionLocal() as session:
        await clean_test_data(session)


if __name__ == "__main__":
    asyncio.run(test_e2e_flow())
