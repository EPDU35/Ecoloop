import asyncio
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

from app.config.database import Base
from app.models.user import User, UserRole
from app.config.security import hash_password

import app.models

async def init_db():
    db_url = "sqlite+aiosqlite:///./ecoloop_dev.db"
    print(f"Initializing database at {db_url}...")
    
    engine = create_async_engine(db_url, echo=False)
    
    async with engine.begin() as conn:
        # Create all tables (Alembic can be skipped for local sqlite test)
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        
    print("Tables created.")
    
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    
    users_data = [
        ("Producteur", "demo-producteur@ecoloop.ci", "Demo2026Pass!", UserRole.PRODUCTEUR),
        ("Collecteur", "demo-collecteur@ecoloop.ci", "Demo2026Pass!", UserRole.COLLECTEUR),
        ("Industriel", "demo-industriel@ecoloop.ci", "Demo2026Pass!", UserRole.INDUSTRIEL),
        ("Mairie", "demo-mairie@ecoloop.ci", "Demo2026Pass!", UserRole.MAIRIE),
    ]

    async with async_session() as session:
        for name, email, pwd, role in users_data:
            hashed_pwd = hash_password(pwd)
            u = User(
                id=uuid.uuid4(),
                full_name=f"Demo {name}",
                email=email,
                phone=f"0000000{users_data.index((name, email, pwd, role))}",
                hashed_password=hashed_pwd,
                role=role,
                is_active=True,
                is_verified=True
            )
            session.add(u)
        
        await session.commit()
        print("Demo users created successfully!")

if __name__ == "__main__":
    asyncio.run(init_db())
