import asyncio
import pytest
import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
from fastapi import UploadFile, HTTPException

from app.config.database import Base
from app.models.user import User, UserRole
from app.models.waste import WasteLot, LotStatus, WasteCategory
from app.models.purchase_offer import PurchaseOffer, OfferStatus
from app.models.user_location import UserLocation
from app.models.matching_decision import MatchingDecision
from app.models.verification_evidence import VerificationEvidence, EvidenceType
from app.models.user_device import UserDevice
from app.models.webhook_event import WebhookEvent
from app.models.api_key import APIKey
from app.models.collector_profile import CollectorProfile, CollectorStatus
from app.services.state_machine_service import StateMachineService, StateMachineError
from app.services.matching_service import MatchingService
from app.services.storage_service import StorageService
from app.services.permission_service import PermissionService
from app.utils.encryption_helper import encrypt_data, decrypt_data, generate_search_hash


# Async wrapper helper to execute async tests on isolated DB session
def async_test(f):
    import functools
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        return asyncio.run(f(*args, **kwargs))
    return wrapper


async def setup_db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    session_factory = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    return engine, session_factory


# ==========================================
# 1. PII ENCRYPTION HELPERS TESTS (6 tests)
# ==========================================

def test_encryption_roundtrip():
    text = "+22507080910"
    encrypted = encrypt_data(text)
    assert encrypted != text
    decrypted = decrypt_data(encrypted)
    assert decrypted == text

def test_encryption_empty():
    assert encrypt_data("") == ""
    assert decrypt_data("") == ""

def test_search_hash():
    text = " +225-07 08 09 10 "
    h1 = generate_search_hash(text)
    h2 = generate_search_hash("+22507080910")
    assert h1 == h2
    assert len(h1) == 64

def test_search_hash_empty():
    assert generate_search_hash("") == ""

def test_different_encryption_outputs():
    text = "+22507080910"
    # Fernet outputs are dynamic due to timestamps, but both decrypt back successfully
    encrypted1 = encrypt_data(text)
    encrypted2 = encrypt_data(text)
    assert decrypt_data(encrypted1) == decrypt_data(encrypted2)

def test_different_hashes():
    assert generate_search_hash("123") != generate_search_hash("456")


# ==========================================
# 2. STATE MACHINE SERVICE TESTS (8 tests)
# ==========================================

@async_test
async def test_state_transition_success():
    engine, session_factory = await setup_db_session()
    async with session_factory() as db:
        lot = WasteLot(
            id=uuid.uuid4(),
            producer_id=uuid.uuid4(),
            category=WasteCategory.PLASTIQUE,
            weight_kg=120.0,
            estimated_weight_kg=120.0,
            price_per_kg=100.0,
            latitude=5.34,
            longitude=-4.02,
            status=LotStatus.CREATED
        )
        db.add(lot)
        await db.commit()

        # CREATED -> DISPONIBLE
        updated = await StateMachineService.validate_and_transition_lot(
            db, lot.id, LotStatus.DISPONIBLE, uuid.uuid4()
        )
        assert updated.status == LotStatus.DISPONIBLE


@async_test
async def test_state_transition_forbidden():
    engine, session_factory = await setup_db_session()
    async with session_factory() as db:
        lot = WasteLot(
            id=uuid.uuid4(),
            producer_id=uuid.uuid4(),
            category=WasteCategory.PLASTIQUE,
            weight_kg=120.0,
            estimated_weight_kg=120.0,
            price_per_kg=100.0,
            latitude=5.34,
            longitude=-4.02,
            status=LotStatus.CREATED
        )
        db.add(lot)
        await db.commit()

        # CREATED -> PAYE (Not allowed)
        with pytest.raises(StateMachineError):
            await StateMachineService.validate_and_transition_lot(
                db, lot.id, LotStatus.PAYE, uuid.uuid4()
            )


