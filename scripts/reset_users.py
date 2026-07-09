import asyncio
import sys
from pathlib import Path

# Add the project root to the path so we can import from app
sys.path.append(str(Path(__file__).parent.parent / "ecoloop_backend"))

from app.config.database import AsyncSessionLocal
from sqlalchemy import text

async def reset_users():
    async with AsyncSessionLocal() as db:
        # Delete all data related to non-admin users
        print("Suppression des données liées aux utilisateurs...")
        await db.execute(text("DELETE FROM reviews"))
        await db.execute(text("DELETE FROM rewards"))
        await db.execute(text("DELETE FROM transactions"))
        await db.execute(text("DELETE FROM collections"))
        await db.execute(text("DELETE FROM waste_lots"))
        
        print("Suppression des utilisateurs (sauf ADMIN)...")
        # Ensure we delete non-admin users
        res = await db.execute(text("DELETE FROM users WHERE role != 'ADMIN'"))
        
        await db.commit()
        print("Base de données réinitialisée avec succès.")

if __name__ == "__main__":
    asyncio.run(reset_users())
