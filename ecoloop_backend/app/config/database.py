import json
from typing import AsyncGenerator

from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config.settings import settings

# psycopg (v3) est utilisé à la place d'asyncpg car PgBouncer (transaction/statement mode)
# ne supporte pas les requêtes préparées d'asyncpg. psycopg n'utilise pas de PREPARE
# par défaut et est totalement compatible avec PgBouncer.
#
# IMPORTANT : le DATABASE_URL fourni par Render est de la forme
# postgresql://user:pass@host:port/dbname (SANS suffixe de driver). Le
# .replace("+asyncpg", "+psycopg") était un no-op car "+asyncpg" n'apparaît
# pas dans l'URL. Sans suffixe, SQLAlchemy tombe sur le dialecte psycopg2
# (non installé) => ModuleNotFoundError. Il faut donc remplacer
# "postgresql://" par "postgresql+psycopg://" pour forcer le driver v3.
database_url = settings.database_url
database_url = database_url.replace("postgresql://", "postgresql+psycopg://")
database_url = database_url.replace("+asyncpg", "+psycopg")
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


from sqlalchemy import MetaData

naming_convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=naming_convention)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
