"""
Script pour créer un utilisateur administrateur directement en base de données.
Usage: python scripts/create_admin.py <email> <password> [nom]
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import AsyncSessionLocal
from app.config.security import hash_password
from app.models.user import User, UserRole


async def create_admin(email: str, password: str, full_name: str):
    async with AsyncSessionLocal() as db:
        existing = await db.execute(select(User).where(User.email == email))
        if existing.scalar_one_or_none():
            print(f"❌ Un utilisateur avec l'email '{email}' existe déjà.")
            return

        admin = User(
            id=uuid.uuid4(),
            full_name=full_name,
            email=email,
            phone="+2250000000000",
            hashed_password=hash_password(password),
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
            created_at=datetime.now(timezone.utc),
        )
        db.add(admin)
        await db.commit()
        print(f"✅ Admin créé : {email} / {password}")
        print(f"   Nom : {full_name}")
        print(f"   Rôle : ADMIN")


if __name__ == "__main__":
    import asyncio
    if len(sys.argv) < 3:
        print("Usage: python scripts/create_admin.py <email> <password> [nom]")
        sys.exit(1)
    email = sys.argv[1]
    password = sys.argv[2]
    name = sys.argv[3] if len(sys.argv) > 3 else "Admin EcoLoop"
    asyncio.run(create_admin(email, password, name))
