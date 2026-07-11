import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_reports_api_is_mounted():
    # Since we can't test DB routes without a full test DB setup,
    # we just verify the router is mounted and returns 401 (Unauthorized)
    # instead of 404 (Not Found).
    response = client.get("/api/v1/reports/")
    assert response.status_code == 401

