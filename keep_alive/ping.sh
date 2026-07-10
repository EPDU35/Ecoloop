#!/bin/bash
set -e

BACKEND_URL="${BACKEND_URL:-https://ecoloop-backend-s1vd.onrender.com}"
AI_URL="${AI_URL:-https://ecoloop-ai-s1vd.onrender.com}"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Keep-alive ping started"

# Ping backend
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$BACKEND_URL/health" || echo "000")
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Backend /health -> HTTP $HTTP_CODE"

# Ping AI service
HTTP_CODE_AI=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$AI_URL/api/health" || echo "000")
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] AI /api/health -> HTTP $HTTP_CODE_AI"

if [ "$HTTP_CODE" = "000" ] && [ "$HTTP_CODE_AI" = "000" ]; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] WARNING: Both services unreachable"
  exit 1
fi

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Keep-alive ping completed"
