@echo off
start "EcoLoop - AI" cmd /k "cd ecoloop_ai && python -m pip install -r requirements.txt && python -m api.ai_server"
start "EcoLoop - Backend" cmd /k "cd ecoloop_backend && python -m pip install -r requirements.txt && python -m uvicorn main:app --reload"
start "EcoLoop - Web" cmd /k "cd ecoloop_web && npm install && npm run dev"
