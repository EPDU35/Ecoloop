import asyncio
import json
from logging.config import fileConfig

from alembic import context
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from app.config.database import Base
from app.config.settings import settings

# Import de tous les modèles pour qu'Alembic détecte le schéma complet lors de
# l'autogénération des migrations.
from app.models import (  # noqa: F401
    audit_log, collection, collector_location, collector_profile,
    notification, reward, reward_transaction, review, transaction, user, waste,
)

config = context.config
config.set_main_option("sqlalchemy.url", settings.database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    database_url = settings.database_url.replace("+asyncpg", "+psycopg")
    connectable: AsyncEngine = create_async_engine(
        database_url,
        poolclass=None,
        json_serializer=lambda o: json.dumps(o, ensure_ascii=False, default=str),
        json_deserializer=json.loads,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