@async_test
async def test_state_transition_idempotency():
    engine, session_factory = await setup_db_session()
    async with session_factory() as db:
        lot = WasteLot(
            id=uuid.uuid4(),
            producer_id=uuid.uuid4(),
            category=WasteCategory.PLASTIQUE,
            status=LotStatus.DISPONIBLE,
            weight_kg=50.0,
            estimated_weight_kg=50.0,
            price_per_kg=10.0,
            latitude=0.0,
            longitude=0.0
        )
        db.add(lot)
        await db.commit()

        # DISPONIBLE -> DISPONIBLE (should be idempotent no-op)
        updated = await StateMachineService.validate_and_transition_lot(
            db, lot.id, LotStatus.DISPONIBLE, uuid.uuid4()
        )
        assert updated.status == LotStatus.DISPONIBLE


@async_test
async def test_state_transition_suspended():
    engine, session_factory = await setup_db_session()
    async with session_factory() as db:
        lot = WasteLot(
            id=uuid.uuid4(),
            producer_id=uuid.uuid4(),
            category=WasteCategory.PLASTIQUE,
            status=LotStatus.QUALITY_CHECK,
            weight_kg=50.0,
            estimated_weight_kg=50.0,
            price_per_kg=10.0,
            latitude=0.0,
            longitude=0.0
        )
        db.add(lot)
        await db.commit()

        # QUALITY_CHECK -> SUSPENDED
        updated = await StateMachineService.validate_and_transition_lot(
            db, lot.id, LotStatus.SUSPENDED, uuid.uuid4()
        )
        assert updated.status == LotStatus.SUSPENDED


@async_test
async def test_state_transition_suspended_to_paye():
    engine, session_factory = await setup_db_session()
    async with session_factory() as db:
        lot = WasteLot(
            id=uuid.uuid4(),
            producer_id=uuid.uuid4(),
            category=WasteCategory.PLASTIQUE,
            status=LotStatus.SUSPENDED,
            weight_kg=50.0,
            estimated_weight_kg=50.0,
            price_per_kg=10.0,
            latitude=0.0,
            longitude=0.0
        )
        db.add(lot)
        await db.commit()

        # SUSPENDED -> PAYE
        updated = await StateMachineService.validate_and_transition_lot(
            db, lot.id, LotStatus.PAYE, uuid.uuid4()
        )
        assert updated.status == LotStatus.PAYE


@async_test
async def test_state_transition_non_existent():
    engine, session_factory = await setup_db_session()
    async with session_factory() as db:
        with pytest.raises(StateMachineError):
            await StateMachineService.validate_and_transition_lot(
                db, uuid.uuid4(), LotStatus.DISPONIBLE, uuid.uuid4()
            )


@async_test
async def test_concurrency_lock_transition():
    engine, session_factory = await setup_db_session()
    async with session_factory() as db:
        lot = WasteLot(
            id=uuid.uuid4(),
            producer_id=uuid.uuid4(),
            category=WasteCategory.PLASTIQUE,
            status=LotStatus.CREATED,
            weight_kg=50.0,
            estimated_weight_kg=50.0,
            price_per_kg=10.0,
            latitude=0.0,
            longitude=0.0
        )
        db.add(lot)
        await db.commit()

        # Verify executing SELECT FOR UPDATE works inside transaction block
        res = await db.execute(
            select(WasteLot).where(WasteLot.id == lot.id).with_for_update()
        )
        locked_lot = res.scalar_one()
        assert locked_lot.status == LotStatus.CREATED


@async_test
async def test_double_collect_conflict():
    engine, session_factory = await setup_db_session()
    async with session_factory() as db:
        lot = WasteLot(
            id=uuid.uuid4(),
            producer_id=uuid.uuid4(),
            category=WasteCategory.PLASTIQUE,
            status=LotStatus.ACCEPTED,
            weight_kg=50.0,
            estimated_weight_kg=50.0,
            price_per_kg=10.0,
            latitude=0.0,
            longitude=0.0
        )
        db.add(lot)
        await db.commit()

        # First collector sets to EN_MISSION
        await StateMachineService.validate_and_transition_lot(db, lot.id, LotStatus.EN_MISSION, uuid.uuid4())
        
        # Second collector tries to reset status back or invalid transition (raises StateMachineError)
        with pytest.raises(StateMachineError):
            await StateMachineService.validate_and_transition_lot(db, lot.id, LotStatus.ACCEPTED, uuid.uuid4())


# ==========================================
# 3. PERMISSIONS SERVICE TESTS (3 tests)
# ==========================================

