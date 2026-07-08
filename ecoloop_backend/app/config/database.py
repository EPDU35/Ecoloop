"""
Connexion à PostgreSQL.

RÈGLE DE SÉCURITÉ : toute requête passe par l'ORM SQLAlchemy (paramétrage automatique).
Aucune concaténation de chaînes SQL n'est autorisée dans le projet — voir app/utils/helpers.py
pour le rappel de convention. Si une requête brute est un jour nécessaire, elle DOIT utiliser
text() avec des paramètres bindés, jamais un f-string.
"""
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config.settings import settings

engine = create_async_engine(
    settings.database_url,
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    pool_pre_ping=True,          # évite les connexions mortes silencieuses
    echo=settings.debug and not settings.is_production,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Classe de base déclarative pour tous les modèles ORM."""
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dépendance FastAPI fournissant une session DB par requête.
    Rollback automatique en cas d'exception pour éviter les états incohérents.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
