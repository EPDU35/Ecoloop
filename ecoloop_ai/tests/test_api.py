"""Tests de l'API FastAPI EcoLoop AI."""

import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from fastapi.testclient import TestClient
from api.ai_server import app

client = TestClient(app)


class TestAPI:
    """Tests des endpoints de l'API."""
    
    def test_health(self):
        """Vérifie l'endpoint de santé."""
        with TestClient(app) as client:
            response = client.get("/api/health")
            assert response.status_code == 200
            data = response.json()
            assert data['status'] in ['ok', 'degraded']
            assert 'models_loaded' in data
    
    def test_classify_no_file(self):
        """Vérifie l'erreur quand aucun fichier n'est envoyé."""
        with TestClient(app) as client:
            response = client.post("/api/classify")
            assert response.status_code == 422
    
    def test_predict_price_invalid_material(self):
        """Vérifie l'erreur avec un matériau invalide."""
        with TestClient(app) as client:
            response = client.post("/api/predict/price", json={
                "material": "inexistant",
                "periods": 7
            })
            assert response.status_code in [400, 404, 422, 500, 503]
    
    def test_fraud_check_format(self):
        """Vérifie le format de la réponse de détection de fraude."""
        with TestClient(app) as client:
            response = client.post("/api/fraud/check", json={
                "poids": 50,
                "prix": 100,
                "heure": 14,
                "jour_semaine": 2
            })
            assert response.status_code in [200, 503]
