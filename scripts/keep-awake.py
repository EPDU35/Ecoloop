#!/usr/bin/env python3
"""
Keep-awake pour Render : ping le health endpoint toutes les 10 minutes.
Usage:
    python scripts/keep-awake.py
Ou mieux : utiliser UptimeRobot (gratuit, externe -> fiable meme si Render redemarre)
  - Creer un monitor sur https://uptimerobot.com
  - URL: https://ecoloop-backend-b6jv.onrender.com/health
  - Interval: 5 minutes
"""
import time
import urllib.request
import sys

URL = sys.argv[1] if len(sys.argv) > 1 else "https://ecoloop-backend-b6jv.onrender.com/health"

while True:
    try:
        resp = urllib.request.urlopen(URL, timeout=10)
        print(f"[{time.strftime('%H:%M:%S')}] {resp.status} - {URL}")
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] Error: {e}")
    time.sleep(600)
