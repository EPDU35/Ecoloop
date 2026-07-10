import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login_missing_credentials():
    response = client.post("/api/v1/auth/login", json={})
    assert response.status_code == 422 # Unprocessable Entity validation error

def test_login_invalid_credentials():
    response = client.post("/api/v1/auth/login", data={
        "username": "fake@ecoloop.com",
        "password": "wrongpassword"
    })
    # Devrait retourner 401 Unauthorized ou 404/400 selon l'implémentation
    assert response.status_code in [400, 401, 404]
