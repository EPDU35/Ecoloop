"""
Test de connexion PostgreSQL isole, sans FastAPI ni SQLAlchemy.
Usage : python test_db.py
"""
import asyncio
import os

from dotenv import load_dotenv

load_dotenv()

raw_url = os.environ.get("DATABASE_URL", "")
print("DATABASE_URL brute lue depuis .env :")
print(repr(raw_url))
print()

asyncpg_url = raw_url.replace("postgresql+asyncpg://", "postgresql://").split("?")[0]
print("URL utilisee pour la connexion directe asyncpg :")
print(repr(asyncpg_url))
print()


async def main():
    import asyncpg

    try:
        conn = await asyncpg.connect(asyncpg_url, timeout=10)
        print("CONNEXION REUSSIE.")
        version = await conn.fetchval("SELECT version();")
        print("Version Postgres :", version)
        tables = await conn.fetch(
            "SELECT tablename FROM pg_tables WHERE schemaname='public';"
        )
        print("Tables :", [t["tablename"] for t in tables])
        await conn.close()
    except Exception as exc:
        print("ECHEC DE CONNEXION.")
        print("Type d'exception :", type(exc).__name__)
        print("Message :", repr(exc))
        raise


asyncio.run(main())
