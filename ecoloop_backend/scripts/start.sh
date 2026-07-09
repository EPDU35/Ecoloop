#!/bin/sh
set -e
echo "Running database migrations..."
alembic upgrade head
echo "Starting Gunicorn server..."
exec gunicorn main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --workers 2