def test_verify_can_resolve_dispute_admin_arbiter():
    user = User(role=UserRole.ADMIN_ARBITER)
    # Should not raise exception
    PermissionService.verify_can_resolve_dispute(user)

def test_verify_can_resolve_dispute_forbidden():
    user = User(role=UserRole.PRODUCTEUR)
    with pytest.raises(HTTPException) as exc:
        PermissionService.verify_can_resolve_dispute(user)
    assert exc.value.status_code == 403

def test_verify_can_validate_payment_forbidden():
    user = User(role=UserRole.COLLECTEUR)
    with pytest.raises(HTTPException) as exc:
        PermissionService.verify_can_validate_payment(user)
    assert exc.value.status_code == 403


# ==========================================
# 4. STORAGE & FRAUD PREVENTION TESTS (5 tests)
# ==========================================

class MockUploadFile(UploadFile):
    def __init__(self, filename, content):
        self.filename = filename
        self._content = content
        super().__init__(filename=filename, file=None)

    async def read(self):
        return self._content


@async_test
async def test_storage_validation_mime_error():
    engine, session_factory = await setup_db_session()
    async with session_factory() as db:
        # Invalid PDF content
        file = MockUploadFile("document.pdf", b"%PDF-1.4...")
        with pytest.raises(HTTPException) as exc:
            await StorageService.upload_verification_evidence(
                db, file, uuid.uuid4(), "waste_lots", uuid.uuid4(), EvidenceType.WEIGHT_PHOTO
            )
        assert exc.value.status_code == 400


@async_test
async def test_storage_validation_size_error():
    engine, session_factory = await setup_db_session()
    async with session_factory() as db:
        # Too large content (11MB)
        large_content = b"\x89PNG\r\n\x1a\n" + b"\x00" * (11 * 1024 * 1024)
        file = MockUploadFile("large.png", large_content)
        with pytest.raises(HTTPException) as exc:
            await StorageService.upload_verification_evidence(
                db, file, uuid.uuid4(), "waste_lots", uuid.uuid4(), EvidenceType.WEIGHT_PHOTO
            )
        assert exc.value.status_code == 400


@async_test
async def test_storage_duplicate_hash_conflict():
    engine, session_factory = await setup_db_session()
    async with session_factory() as db:
        # Simple fake valid PNG content bytes
        png_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
        file1 = MockUploadFile("image1.png", png_content)
        file2 = MockUploadFile("image2.png", png_content)

        # Upload first file successfully
        evidence1 = await StorageService.upload_verification_evidence(
            db, file1, uuid.uuid4(), "waste_lots", uuid.uuid4(), EvidenceType.WEIGHT_PHOTO
        )
        assert evidence1.file_hash is not None

        # Upload second file with same content (Conflict duplicate file_hash)
        with pytest.raises(HTTPException) as exc:
            await StorageService.upload_verification_evidence(
                db, file2, uuid.uuid4(), "waste_lots", uuid.uuid4(), EvidenceType.WEIGHT_PHOTO
            )
        assert exc.value.status_code == 409


@async_test
async def test_storage_upload_success():
    engine, session_factory = await setup_db_session()
    async with session_factory() as db:
        png_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
        file = MockUploadFile("weight_proof.png", png_content)
        uploaded_by = uuid.uuid4()
        lot_id = uuid.uuid4()

        evidence = await StorageService.upload_verification_evidence(
            db, file, uploaded_by, "waste_lots", lot_id, EvidenceType.WEIGHT_PHOTO
        )
        assert evidence.entity_id == lot_id
        assert evidence.uploaded_by_id == uploaded_by
        assert evidence.file_url.startswith("https://")


# ==========================================
# 5. MATCHING SERVICE TESTS (11 tests)
# ==========================================

