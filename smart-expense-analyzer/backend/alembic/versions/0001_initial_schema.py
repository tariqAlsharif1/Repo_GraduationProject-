"""Initial schema: users, categories, expenses, budgets, analysis_history

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-09-11

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0001_initial_schema"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SEED_CATEGORIES = [
    "Food",
    "Transportation",
    "Shopping",
    "Education",
    "Entertainment",
    "Bills",
    "Other",
]


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("user_id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("username", sa.String(100), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
    )

    op.create_table(
        "categories",
        sa.Column("category_id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("category_name", sa.String(50), nullable=False, unique=True),
    )

    op.create_table(
        "expenses",
        sa.Column("expense_id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column(
            "user_id",
            sa.Integer,
            sa.ForeignKey("users.user_id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "category_id",
            sa.Integer,
            sa.ForeignKey("categories.category_id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("description", sa.String(255), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("expense_date", sa.Date, nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_expenses_user_id", "expenses", ["user_id"])
    op.create_index("ix_expenses_category_id", "expenses", ["category_id"])
    op.create_index("ix_expenses_expense_date", "expenses", ["expense_date"])

    op.create_table(
        "budgets",
        sa.Column("budget_id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column(
            "user_id",
            sa.Integer,
            sa.ForeignKey("users.user_id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("monthly_limit", sa.Numeric(10, 2), nullable=False),
        sa.Column("month", sa.Integer, nullable=False),
        sa.Column("year", sa.Integer, nullable=False),
        sa.UniqueConstraint("user_id", "month", "year", name="uq_budgets_user_month_year"),
    )

    op.create_table(
        "analysis_history",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column(
            "expense_id",
            sa.Integer,
            sa.ForeignKey("expenses.expense_id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("input_text", sa.String(255), nullable=False),
        sa.Column(
            "predicted_category_id",
            sa.Integer,
            sa.ForeignKey("categories.category_id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("confidence_score", sa.Numeric(5, 4), nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # Seed the fixed set of categories required by the project.
    categories_table = sa.table(
        "categories",
        sa.column("category_name", sa.String),
    )
    op.bulk_insert(
        categories_table,
        [{"category_name": name} for name in SEED_CATEGORIES],
    )


def downgrade() -> None:
    op.drop_table("analysis_history")
    op.drop_table("budgets")
    op.drop_index("ix_expenses_expense_date", table_name="expenses")
    op.drop_index("ix_expenses_category_id", table_name="expenses")
    op.drop_index("ix_expenses_user_id", table_name="expenses")
    op.drop_table("expenses")
    op.drop_table("categories")
    op.drop_table("users")
