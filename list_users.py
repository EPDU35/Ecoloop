import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.config.settings import settings

async def list_users():
    engine = create_async_engine(settings.database_url)
    async with engine.begin() as conn:
        result = await conn.execute(text('''
            SELECT id, full_name, email, phone, role, is_active, is_verified, created_at 
            FROM users ORDER BY created_at
        '''))
        for row in result:
            status = "Actif" if row.is_active else "Inactif"
            verified = "Vérifié" if row.is_verified else "Non vérifié"
            print(f'{row.id} | {row.full_name} | {row.email} | {row.phone} | {row.role} | {status} | {verified} | {row.created_at}')

asyncio.run(list_users())