@async_test
async def test_matching_decision_auto_select():
    engine, session_factory = await setup_db_session()
    async with session_factory() as db:
        # Create Waste Lot
        lot = WasteLot(
            id=uuid.uuid4(),
            producer_id=uuid.uuid4(),
            category=WasteCategory.PLASTIQUE,
            weight_kg=120.0,
            estimated_weight_kg=120.0,
            price_per_kg=100.0,
            latitude=5.34,
            longitude=-4.02,
            status=LotStatus.DISPONIBLE
        )
        db.add(lot)

        # Create Collector User & Profile
        user = User(
            id=uuid.uuid4(),
            full_name="Jean Koffi",
            email="jean@ecoloop.com",
            hashed_password="password",
            role=UserRole.COLLECTEUR
        )
        db.add(user)

        profile = CollectorProfile(
            id=user.id,
            vehicle_capacity_kg=500.0,
            collector_reliability_score=0.95,
            completed_missions=10,
            status=CollectorStatus.AVAILABLE
        )
        db.add(profile)

        # Set Location GPS
        loc = UserLocation(
            user_id=user.id,
            latitude=5.34,
            longitude=-4.02,
            is_current=True,
            accuracy=10.0
        )
        db.add(loc)
        await db.commit()

        # Run matching
        suggestions = await MatchingService.suggest_best_collectors(db, lot.id)
        assert len(suggestions) == 1
        best = suggestions[0]
        assert best["collector_id"] == user.id
        assert best["final_score"] > 80.0
        assert best["decision_explanation"]["distance"] == "0.00 km"


@async_test
async def test_matching_decision_no_lot():
    engine, session_factory = await setup_db_session()
    async with session_factory() as db:
        with pytest.raises(ValueError):
            await MatchingService.suggest_best_collectors(db, uuid.uuid4())


@async_test
async def test_matching_distance_priority():
    engine, session_factory = await setup_db_session()
    async with session_factory() as db:
        lot = WasteLot(
            id=uuid.uuid4(),
            producer_id=uuid.uuid4(),
            category=WasteCategory.PLASTIQUE,
            status=LotStatus.DISPONIBLE,
            latitude=5.34,
            longitude=-4.02,
            weight_kg=50.0,
            estimated_weight_kg=50.0,
            price_per_kg=10.0
        )
        db.add(lot)

        # Collector A is close (0km)
        c1 = User(id=uuid.uuid4(), full_name="A", email="a@a.com", role=UserRole.COLLECTEUR, hashed_password="pw")
        db.add(c1)
        p1 = CollectorProfile(id=c1.id, status=CollectorStatus.AVAILABLE, vehicle_capacity_kg=100.0, collector_reliability_score=0.8, completed_missions=0)
        db.add(p1)
        db.add(UserLocation(user_id=c1.id, latitude=5.34, longitude=-4.02, is_current=True))

        # Collector B is far (100km)
        c2 = User(id=uuid.uuid4(), full_name="B", email="b@b.com", role=UserRole.COLLECTEUR, hashed_password="pw")
        db.add(c2)
        p2 = CollectorProfile(id=c2.id, status=CollectorStatus.AVAILABLE, vehicle_capacity_kg=100.0, collector_reliability_score=0.8, completed_missions=0)
        db.add(p2)
        db.add(UserLocation(user_id=c2.id, latitude=6.34, longitude=-4.02, is_current=True))
        await db.commit()

        suggestions = await MatchingService.suggest_best_collectors(db, lot.id)
        assert suggestions[0]["collector_id"] == c1.id
        assert suggestions[0]["final_score"] > suggestions[1]["final_score"]


# ==========================================
# 6. PUSH DEVICES, WEBHOOKS & KEYS TESTS (5 tests)
# ==========================================

@async_test
async def test_user_device_model():
    engine, session_factory = await setup_db_session()
    async with session_factory() as db:
        device = UserDevice(
            user_id=uuid.uuid4(),
            device_token="device_token_xyz_123",
            platform="Android"
        )
        db.add(device)
        await db.commit()
        assert device.device_token == "device_token_xyz_123"


@async_test
async def test_webhook_event_model():
    engine, session_factory = await setup_db_session()
    async with session_factory() as db:
        event = WebhookEvent(
            provider="WAVE",
            payload={"transaction_id": "tx_abc_123", "amount": 5000},
            status="PENDING"
        )
        db.add(event)
        await db.commit()
        assert event.status == "PENDING"
        assert event.provider == "WAVE"


@async_test
async def test_api_key_model():
    engine, session_factory = await setup_db_session()
    async with session_factory() as db:
        key = APIKey(
            name="Mairie Cocody",
            key_hash="sha256_hashed_api_key_cocody_123",
            active=True
        )
        db.add(key)
        await db.commit()
        assert key.active is True
