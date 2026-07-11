"""create all missing tables dynamically

Revision ID: 517608e2e34e
Revises: e35770e24453
Create Date: 2026-07-11 16:10:16.970984

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '517608e2e34e'
down_revision: Union[str, None] = 'e35770e24453'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    from app.config.database import Base
    import app.models  # Ensures all models are loaded
    
    # Create all tables that are defined in models but missing in the DB
    Base.metadata.create_all(bind=bind)


def downgrade() -> None:
    pass
