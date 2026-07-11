import asyncio
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

from app.models.user import User, UserRole
from app.config.security import hash_password

# DATABASE_URL = "postgresql+asyncpg://postgres:yRAolqKty0clqnjp@db.ofzqgxrzfgyaocnrlztn.supabase.co:5432/postgres"
DATABASE_URL = "postgresql+asyncpg://user:password@localhost:5432/ecoloop" # Try localhost first if local, else will change

async def main():
    db_url = "sqlite+aiosqlite:///./ecoloop_dev.db"
    print(f"Connecting to {db_url}...")
    
    engine = create_async_engine(db_url, echo=True)
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    
    users_data = [
        ("Producteur", "demo-producteur@ecoloop.ci", "Demo2026Pass!", UserRole.PRODUCTEUR),
        ("Collecteur", "demo-collecteur@ecoloop.ci", "Demo2026Pass!", UserRole.COLLECTEUR),
        ("Industriel", "demo-industriel@ecoloop.ci", "Demo2026Pass!", UserRole.INDUSTRIEL),
        ("Mairie", "demo-mairie@ecoloop.ci", "Demo2026Pass!", UserRole.MAIRIE),
    ]

    async with async_session() as session:
        # Delete existing demo users
        for _, email, _, _ in users_data:
            await session.execute(text("DELETE FROM users WHERE email = :email"), {"email": email})
        
        # Or delete ALL users if they specifically requested
        # We will delete all users!
        print("Deleting all users...")
        await session.execute(text("DELETE FROM users"))
        
        # Create new demo users
        print("Creating demo accounts...")
        for name, email, pwd, role in users_data:
            hashed_pwd = hash_password(pwd)
            user = User(
                id=uuid.uuid4(),
                full_name=f"Demo {name}",
                email=email,
                hashed_password=hashed_pwd,
                role=role,
                is_active=True,
                is_verified=True
            )
            session.add(user)
        
        await session.commit()
        print("Done!")

if __name__ == "__main__":
    asyncio.run(main())
