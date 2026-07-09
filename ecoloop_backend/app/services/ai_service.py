import logging
from typing import Optional, Dict, Any
from datetime import datetime

import httpx
from fastapi import UploadFile

from app.config.settings import settings

logger = logging.getLogger("ecoloop.ai_service")


class AIService:
    def __init__(self, base_url: str = settings.ai_service_url):
        self.base_url = base_url.rstrip("/")
        self.client = httpx.AsyncClient(timeout=60.0)

    async def close(self):
        await self.client.aclose()

    async def health(self) -> dict:
        resp = await self.client.get(f"{self.base_url}/api/health")
        resp.raise_for_status()
        return resp.json()

    async def classify_image(self, file: UploadFile) -> dict:
        contents = await file.read()
        files = {"file": (file.filename, contents, file.content_type)}
        resp = await self.client.post(f"{self.base_url}/api/classify/", files=files)
        resp.raise_for_status()
        return resp.json()

    async def get_categories(self) -> dict:
        resp = await self.client.get(f"{self.base_url}/api/classify/categories")
        resp.raise_for_status()
        return resp.json()

    async def predict_price(self, material: str, periods: int = 30) -> dict:
        payload = {"material": material, "periods": periods}
        resp = await self.client.post(f"{self.base_url}/api/predict/price", json=payload)
        resp.raise_for_status()
        return resp.json()

    async def predict_volume(self, zone_id: int, date: str) -> dict:
        payload = {"zone_id": zone_id, "date": date}
        resp = await self.client.post(f"{self.base_url}/api/predict/volume", json=payload)
        resp.raise_for_status()
        return resp.json()

    async def check_fraud(self, transaction_data: dict) -> dict:
        resp = await self.client.post(f"{self.base_url}/api/fraud/check", json=transaction_data)
        resp.raise_for_status()
        return resp.json()


ai_service = AIService()
