import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# URL prod Supabase (depuis ton .env)
DATABASE_URL = "postgresql+asyncpg://postgres:yRAolqKty0clqnjp@db.ofzqgxrzfgyaocnrlztn.supabase.co:5432/postgres"

# Email à GARDER
KEEP_EMAIL = "elielpaul03@gmail.com"

async def clean_users():
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.begin() as conn:
        # 1. Lister avant
        print("=== AVANT nettoyage ===")
        result = await conn.execute(text("SELECT id, full_name, email, phone, role, is_active, is_verified FROM users ORDER BY created_at"))
        for row in result:
            print(f"  {row.id} | {row.full_name} | {row.email} | {row.phone} | {row.role} | {'Actif' if row.is_active else 'Inactif'} | {'Vérifié' if row.is_verified else 'Non'}")

        # 2. Compter
        count_before = await conn.execute(text("SELECT COUNT(*) FROM users"))
        print(f"\nTotal utilisateurs: {count_before.scalar()}")

        # 3. Supprimer tous SAUF l'email à garder
        result = await conn.execute(
            text("DELETE FROM users WHERE email != :email"),
            {"email": KEEP_EMAIL}
        )
        deleted = result.rowcount
        print(f"\n>>> {deleted} utilisateur(s) supprimé(s)")

        # 4. Lister après
        print("\n=== APRÈS nettoyage ===")
        result = await conn.execute(text("SELECT id, full_name, email, phone, role, is_active, is_verified FROM users"))
        for row in result:
            print(f"  {row.id} | {row.full_name} | {row.email} | {row.phone} | {row.role} | {'Actif' if row.is_active else 'Inactif'} | {'Vérifié' if row.is_verified else 'Non'}")

    await engine.dispose()

asyncio.run(clean_users())