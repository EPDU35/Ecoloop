# Dockerfile pour le service IA EcoLoop (ecoloop_ai)
# Image Python légère servant les modèles (FastAPI en attendant
# l'implémentation de ai_server.py).

FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# L'utilisateur non-root est créé une fois les dépendances installées.
RUN useradd --create-home --shell /bin/bash ecoloop \
    && chown -R ecoloop:ecoloop /app
USER ecoloop

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

CMD ["uvicorn", "api.ai_server:app", "--host", "0.0.0.0", "--port", "8001"]
