import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

async def test_url(url):
    try:
        engine = create_async_engine(url)
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        await engine.dispose()
        return "SUCCESS", None
    except Exception as e:
        return "FAIL", f"{type(e).__name__}: {str(e)}"

async def main():
    urls = [
        # localhost
        "postgresql+asyncpg://ecoloop_user:CHANGE_ME@localhost:5432/ecoloop_db",
        "postgresql+asyncpg://ecoloop_user:ecoloop_pass@localhost:5432/ecoloop_db",
        "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres",
        
        # 127.0.0.1
        "postgresql+asyncpg://ecoloop_user:ecoloop_pass@127.0.0.1:5432/ecoloop_db",
        "postgresql+asyncpg://postgres:postgres@127.0.0.1:5432/postgres",
        "postgresql+asyncpg://postgres:ecoloop_pass@127.0.0.1:5432/postgres",
        "postgresql+asyncpg://postgres:admin@127.0.0.1:5432/postgres",
        "postgresql+asyncpg://postgres:root@127.0.0.1:5432/postgres",
        "postgresql+asyncpg://postgres:123456@127.0.0.1:5432/postgres",
        "postgresql+asyncpg://postgres:password@127.0.0.1:5432/postgres",
        "postgresql+asyncpg://postgres@127.0.0.1:5432/postgres",
    ]
    
    print("Starting database diagnostics...")
    for url in urls:
        print(f"Testing URL: {url}")
        status, err = await test_url(url)
        print(f"Result: {status}")
        if err:
            print(f"Error: {err}")
        print("-" * 50)

if __name__ == "__main__":
    asyncio.run(main())
