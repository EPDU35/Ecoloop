import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.config.database import AsyncSessionLocal

async def reset_data():
    async with AsyncSessionLocal() as session:
        print("🗑️ Reset des données de Démo...")
        try:
            # Suppression ciblée ou massive selon les besoins.
            # Pour éviter de casser la db, on efface uniquement les users de démo
            emails_to_delete = [
                "mairie@abobo.ci", 
                "producteur@restaurant.ci", 
                "collecteur@express.ci", 
                "industriel@plastique.ci"
            ]
            
            for email in emails_to_delete:
                await session.execute(text(f"DELETE FROM users WHERE email = '{email}'"))
                
            await session.commit()
            print("✅ Reset terminé avec succès.")
        except Exception as e:
            await session.rollback()
            print(f"❌ Erreur lors du reset : {e}")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(reset_data())
