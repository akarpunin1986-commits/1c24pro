"""make trial fields nullable

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-02-15 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('users', 'trial_started_at', existing_type=sa.DateTime(timezone=True), nullable=True)
    op.alter_column('users', 'trial_ends_at', existing_type=sa.DateTime(timezone=True), nullable=True)


def downgrade() -> None:
    op.alter_column('users', 'trial_ends_at', existing_type=sa.DateTime(timezone=True), nullable=False)
    op.alter_column('users', 'trial_started_at', existing_type=sa.DateTime(timezone=True), nullable=False)
