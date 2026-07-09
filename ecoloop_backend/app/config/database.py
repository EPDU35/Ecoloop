import json
from typing import AsyncGenerator

from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config.settings import settings

# psycopg (v3) est utilisé à la place d'asyncpg car PgBouncer (transaction/statement mode)
# ne supporte pas les requêtes préparées d'asyncpg. psycopg n'utilise pas de PREPARE
# par défaut et est totalement compatible avec PgBouncer.
database_url = settings.database_url.replace("+asyncpg", "+psycopg")
is_sqlite = database_url.startswith("sqlite")

engine = create_async_engine(
    database_url,
    **({} if is_sqlite else dict(
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
        pool_pre_ping=True,
        json_serializer=lambda o: json.dumps(o, ensure_ascii=False, default=str),
        json_deserializer=json.loads,
    )),
    echo=settings.debug and not settings.is_production,
)

if is_sqlite:
    import datetime as _dt

    def _register_now(conn, _record):
        conn.create_function("now", 0, lambda: _dt.datetime.now(_dt.timezone.utc).isoformat())

    event.listen(engine.sync_engine, "connect", _register_now)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
