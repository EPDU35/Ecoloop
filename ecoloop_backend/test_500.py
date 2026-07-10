import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.config.settings import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Check if the query for paid_result works
        try:
            result = await session.execute(text("SELECT COALESCE(SUM(net_amount), 0) FROM transactions"))
            print("Transactions sum:", result.scalar_one())
        except Exception as e:
            print("Error transactions:", e)
            
        try:
            result = await session.execute(text("SELECT COUNT(*) FROM collections"))
            print("Collections count:", result.scalar_one())
        except Exception as e:
            print("Error collections:", e)

if __name__ == "__main__":
    asyncio.run(main())
