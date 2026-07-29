#!/usr/bin/env python3
"""
Seed script — populates demo data for 4 existing demo accounts & the admin.
Idempotent: deletes previous demo data before inserting fresh data.

Usage:
    DATABASE_URL="postgresql://user:pass@host:5432/db" python seed_demo_data.py
"""

import asyncio
import os
import sys
import uuid
from datetime import datetime, timezone, timedelta

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/ecoloop"
)


def _rewrite_url(url: str) -> str:
    url = url.replace("postgresql://", "postgresql+psycopg://")
    url = url.replace("+asyncpg", "+psycopg")
    return url


async def get_users(session: AsyncSession) -> dict:
    emails = [
        "demo-producteur@ecoloop.ci",
        "demo-collecteur@ecoloop.ci",
        "demo-industriel@ecoloop.ci",
        "demo-mairie@ecoloop.ci",
        "elielpaul3@gmail.com",
    ]
    result = await session.execute(
        text("SELECT id, email, role, full_name FROM users WHERE email = ANY(:emails)"),
        {"emails": emails},
    )
    rows = result.fetchall()
    users = {}
    for row in rows:
        users[row._mapping["email"]] = {
            "id": row._mapping["id"],
            "role": row._mapping["role"],
            "full_name": row._mapping["full_name"],
        }
    found = [e for e in emails if e in users]
    missing = [e for e in emails if e not in users]
    if missing:
        print(f"WARNING: users not found: {missing}")
    print(f"Found {len(found)} demo users: {found}")
    return users


async def delete_existing_data(session: AsyncSession):
    tables = [
        "mission_lots",
        "reviews",
        "eco_point_transactions",
        "eco_point_accounts",
        "transactions",
        "purchase_offers",
        "illegal_dump_reports",
        "collections",
        "collection_missions",
        "notifications",
        "waste_lots",
    ]
    for t in tables:
        await session.execute(text(f"DELETE FROM {t}"))
    await session.commit()
    print("Deleted existing seed data.")


def _ago(**kwargs):
    return datetime.now(timezone.utc) - timedelta(**kwargs)


