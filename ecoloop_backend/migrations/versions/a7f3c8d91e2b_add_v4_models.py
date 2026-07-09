"""add v4 models: collector_profile, collector_location, reward_transaction, review, notification, audit_log + collection weight verification

Revision ID: a7f3c8d91e2b
Revises: d352e6418378
Create Date: 2026-07-08 16:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a7f3c8d91e2b'
down_revision: Union[str, None] = 'd352e6418378'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- collector_profiles ---
    op.create_table('collector_profiles',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('status', sa.Enum('AVAILABLE', 'BUSY', 'OFFLINE', 'SUSPENDED', name='collectorstatus'), nullable=False),
        sa.Column('status_updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('verification_status', sa.Enum('PENDING', 'VERIFIED', 'REJECTED', name='verificationstatus'), nullable=False),
        sa.Column('vehicle_capacity_kg', sa.Float(), nullable=False),
        sa.Column('vehicle_type', sa.String(length=50), nullable=True),
        sa.Column('service_radius_km', sa.Float(), nullable=False),
        sa.Column('average_rating', sa.Float(), nullable=False),
        sa.Column('completed_collections_count', sa.Integer(), nullable=False),
        sa.Column('total_collections_count', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_collector_profiles_id'), 'collector_profiles', ['id'], unique=False)

    # --- collector_locations ---
    op.create_table('collector_locations',
        sa.Column('collector_id', sa.Uuid(), nullable=False),
        sa.Column('latitude', sa.Numeric(precision=9, scale=6), nullable=False),
        sa.Column('longitude', sa.Numeric(precision=9, scale=6), nullable=False),
        sa.Column('accuracy_meters', sa.Float(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['collector_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('collector_id')
    )
    op.create_index(op.f('ix_collector_locations_collector_id'), 'collector_locations', ['collector_id'], unique=False)
    op.create_index(op.f('ix_collector_locations_updated_at'), 'collector_locations', ['updated_at'], unique=False)

    # --- reward_transactions ---
    op.create_table('reward_transactions',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('collection_id', sa.Uuid(), nullable=True),
        sa.Column('action', sa.Enum('COLLECTION_COMPLETED', 'SIGNUP_BONUS', 'REFERRAL', 'PENALTY', 'ADMIN_ADJUSTMENT', name='rewardaction'), nullable=False),
        sa.Column('points', sa.Integer(), nullable=False),
        sa.Column('balance_after', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['collection_id'], ['collections.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reward_transactions_user_id'), 'reward_transactions', ['user_id'], unique=False)
    op.create_index(op.f('ix_reward_transactions_collection_id'), 'reward_transactions', ['collection_id'], unique=False)
    # Index conditionnel unique pour empêcher le double-crédit de récompense par collecte
    op.create_index(
        'uq_reward_transaction_collection_completed',
        'reward_transactions',
        ['collection_id'],
        unique=True,
        postgresql_where=sa.text("action = 'COLLECTION_COMPLETED'"),
    )

    # --- reviews ---
    op.create_table('reviews',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('collection_id', sa.Uuid(), nullable=False),
        sa.Column('reviewer_id', sa.Uuid(), nullable=False),
        sa.Column('reviewed_id', sa.Uuid(), nullable=False),
        sa.Column('reviewer_role', sa.Enum('PRODUCTEUR', 'COLLECTEUR', 'INDUSTRIEL', 'MAIRIE', 'ADMIN', name='userrole', create_type=False), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['collection_id'], ['collections.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['reviewed_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['reviewer_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('collection_id', 'reviewer_id', name='uq_collection_reviewer')
    )
    op.create_index(op.f('ix_reviews_collection_id'), 'reviews', ['collection_id'], unique=False)
    op.create_index(op.f('ix_reviews_reviewed_id'), 'reviews', ['reviewed_id'], unique=False)
    op.create_index(op.f('ix_reviews_reviewer_id'), 'reviews', ['reviewer_id'], unique=False)

    # --- notifications ---
    op.create_table('notifications',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('title', sa.String(length=100), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('type', sa.Enum('COLLECTION_REQUEST', 'COLLECTION_ACCEPTED', 'PAYMENT_RECEIVED', 'REWARD_GAINED', 'SYSTEM', name='notificationtype'), nullable=False),
        sa.Column('entity_type', sa.String(length=50), nullable=True),
        sa.Column('entity_id', sa.Uuid(), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=False),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notifications_user_id'), 'notifications', ['user_id'], unique=False)

    # --- audit_logs ---
    op.create_table('audit_logs',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=True),
        sa.Column('action', sa.String(length=150), nullable=False),
        sa.Column('entity_type', sa.String(length=50), nullable=False),
        sa.Column('entity_id', sa.Uuid(), nullable=False),
        sa.Column('old_value', sa.Text(), nullable=True),
        sa.Column('new_value', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_logs_user_id'), 'audit_logs', ['user_id'], unique=False)
    op.create_index(op.f('ix_audit_logs_entity_id'), 'audit_logs', ['entity_id'], unique=False)

    # --- Modifications à la table collections existante ---
    op.add_column('collections', sa.Column('estimated_weight_kg', sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column('collections', sa.Column('weight_verified_by', sa.Enum('PRODUCTEUR', 'COLLECTEUR', 'INDUSTRIEL', 'MAIRIE', 'ADMIN', name='userrole', create_type=False), nullable=True))
    op.add_column('collections', sa.Column('weight_verified_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    # --- Retirer les colonnes ajoutées à collections ---
    op.drop_column('collections', 'weight_verified_at')
    op.drop_column('collections', 'weight_verified_by')
    op.drop_column('collections', 'estimated_weight_kg')

    # --- audit_logs ---
    op.drop_index(op.f('ix_audit_logs_entity_id'), table_name='audit_logs')
    op.drop_index(op.f('ix_audit_logs_user_id'), table_name='audit_logs')
    op.drop_table('audit_logs')

    # --- notifications ---
    op.drop_index(op.f('ix_notifications_user_id'), table_name='notifications')
    op.drop_table('notifications')

    # --- reviews ---
    op.drop_index(op.f('ix_reviews_reviewer_id'), table_name='reviews')
    op.drop_index(op.f('ix_reviews_reviewed_id'), table_name='reviews')
    op.drop_index(op.f('ix_reviews_collection_id'), table_name='reviews')
    op.drop_table('reviews')

    # --- reward_transactions ---
    op.drop_index('uq_reward_transaction_collection_completed', table_name='reward_transactions')
    op.drop_index(op.f('ix_reward_transactions_collection_id'), table_name='reward_transactions')
    op.drop_index(op.f('ix_reward_transactions_user_id'), table_name='reward_transactions')
    op.drop_table('reward_transactions')

    # --- collector_locations ---
    op.drop_index(op.f('ix_collector_locations_updated_at'), table_name='collector_locations')
    op.drop_index(op.f('ix_collector_locations_collector_id'), table_name='collector_locations')
    op.drop_table('collector_locations')

    # --- collector_profiles ---
    op.drop_index(op.f('ix_collector_profiles_id'), table_name='collector_profiles')
    op.drop_table('collector_profiles')

    # --- Enum types ---
    sa.Enum(name='notificationtype').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='rewardaction').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='verificationstatus').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='collectorstatus').drop(op.get_bind(), checkfirst=True)
