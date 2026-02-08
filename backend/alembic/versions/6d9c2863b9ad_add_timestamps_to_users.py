"""add timestamps to users

Revision ID: 6d9c2863b9ad
Revises: 3e653d7df12b
Create Date: 2026-02-08 13:29:20.634673

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6d9c2863b9ad'
down_revision: Union[str, Sequence[str], None] = '3e653d7df12b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add timestamps to users."""
    with op.batch_alter_table('users', schema=None) as batch_op:
       
        batch_op.add_column(sa.Column('created_at', sa.DateTime(timezone=True), nullable=True))
        batch_op.drop_column('last_login_at')
    

def downgrade() -> None:
    """Remove timestamps from users."""
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True))
        batch_op.drop_column('created_at')