async def seed(session: AsyncSession, users: dict):
    prod = users["demo-producteur@ecoloop.ci"]
    coll = users["demo-collecteur@ecoloop.ci"]
    ind  = users["demo-industriel@ecoloop.ci"]
    mair = users["demo-mairie@ecoloop.ci"]
    admin = users.get("elielpaul3@gmail.com")

    now = datetime.now(timezone.utc)

    # ── Waste Lots ──────────────────────────────────────────────────────
    lots_data = [
        {
            "id": uuid.uuid4(),
            "category": "PLASTIQUE",
            "description": "25 kg de bouteilles plastique propres et triées",
            "weight_kg": 25.0,
            "estimated_weight_kg": 25.0,
            "actual_weight_kg": None,
            "price_per_kg": 180,
            "latitude": 5.3523,
            "longitude": -3.9912,
            "status": "DISPONIBLE",
            "producer_id": prod["id"],
            "collector_id": None,
        },
        {
            "id": uuid.uuid4(),
            "category": "CARTON",
            "description": "50 kg de cartons de livraison pliés",
            "weight_kg": 50.0,
            "estimated_weight_kg": 50.0,
            "actual_weight_kg": None,
            "price_per_kg": 150,
            "latitude": 5.3197,
            "longitude": -4.0204,
            "status": "DISPONIBLE",
            "producer_id": prod["id"],
            "collector_id": None,
        },
        {
            "id": uuid.uuid4(),
            "category": "METAL",
            "description": "15 kg de chutes de métal (fer, aluminium)",
            "weight_kg": 15.0,
            "estimated_weight_kg": 15.0,
            "actual_weight_kg": None,
            "price_per_kg": 250,
            "latitude": 5.4163,
            "longitude": -4.0237,
            "status": "OFFER_RECEIVED",
            "producer_id": prod["id"],
            "collector_id": None,
        },
        {
            "id": uuid.uuid4(),
            "category": "VERRE",
            "description": "30 kg de bouteilles en verre consignées",
            "weight_kg": 30.0,
            "estimated_weight_kg": 30.0,
            "actual_weight_kg": None,
            "price_per_kg": 120,
            "latitude": 5.2969,
            "longitude": -3.9948,
            "status": "ACCEPTED",
            "producer_id": prod["id"],
            "collector_id": coll["id"],
        },
        {
            "id": uuid.uuid4(),
            "category": "ORGANIQUE",
            "description": "80 kg de déchets organiques de restaurant (épluchures, restes)",
            "weight_kg": 80.0,
            "estimated_weight_kg": 80.0,
            "actual_weight_kg": None,
            "price_per_kg": 100,
            "latitude": 5.3575,
            "longitude": -4.0799,
            "status": "EN_MISSION",
            "producer_id": prod["id"],
            "collector_id": coll["id"],
        },
        {
            "id": uuid.uuid4(),
            "category": "PLASTIQUE",
            "description": "120 kg de déchets plastiques mélangés (films, bouteilles, bidons)",
            "weight_kg": 120.0,
            "estimated_weight_kg": 120.0,
            "actual_weight_kg": 118.5,
            "price_per_kg": 200,
            "latitude": 5.3614,
            "longitude": -3.9832,
            "status": "COLLECTE",
            "producer_id": prod["id"],
            "collector_id": coll["id"],
        },
        {
            "id": uuid.uuid4(),
            "category": "CARTON",
            "description": "45 kg de papiers et cartons de bureau",
            "weight_kg": 45.0,
            "estimated_weight_kg": 45.0,
            "actual_weight_kg": 44.0,
            "price_per_kg": 150,
            "latitude": 5.3251,
            "longitude": -4.0165,
            "status": "PAYE",
            "producer_id": prod["id"],
            "collector_id": coll["id"],
        },
        {
            "id": uuid.uuid4(),
            "category": "ELECTRONIQUE",
            "description": "10 kg de petits déchets électroniques (cartes, câbles, chargeurs)",
            "weight_kg": 10.0,
            "estimated_weight_kg": 10.0,
            "actual_weight_kg": None,
            "price_per_kg": 350,
            "latitude": 5.3034,
            "longitude": -4.0068,
            "status": "DISPONIBLE",
            "producer_id": prod["id"],
            "collector_id": None,
        },
    ]

    for lot in lots_data:
        await session.execute(
            text("""
                INSERT INTO waste_lots
                    (id, producer_id, collector_id, category, description,
                     weight_kg, estimated_weight_kg, actual_weight_kg,
                     price_per_kg, latitude, longitude, status,
                     created_at, updated_at)
                VALUES
                    (:id, :producer_id, :collector_id, :category, :description,
                     :weight_kg, :estimated_weight_kg, :actual_weight_kg,
                     :price_per_kg, :latitude, :longitude, :status,
                     :created_at, :updated_at)
            """),
            {
                **lot,
                "created_at": _ago(days=20),
                "updated_at": _ago(days=1),
            },
        )
    print(f"Created {len(lots_data)} waste lots.")

    # ── Collections ─────────────────────────────────────────────────────
    lots_map = {lot["status"]: lot for lot in lots_data}
    collection_statuses = {"COLLECTE": "RESERVEE", "PAYE": "VALIDEE"}
    cols = []
    for lot in lots_data:
        if lot["status"] in ("COLLECTE", "PAYE"):
            cid = uuid.uuid4()
            cols.append(cid)
            await session.execute(
                text("""
                    INSERT INTO collections
                        (id, waste_lot_id, collector_id, status,
                         actual_weight_kg, estimated_weight_kg,
                         reserved_at, validated_at)
                    VALUES
                        (:id, :waste_lot_id, :collector_id, :status,
                         :actual_weight_kg, :estimated_weight_kg,
                         :reserved_at, :validated_at)
                """),
                {
                    "id": cid,
                    "waste_lot_id": lot["id"],
                    "collector_id": coll["id"],
                    "status": collection_statuses[lot["status"]],
                    "actual_weight_kg": lot["actual_weight_kg"],
                    "estimated_weight_kg": lot["estimated_weight_kg"],
                    "reserved_at": _ago(days=10),
                    "validated_at": _ago(days=5) if lot["status"] == "PAYE" else None,
                },
            )
    print(f"Created {len(cols)} collections.")

    # ── Collection Missions ─────────────────────────────────────────────
    missions_data = [
        {
            "id": uuid.uuid4(),
            "zone": "Cocody",
            "status": "COMPLETED",
            "capacity_kg": 200,
            "center_lat": 5.3550,
            "center_lng": -3.9900,
            "radius_km": 3.0,
            "assigned_at": _ago(days=12),
            "accepted_at": _ago(days=12),
            "started_at": _ago(days=11),
            "completed_at": _ago(days=10),
        },
        {
            "id": uuid.uuid4(),
            "zone": "Abobo",
            "status": "IN_PROGRESS",
            "capacity_kg": 150,
            "center_lat": 5.4160,
            "center_lng": -4.0250,
            "radius_km": 2.5,
            "assigned_at": _ago(days=3),
            "accepted_at": _ago(days=3),
            "started_at": _ago(days=2),
            "completed_at": None,
        },
        {
            "id": uuid.uuid4(),
            "zone": "Plateau",
            "status": "PENDING",
            "capacity_kg": 300,
            "center_lat": 5.3200,
            "center_lng": -4.0200,
            "radius_km": 4.0,
            "assigned_at": _ago(days=1),
            "accepted_at": None,
            "started_at": None,
            "completed_at": None,
        },
        {
            "id": uuid.uuid4(),
            "zone": "Yopougon",
            "status": "COMPLETED",
            "capacity_kg": 100,
            "center_lat": 5.3550,
            "center_lng": -4.0800,
            "radius_km": 2.0,
            "assigned_at": _ago(days=8),
            "accepted_at": _ago(days=8),
            "started_at": _ago(days=7),
            "completed_at": _ago(days=6),
        },
        {
            "id": uuid.uuid4(),
            "zone": "Marcory",
            "status": "PENDING",
            "capacity_kg": 250,
            "center_lat": 5.2950,
            "center_lng": -3.9950,
            "radius_km": 3.5,
            "assigned_at": _ago(days=1),
            "accepted_at": None,
            "started_at": None,
            "completed_at": None,
        },
    ]

    for m in missions_data:
        await session.execute(
            text("""
                INSERT INTO collection_missions
                    (id, collector_id, creator_id, assigned_collector_id,
                     status, zone, capacity_kg, center_lat, center_lng, radius_km,
                     assigned_at, accepted_at, started_at, completed_at,
                     created_at, updated_at)
                VALUES
                    (:id, :collector_id, :creator_id, :assigned_collector_id,
                     :status, :zone, :capacity_kg, :center_lat, :center_lng, :radius_km,
                     :assigned_at, :accepted_at, :started_at, :completed_at,
                     :created_at, :updated_at)
            """),
            {
                "id": m["id"],
                "collector_id": coll["id"],
                "creator_id": admin["id"] if admin else coll["id"],
                "assigned_collector_id": coll["id"],
                "status": m["status"],
                "zone": m["zone"],
                "capacity_kg": m["capacity_kg"],
                "center_lat": m["center_lat"],
                "center_lng": m["center_lng"],
                "radius_km": m["radius_km"],
                "assigned_at": m["assigned_at"],
                "accepted_at": m["accepted_at"],
                "started_at": m["started_at"],
                "completed_at": m["completed_at"],
                "created_at": _ago(days=12),
                "updated_at": _ago(days=1),
            },
        )
    print(f"Created {len(missions_data)} collection missions.")

    # ── Mission Lots ────────────────────────────────────────────────────
    mission_lots_data = [
        {"mission_id": missions_data[0]["id"], "lot_id": lots_data[5]["id"], "sequence_order": 1, "status": "COLLECTE", "arrival_status": "COLLECTED"},
        {"mission_id": missions_data[0]["id"], "lot_id": lots_data[6]["id"], "sequence_order": 2, "status": "COLLECTE", "arrival_status": "COLLECTED"},
        {"mission_id": missions_data[1]["id"], "lot_id": lots_data[2]["id"], "sequence_order": 1, "status": "ASSIGNED", "arrival_status": "WAITING"},
        {"mission_id": missions_data[3]["id"], "lot_id": lots_data[4]["id"], "sequence_order": 1, "status": "COLLECTE", "arrival_status": "COLLECTED"},
        {"mission_id": missions_data[4]["id"], "lot_id": lots_data[3]["id"], "sequence_order": 1, "status": "ASSIGNED", "arrival_status": "WAITING"},
    ]

    for ml in mission_lots_data:
        await session.execute(
            text("""
                INSERT INTO mission_lots
                    (mission_id, lot_id, sequence_order, status, arrival_status)
                VALUES
                    (:mission_id, :lot_id, :sequence_order, :status, :arrival_status)
            """),
            ml,
        )
    print(f"Created {len(mission_lots_data)} mission lots.")

    # ── Purchase Offers (INDUSTRIEL) ────────────────────────────────────
    offers_data = [
        {"lot_id": lots_data[0]["id"], "company_id": ind["id"], "price_per_kg": 180, "initial_price_per_kg": 180, "final_price_per_kg": 180, "status": "PENDING"},
        {"lot_id": lots_data[2]["id"], "company_id": ind["id"], "price_per_kg": 250, "initial_price_per_kg": 230, "final_price_per_kg": 250, "status": "ACCEPTED", "accepted_by_user_id": prod["id"]},
        {"lot_id": lots_data[3]["id"], "company_id": ind["id"], "price_per_kg": 120, "initial_price_per_kg": 120, "final_price_per_kg": 120, "status": "PENDING"},
        {"lot_id": lots_data[5]["id"], "company_id": ind["id"], "price_per_kg": 200, "initial_price_per_kg": 190, "final_price_per_kg": 195, "status": "REJECTED"},
        {"lot_id": lots_data[7]["id"], "company_id": ind["id"], "price_per_kg": 350, "initial_price_per_kg": 350, "final_price_per_kg": 350, "status": "PENDING"},
    ]

    for o in offers_data:
        await session.execute(
            text("""
                INSERT INTO purchase_offers
                    (id, lot_id, company_id, price_per_kg, initial_price_per_kg,
                     final_price_per_kg, status, currency, accepted_by_user_id,
                     created_at, updated_at)
                VALUES
                    (:id, :lot_id, :company_id, :price_per_kg, :initial_price_per_kg,
                     :final_price_per_kg, :status, 'XOF', :accepted_by_user_id,
                     :created_at, :updated_at)
            """),
            {
                "id": uuid.uuid4(),
                "lot_id": o["lot_id"],
                "company_id": o["company_id"],
                "price_per_kg": o["price_per_kg"],
                "initial_price_per_kg": o["initial_price_per_kg"],
                "final_price_per_kg": o["final_price_per_kg"],
                "status": o["status"],
                "accepted_by_user_id": o.get("accepted_by_user_id"),
                "created_at": _ago(days=15),
                "updated_at": _ago(days=5),
            },
        )
    print(f"Created {len(offers_data)} purchase offers.")

    # ── Transactions ────────────────────────────────────────────────────
    # PRODUCTEUR transactions
    prod_txns = [
        {
            "id": uuid.uuid4(),
            "producer_id": prod["id"],
            "collector_id": coll["id"],
            "lot_id": lots_data[6]["id"],
            "collection_id": cols[1] if len(cols) > 1 else None,
            "gross_amount": 6750,
            "commission_amount": 675,
            "net_amount": 6075,
            "payment_method": "MOBILE_MONEY",
            "status": "PAYEE",
            "paid_at": _ago(days=4),
        },
        {
            "id": uuid.uuid4(),
            "producer_id": prod["id"],
            "collector_id": coll["id"],
            "lot_id": lots_data[5]["id"],
            "collection_id": cols[0] if len(cols) > 0 else None,
            "gross_amount": 24000,
            "commission_amount": 2400,
            "net_amount": 21600,
            "payment_method": "MOBILE_MONEY",
            "status": "PAYEE",
            "paid_at": _ago(days=3),
        },
        {
            "id": uuid.uuid4(),
            "producer_id": prod["id"],
            "collector_id": coll["id"],
            "lot_id": lots_data[0]["id"],
            "collection_id": None,
            "gross_amount": 4500,
            "commission_amount": 450,
            "net_amount": 4050,
            "payment_method": "MOBILE_MONEY",
            "status": "PAYEE",
            "paid_at": _ago(days=8),
        },
        {
            "id": uuid.uuid4(),
            "producer_id": prod["id"],
            "collector_id": coll["id"],
            "lot_id": lots_data[4]["id"],
            "collection_id": None,
            "gross_amount": 8000,
            "commission_amount": 800,
            "net_amount": 7200,
            "payment_method": "MOBILE_MONEY",
            "status": "EN_ATTENTE",
            "paid_at": None,
        },
        {
            "id": uuid.uuid4(),
            "producer_id": prod["id"],
            "collector_id": coll["id"],
            "lot_id": lots_data[3]["id"],
            "collection_id": None,
            "gross_amount": 3600,
            "commission_amount": 360,
            "net_amount": 3240,
            "payment_method": "MOBILE_MONEY",
            "status": "EN_ATTENTE",
            "paid_at": None,
        },
    ]
    # COLLECTEUR transactions
    coll_txns = [
        {
            "id": uuid.uuid4(),
            "producer_id": prod["id"],
            "collector_id": coll["id"],
            "lot_id": lots_data[6]["id"],
            "collection_id": cols[1] if len(cols) > 1 else None,
            "gross_amount": 2000,
            "commission_amount": 200,
            "net_amount": 1800,
            "payment_method": "MOBILE_MONEY",
            "status": "PAYEE",
            "paid_at": _ago(days=4),
        },
        {
            "id": uuid.uuid4(),
            "producer_id": prod["id"],
            "collector_id": coll["id"],
            "lot_id": lots_data[5]["id"],
            "collection_id": cols[0] if len(cols) > 0 else None,
            "gross_amount": 1500,
            "commission_amount": 150,
            "net_amount": 1350,
            "payment_method": "MOBILE_MONEY",
            "status": "PAYEE",
            "paid_at": _ago(days=3),
        },
        {
            "id": uuid.uuid4(),
            "producer_id": prod["id"],
            "collector_id": coll["id"],
            "lot_id": None,
            "collection_id": None,
            "gross_amount": 1200,
            "commission_amount": 120,
            "net_amount": 1080,
            "payment_method": "MOBILE_MONEY",
            "status": "EN_ATTENTE",
            "paid_at": None,
        },
        {
            "id": uuid.uuid4(),
            "producer_id": prod["id"],
            "collector_id": coll["id"],
            "lot_id": None,
            "collection_id": None,
            "gross_amount": 500,
            "commission_amount": 0,
            "net_amount": 500,
            "payment_method": "MOBILE_MONEY",
            "status": "PAYEE",
            "paid_at": _ago(days=2),
        },
        {
            "id": uuid.uuid4(),
            "producer_id": prod["id"],
            "collector_id": coll["id"],
            "lot_id": lots_data[4]["id"],
            "collection_id": None,
            "gross_amount": 1000,
            "commission_amount": 100,
            "net_amount": 900,
            "payment_method": "MOBILE_MONEY",
            "status": "EN_ATTENTE",
            "paid_at": None,
        },
    ]
    # INDUSTRIEL transactions
    ind_txns = [
        {
            "id": uuid.uuid4(),
            "producer_id": prod["id"],
            "collector_id": None,
            "lot_id": lots_data[0]["id"],
            "company_id": ind["id"],
            "collection_id": None,
            "gross_amount": 4500,
            "commission_amount": 450,
            "net_amount": 4050,
            "payment_method": "VIREMENT",
            "status": "PAYEE",
            "paid_at": _ago(days=8),
        },
        {
            "id": uuid.uuid4(),
            "producer_id": prod["id"],
            "collector_id": None,
            "lot_id": lots_data[2]["id"],
            "company_id": ind["id"],
            "collection_id": None,
            "gross_amount": 3750,
            "commission_amount": 375,
            "net_amount": 3375,
            "payment_method": "VIREMENT",
            "status": "EN_ATTENTE",
            "paid_at": None,
        },
        {
            "id": uuid.uuid4(),
            "producer_id": prod["id"],
            "collector_id": None,
            "lot_id": lots_data[3]["id"],
            "company_id": ind["id"],
            "collection_id": None,
            "gross_amount": 3600,
            "commission_amount": 360,
            "net_amount": 3240,
            "payment_method": "VIREMENT",
            "status": "EN_ATTENTE",
            "paid_at": None,
        },
    ]

    all_txns = prod_txns + coll_txns + ind_txns
    for txn in all_txns:
        await session.execute(
            text("""
                INSERT INTO transactions
                    (id, collection_id, producer_id, collector_id, company_id,
                     gross_amount, commission_amount, net_amount,
                     payment_method, status, lot_id,
                     created_at, updated_at, paid_at)
                VALUES
                    (:id, :collection_id, :producer_id, :collector_id, :company_id,
                     :gross_amount, :commission_amount, :net_amount,
                     :payment_method, :status, :lot_id,
                     :created_at, :updated_at, :paid_at)
            """),
            {
                **txn,
                "company_id": txn.get("company_id"),
                "created_at": _ago(days=10),
                "updated_at": _ago(days=1),
            },
        )
    print(f"Created {len(all_txns)} transactions.")

    # ── Illegal Dump Reports (MAIRIE) ───────────────────────────────────
    dumps_data = [
        {
            "id": uuid.uuid4(),
            "reporter_id": mair["id"],
            "latitude": 5.3450,
            "longitude": -4.0300,
            "address": "Carrefour Adjamé Liberté",
            "description": "Dépôt sauvage de déchets ménagers sur le trottoir",
            "photo_url": "https://res.cloudinary.com/ecoloop/image/upload/dump_adjame.jpg",
            "estimated_volume_m3": 3.5,
            "status": "PENDING",
            "reward_awarded": 0,
        },
        {
            "id": uuid.uuid4(),
            "reporter_id": mair["id"],
            "latitude": 5.2900,
            "longitude": -4.0000,
            "address": "Zone industrielle de Koumassi",
            "description": "Déchets industriels abandonnés près du canal",
            "photo_url": "https://res.cloudinary.com/ecoloop/image/upload/dump_koumassi.jpg",
            "estimated_volume_m3": 8.0,
            "status": "VERIFIED",
            "reward_awarded": 50,
        },
        {
            "id": uuid.uuid4(),
            "reporter_id": mair["id"],
            "latitude": 5.3650,
            "longitude": -4.0640,
            "address": "Attécoubé route d'Abobo",
            "description": "Encombrants (matelas, meubles) sur la voie publique — nettoyé",
            "photo_url": "https://res.cloudinary.com/ecoloop/image/upload/dump_atec.jpg",
            "estimated_volume_m3": 5.0,
            "status": "CLEANED",
            "reward_awarded": 100,
        },
    ]

    for d in dumps_data:
        await session.execute(
            text("""
                INSERT INTO illegal_dump_reports
                    (id, reporter_id, latitude, longitude, address,
                     description, photo_url, estimated_volume_m3,
                     status, reward_awarded, created_at, updated_at)
                VALUES
                    (:id, :reporter_id, :latitude, :longitude, :address,
                     :description, :photo_url, :estimated_volume_m3,
                     :status, :reward_awarded, :created_at, :updated_at)
            """),
            {
                **d,
                "created_at": _ago(days=25),
                "updated_at": _ago(days=2),
            },
        )
    print(f"Created {len(dumps_data)} illegal dump reports.")

    # ── Notifications ───────────────────────────────────────────────────
    notif_templates = [
        # PRODUCTEUR
        {"user_id": prod["id"], "title": "Lot créé avec succès", "content": "Votre lot de 25 kg de PLASTIQUE a été publié.", "type": "SYSTEM", "is_read": True, "priority": "NORMAL"},
        {"user_id": prod["id"], "title": "Offre reçue", "content": "Un industriel a fait une offre sur votre lot de métal.", "type": "COLLECTION_REQUEST", "is_read": True, "priority": "HIGH"},
        {"user_id": prod["id"], "title": "Collecte programmée", "content": "Votre lot de déchets organiques a été assigné à une mission.", "type": "COLLECTION_ACCEPTED", "is_read": True, "priority": "HIGH"},
        {"user_id": prod["id"], "title": "Collecte effectuée", "content": "Votre lot de 120 kg de plastique a été collecté.", "type": "COLLECTION_ACCEPTED", "is_read": False, "priority": "HIGH"},
        {"user_id": prod["id"], "title": "Paiement reçu", "content": "Vous avez reçu 6 075 FCFA pour votre lot de carton.", "type": "PAYMENT_RECEIVED", "is_read": False, "priority": "HIGH"},
        {"user_id": prod["id"], "title": "Points éco gagnés", "content": "Vous avez gagné 50 points éco pour votre collecte.", "type": "REWARD_GAINED", "is_read": False, "priority": "NORMAL"},
        {"user_id": prod["id"], "title": "Rappel de tri", "content": "Pensez à bien trier vos déchets pour optimiser leur valeur.", "type": "SYSTEM", "is_read": False, "priority": "LOW"},
        # COLLECTEUR
        {"user_id": coll["id"], "title": "Nouvelle mission", "content": "Mission de collecte assignée dans la zone Cocody.", "type": "COLLECTION_REQUEST", "is_read": True, "priority": "HIGH"},
        {"user_id": coll["id"], "title": "Mission démarrée", "content": "Vous avez démarré la mission Abobo.", "type": "COLLECTION_ACCEPTED", "is_read": True, "priority": "NORMAL"},
        {"user_id": coll["id"], "title": "Mission terminée", "content": "Mission Cocody terminée — 2 lots collectés.", "type": "COLLECTION_ACCEPTED", "is_read": True, "priority": "HIGH"},
        {"user_id": coll["id"], "title": "Paiement confirmé", "content": "1 800 FCFA crédités pour la mission Cocody.", "type": "PAYMENT_RECEIVED", "is_read": False, "priority": "HIGH"},
        {"user_id": coll["id"], "title": "Nouveau lot disponible", "content": "Un lot de 10 kg d'électronique est disponible à Treichville.", "type": "COLLECTION_REQUEST", "is_read": False, "priority": "NORMAL"},
        {"user_id": coll["id"], "title": "Évaluation reçue", "content": "Un producteur vous a noté 5 étoiles.", "type": "SYSTEM", "is_read": False, "priority": "NORMAL"},
        # INDUSTRIEL
        {"user_id": ind["id"], "title": "Offre confirmée", "content": "Votre offre sur le lot de métal a été acceptée.", "type": "COLLECTION_ACCEPTED", "is_read": True, "priority": "HIGH"},
        {"user_id": ind["id"], "title": "Nouveau lot disponible", "content": "Un lot de 10 kg d'électronique est disponible.", "type": "COLLECTION_REQUEST", "is_read": False, "priority": "NORMAL"},
        {"user_id": ind["id"], "title": "Offre refusée", "content": "Votre offre sur le lot de plastique (200 XOF/kg) a été refusée.", "type": "SYSTEM", "is_read": False, "priority": "NORMAL"},
        # MAIRIE
        {"user_id": mair["id"], "title": "Signalement soumis", "content": "Dépôt sauvage signalé à Adjamé.", "type": "SYSTEM", "is_read": True, "priority": "HIGH"},
        {"user_id": mair["id"], "title": "Signalement vérifié", "content": "Le dépôt de Koumassi a été vérifié sur le terrain.", "type": "SYSTEM", "is_read": True, "priority": "HIGH"},
        {"user_id": mair["id"], "title": "Site nettoyé", "content": "Le site d'Attécoubé a été nettoyé avec succès.", "type": "SYSTEM", "is_read": False, "priority": "HIGH"},
        # ADMIN
        {"user_id": admin["id"] if admin else prod["id"], "title": "Nouvel utilisateur inscrit", "content": "Un nouveau collecteur s'est inscrit sur la plateforme.", "type": "SYSTEM", "is_read": False, "priority": "NORMAL"},
        {"user_id": admin["id"] if admin else prod["id"], "title": "Rapport d'activité", "content": "15 collectes effectuées cette semaine.", "type": "SYSTEM", "is_read": False, "priority": "NORMAL"},
    ]

    for n in notif_templates:
        await session.execute(
            text("""
                INSERT INTO notifications
                    (id, user_id, title, content, type, is_read, priority, created_at)
                VALUES
                    (:id, :user_id, :title, :content, :type, :is_read, :priority, :created_at)
            """),
            {
                "id": uuid.uuid4(),
                "user_id": n["user_id"],
                "title": n["title"],
                "content": n["content"],
                "type": n["type"],
                "is_read": n["is_read"],
                "priority": n["priority"],
                "created_at": _ago(days=7),
            },
        )
    print(f"Created {len(notif_templates)} notifications.")

    # ── Eco Points ──────────────────────────────────────────────────────
    eco_accounts = [
        {"user_id": prod["id"], "eco_points_balance_cache": 150},
        {"user_id": coll["id"], "eco_points_balance_cache": 85},
    ]
    for ea in eco_accounts:
        await session.execute(
            text("""
                INSERT INTO eco_point_accounts
                    (id, user_id, eco_points_balance_cache, created_at, updated_at)
                VALUES
                    (:id, :user_id, :balance, :created_at, :updated_at)
            """),
            {
                "id": uuid.uuid4(),
                "user_id": ea["user_id"],
                "balance": ea["eco_points_balance_cache"],
                "created_at": _ago(days=30),
                "updated_at": _ago(days=1),
            },
        )
    print(f"Created {len(eco_accounts)} eco-point accounts.")

    # ── Reviews ─────────────────────────────────────────────────────────
    # Needs collection records (cols list) — we created 2 collections
    if len(cols) >= 2:
        reviews_data = [
            {
                "id": uuid.uuid4(),
                "collection_id": cols[0],
                "reviewer_id": prod["id"],
                "reviewed_id": coll["id"],
                "reviewer_role": "PRODUCTEUR",
                "rating": 5,
                "comment": "Collecte rapide et professionnelle. Le collecteur était à l'heure et les déchets bien manipulés.",
            },
            {
                "id": uuid.uuid4(),
                "collection_id": cols[1],
                "reviewer_id": coll["id"],
                "reviewed_id": prod["id"],
                "reviewer_role": "COLLECTEUR",
                "rating": 4,
                "comment": "Produit bien trié et facile à charger. Poids conforme à l'annonce.",
            },
        ]

        for r in reviews_data:
            await session.execute(
                text("""
                    INSERT INTO reviews
                        (id, collection_id, reviewer_id, reviewed_id,
                         reviewer_role, rating, comment, created_at)
                    VALUES
                        (:id, :collection_id, :reviewer_id, :reviewed_id,
                         :reviewer_role, :rating, :comment, :created_at)
                """),
                {
                    **r,
                    "created_at": _ago(days=9),
                },
            )
        print(f"Created {len(reviews_data)} reviews.")
    else:
        print("Skipped reviews (not enough collections).")

    # ── Company Profile (INDUSTRIEL) ────────────────────────────────────
    await session.execute(
        text("""
            INSERT INTO company_profiles
                (company_id, company_name, license_info, coverage_zone,
                 rating, completed_purchases, buyer_reliability_score,
                 created_at, updated_at)
            VALUES
                (:company_id, :company_name, :license_info, :coverage_zone,
                 :rating, :completed_purchases, :reliability,
                 :created_at, :updated_at)
            ON CONFLICT (company_id) DO NOTHING
        """),
        {
            "company_id": ind["id"],
            "company_name": "EcoRecycle CI",
            "license_info": "REC-2024-0421",
            "coverage_zone": "Abidjan et périphérie",
            "rating": 4.2,
            "completed_purchases": 15,
            "reliability": 0.95,
            "created_at": _ago(days=60),
            "updated_at": _ago(days=2),
        },
    )
    print("Created company profile for INDUSTRIEL.")

    # ── Collector Profile (COLLECTEUR) ──────────────────────────────────
    await session.execute(
        text("""
            INSERT INTO collector_profiles
                (id, collector_type, status, verification_status,
                 identity_verified, vehicle_capacity_kg, vehicle_type,
                 service_radius_km, coverage_zone,
                 average_rating, completed_collections_count, total_collections_count,
                 collector_reliability_score, completed_missions,
                 created_at, updated_at)
            VALUES
                (:id, :collector_type, :status, :verification_status,
                 :identity_verified, :vehicle_capacity_kg, :vehicle_type,
                 :service_radius_km, :coverage_zone,
                 :average_rating, :completed_collections_count, :total_collections_count,
                 :collector_reliability_score, :completed_missions,
                 :created_at, :updated_at)
            ON CONFLICT (id) DO NOTHING
        """),
        {
            "id": coll["id"],
            "collector_type": "COLLECTOR_PARTNER",
            "status": "AVAILABLE",
            "verification_status": "VERIFIED",
            "identity_verified": True,
            "vehicle_capacity_kg": 200.0,
            "vehicle_type": "Camionnette",
            "service_radius_km": 15.0,
            "coverage_zone": "Cocody, Plateau, Marcory",
            "average_rating": 4.5,
            "completed_collections_count": 28,
            "total_collections_count": 32,
            "collector_reliability_score": 0.92,
            "completed_missions": 12,
            "created_at": _ago(days=60),
            "updated_at": _ago(days=1),
        },
    )
    print("Created collector profile for COLLECTEUR.")

    await session.commit()
    print("Seed completed successfully.")


async def main():
    url = _rewrite_url(DATABASE_URL)
    engine = create_async_engine(url, echo=False)
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with async_session() as session:
        users = await get_users(session)
        if len(users) < 4:
            print("ERROR: Not all demo users found. Run create_demo_users.py first.")
            sys.exit(1)

        await delete_existing_data(session)
        await seed(session, users)

    await engine.dispose()


if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
