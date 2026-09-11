"""
Database schema, declared entirely with SQLAlchemy Core.

IMPORTANT: This project intentionally avoids the SQLAlchemy ORM
(no declarative_base(), no ORM model classes, no Session/Query API).
Everything here is plain MetaData() + Table() + Column(), and all
reads/writes elsewhere in the app use Core's insert() / select() /
update() / delete() constructs against these Table objects.

Alembic's env.py imports `metadata` from this module and uses it as
the single source of truth for autogeneration / migrations.
"""

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    MetaData,
    Numeric,
    String,
    Table,
    Text,
    func,
)

metadata = MetaData()

# ---------------------------------------------------------------------------
# users
# ---------------------------------------------------------------------------
users = Table(
    "users",
    metadata,
    Column("user_id", Integer, primary_key=True, autoincrement=True),
    Column("username", String(100), nullable=False),
    Column("email", String(255), nullable=False, unique=True),
)

# ---------------------------------------------------------------------------
# categories
# ---------------------------------------------------------------------------
categories = Table(
    "categories",
    metadata,
    Column("category_id", Integer, primary_key=True, autoincrement=True),
    Column("category_name", String(50), nullable=False, unique=True),
)

# ---------------------------------------------------------------------------
# expenses
# ---------------------------------------------------------------------------
expenses = Table(
    "expenses",
    metadata,
    Column("expense_id", Integer, primary_key=True, autoincrement=True),
    Column(
        "user_id",
        Integer,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
    ),
    Column(
        "category_id",
        Integer,
        ForeignKey("categories.category_id", ondelete="RESTRICT"),
        nullable=False,
    ),
    Column("description", String(255), nullable=False),
    Column("amount", Numeric(10, 2), nullable=False),
    Column("expense_date", Date, nullable=False),
    Column("created_at", DateTime, nullable=False, server_default=func.now()),
)

# ---------------------------------------------------------------------------
# budgets
# ---------------------------------------------------------------------------
budgets = Table(
    "budgets",
    metadata,
    Column("budget_id", Integer, primary_key=True, autoincrement=True),
    Column(
        "user_id",
        Integer,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
    ),
    Column("monthly_limit", Numeric(10, 2), nullable=False),
    Column("month", Integer, nullable=False),
    Column("year", Integer, nullable=False),
)

# ---------------------------------------------------------------------------
# analysis_history
# ---------------------------------------------------------------------------
analysis_history = Table(
    "analysis_history",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column(
        "expense_id",
        Integer,
        ForeignKey("expenses.expense_id", ondelete="CASCADE"),
        nullable=False,
    ),
    Column("input_text", String(255), nullable=False),
    Column(
        "predicted_category_id",
        Integer,
        ForeignKey("categories.category_id", ondelete="SET NULL"),
        nullable=True,
    ),
    Column("confidence_score", Numeric(5, 4), nullable=False),
    Column("created_at", DateTime, nullable=False, server_default=func.now()),
)

# ---------------------------------------------------------------------------
# expense_suggestions (added via the second Alembic migration)
# ---------------------------------------------------------------------------
expense_suggestions = Table(
    "expense_suggestions",
    metadata,
    Column("suggestion_id", Integer, primary_key=True, autoincrement=True),
    Column("name", String(150), nullable=False),
    Column(
        "category_id",
        Integer,
        ForeignKey("categories.category_id", ondelete="SET NULL"),
        nullable=True,
    ),
    Column("keywords", Text, nullable=True),
    Column("icon", String(50), nullable=True),
    Column("is_active", Boolean, nullable=False, server_default="true"),
    Column("created_at", DateTime, nullable=False, server_default=func.now()),
)
