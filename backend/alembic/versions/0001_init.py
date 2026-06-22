"""init

Revision ID: 0001
Revises:
Create Date: 2026-06-22
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.execute("CREATE SCHEMA IF NOT EXISTS loan_schema")
    op.create_table(
        "users",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        schema="loan_schema",
    )
    op.create_table(
        "loans",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.BigInteger, sa.ForeignKey("loan_schema.users.id"), nullable=False),
        sa.Column("amount", sa.Numeric(15, 2), nullable=False),
        sa.Column("rate", sa.Numeric(6, 4), nullable=False),
        sa.Column("term_months", sa.Integer, nullable=False),
        sa.Column("payment_type", sa.String(20), nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        schema="loan_schema",
    )


def downgrade():
    op.drop_table("loans", schema="loan_schema")
    op.drop_table("users", schema="loan_schema")
    op.execute("DROP SCHEMA IF EXISTS loan_schema")
