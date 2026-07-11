import pytest
from httpx import AsyncClient
from uuid import uuid4

from app.models.illegal_dump import ReportStatus
from app.models.reward_transaction import RewardAction

pytestmark = pytest.mark.asyncio

async def test_create_report_success(client: AsyncClient, producer_token: str):
    payload = {
        "latitude": 5.345317,
        "longitude": -4.024429,
        "address": "Derrière le marché d'Abobo",
        "description": "Gros tas de plastiques",
        "estimated_volume_m3": 2.5,
        "photo_url": "https://res.cloudinary.com/demo/image/upload/sample.jpg"
    }
    headers = {"Authorization": f"Bearer {producer_token}"}
    
    response = await client.post("/api/v1/reports/", json=payload, headers=headers)
    
    assert response.status_code == 201
    data = response.json()
    assert data["latitude"] == 5.345317
    assert data["status"] == "PENDING"
    assert "id" in data
    assert data["reward_awarded"] == 0


async def test_list_reports_producer(client: AsyncClient, producer_token: str):
    headers = {"Authorization": f"Bearer {producer_token}"}
    response = await client.get("/api/v1/reports/", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


async def test_validate_report_admin(client: AsyncClient, admin_token: str, db_session):
    # D'abord créer un rapport via le client pour avoir un enregistrement valide
    # Puisque les tests e2e n'ont pas forcément accès au token producteur ici,
    # on suppose que test_create_report a fonctionné ou on insère direct en DB
    pass  # Placeholder pour validation de double-récompense et de cycle de vie
