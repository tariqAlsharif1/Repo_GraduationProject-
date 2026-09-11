"""
Shared, low-level Core query helpers used by the route modules.

Every function here operates on a live sqlalchemy.Connection (injected via
app.database.get_db) and uses Core's insert()/select()/update()/delete()
against the Table objects in app.models. No ORM, no Session, no Query API.
"""

from datetime import date
from decimal import Decimal

from sqlalchemy import Connection, delete, func, insert, select, update

from app.models import (
    analysis_history,
    budgets,
    categories,
    expense_suggestions,
    expenses,
)

# ---------------------------------------------------------------------------
# Categories
# ---------------------------------------------------------------------------


def list_categories(db: Connection) -> list[dict]:
    rows = db.execute(select(categories).order_by(categories.c.category_id)).mappings()
    return [dict(row) for row in rows]


def get_category_id_by_name(db: Connection, name: str) -> int | None:
    row = db.execute(
        select(categories.c.category_id).where(categories.c.category_name == name)
    ).first()
    return row[0] if row else None


def get_category_name_by_id(db: Connection, category_id: int) -> str | None:
    row = db.execute(
        select(categories.c.category_name).where(categories.c.category_id == category_id)
    ).first()
    return row[0] if row else None


# ---------------------------------------------------------------------------
# Expenses
# ---------------------------------------------------------------------------

_EXPENSE_WITH_CATEGORY = select(
    expenses.c.expense_id,
    expenses.c.user_id,
    expenses.c.category_id,
    categories.c.category_name,
    expenses.c.description,
    expenses.c.amount,
    expenses.c.expense_date,
    expenses.c.created_at,
).select_from(expenses.join(categories, expenses.c.category_id == categories.c.category_id))


def create_expense(
    db: Connection,
    *,
    user_id: int,
    category_id: int,
    description: str,
    amount: Decimal,
    expense_date: date,
) -> dict:
    result = db.execute(
        insert(expenses).values(
            user_id=user_id,
            category_id=category_id,
            description=description,
            amount=amount,
            expense_date=expense_date,
        )
    )
    expense_id = result.inserted_primary_key[0]
    return get_expense(db, expense_id)


def get_expense(db: Connection, expense_id: int) -> dict | None:
    row = (
        db.execute(_EXPENSE_WITH_CATEGORY.where(expenses.c.expense_id == expense_id))
        .mappings()
        .first()
    )
    return dict(row) if row else None


def list_expenses(
    db: Connection,
    *,
    user_id: int = 1,
    category: str | None = None,
    month: int | None = None,
    year: int | None = None,
    search: str | None = None,
    sort: str | None = None,
) -> list[dict]:
    stmt = _EXPENSE_WITH_CATEGORY.where(expenses.c.user_id == user_id)

    if category and category != "All Categories":
        stmt = stmt.where(categories.c.category_name == category)

    if month is not None:
        stmt = stmt.where(func.extract("month", expenses.c.expense_date) == month)

    if year is not None:
        stmt = stmt.where(func.extract("year", expenses.c.expense_date) == year)

    if search:
        pattern = f"%{search.lower()}%"
        stmt = stmt.where(
            (func.lower(expenses.c.description).like(pattern))
            | (func.lower(categories.c.category_name).like(pattern))
        )

    if sort == "amount_asc":
        stmt = stmt.order_by(expenses.c.amount.asc())
    elif sort == "amount_desc":
        stmt = stmt.order_by(expenses.c.amount.desc())
    else:
        stmt = stmt.order_by(expenses.c.expense_date.desc(), expenses.c.expense_id.desc())

    rows = db.execute(stmt).mappings().all()
    return [dict(row) for row in rows]


def update_expense(db: Connection, expense_id: int, values: dict) -> dict | None:
    if not values:
        return get_expense(db, expense_id)
    db.execute(update(expenses).where(expenses.c.expense_id == expense_id).values(**values))
    return get_expense(db, expense_id)


def delete_expense(db: Connection, expense_id: int) -> bool:
    result = db.execute(delete(expenses).where(expenses.c.expense_id == expense_id))
    return result.rowcount > 0


def recent_expenses(db: Connection, *, user_id: int = 1, limit: int = 8) -> list[dict]:
    stmt = (
        _EXPENSE_WITH_CATEGORY.where(expenses.c.user_id == user_id)
        .order_by(expenses.c.expense_date.desc(), expenses.c.expense_id.desc())
        .limit(limit)
    )
    rows = db.execute(stmt).mappings().all()
    return [dict(row) for row in rows]


# ---------------------------------------------------------------------------
# Budgets
# ---------------------------------------------------------------------------


def get_budget(db: Connection, *, user_id: int, month: int, year: int) -> dict | None:
    row = (
        db.execute(
            select(budgets).where(
                budgets.c.user_id == user_id,
                budgets.c.month == month,
                budgets.c.year == year,
            )
        )
        .mappings()
        .first()
    )
    return dict(row) if row else None


def list_budgets(db: Connection, *, user_id: int = 1) -> list[dict]:
    rows = (
        db.execute(
            select(budgets)
            .where(budgets.c.user_id == user_id)
            .order_by(budgets.c.year.desc(), budgets.c.month.desc())
        )
        .mappings()
        .all()
    )
    return [dict(row) for row in rows]


def upsert_budget(
    db: Connection, *, user_id: int, month: int, year: int, monthly_limit: Decimal
) -> dict:
    """Create the budget for this month/year, or update it if it already exists."""
    existing = get_budget(db, user_id=user_id, month=month, year=year)
    if existing:
        db.execute(
            update(budgets)
            .where(budgets.c.budget_id == existing["budget_id"])
            .values(monthly_limit=monthly_limit)
        )
        return get_budget(db, user_id=user_id, month=month, year=year)

    result = db.execute(
        insert(budgets).values(user_id=user_id, monthly_limit=monthly_limit, month=month, year=year)
    )
    budget_id = result.inserted_primary_key[0]
    row = db.execute(select(budgets).where(budgets.c.budget_id == budget_id)).mappings().first()
    return dict(row)


def update_budget_by_id(db: Connection, budget_id: int, monthly_limit: Decimal) -> dict | None:
    db.execute(
        update(budgets).where(budgets.c.budget_id == budget_id).values(monthly_limit=monthly_limit)
    )
    row = db.execute(select(budgets).where(budgets.c.budget_id == budget_id)).mappings().first()
    return dict(row) if row else None


def sum_spent(db: Connection, *, user_id: int, month: int, year: int) -> Decimal:
    total = db.execute(
        select(func.coalesce(func.sum(expenses.c.amount), 0)).where(
            expenses.c.user_id == user_id,
            func.extract("month", expenses.c.expense_date) == month,
            func.extract("year", expenses.c.expense_date) == year,
        )
    ).scalar_one()
    return Decimal(str(total))


# ---------------------------------------------------------------------------
# Analytics
# ---------------------------------------------------------------------------


def category_totals(db: Connection, *, user_id: int, month: int, year: int) -> dict[str, Decimal]:
    rows = db.execute(
        select(categories.c.category_name, func.coalesce(func.sum(expenses.c.amount), 0))
        .select_from(
            categories.outerjoin(
                expenses,
                (expenses.c.category_id == categories.c.category_id)
                & (expenses.c.user_id == user_id)
                & (func.extract("month", expenses.c.expense_date) == month)
                & (func.extract("year", expenses.c.expense_date) == year),
            )
        )
        .group_by(categories.c.category_name)
    ).all()
    return {name: Decimal(str(total)) for name, total in rows if total and Decimal(str(total)) > 0}


def highest_expense(db: Connection, *, user_id: int, month: int, year: int) -> dict | None:
    row = db.execute(
        select(expenses.c.description, expenses.c.amount)
        .where(
            expenses.c.user_id == user_id,
            func.extract("month", expenses.c.expense_date) == month,
            func.extract("year", expenses.c.expense_date) == year,
        )
        .order_by(expenses.c.amount.desc())
        .limit(1)
    ).first()
    if not row:
        return None
    return {"description": row[0], "amount": row[1]}


def transaction_count(db: Connection, *, user_id: int, month: int, year: int) -> int:
    return db.execute(
        select(func.count(expenses.c.expense_id)).where(
            expenses.c.user_id == user_id,
            func.extract("month", expenses.c.expense_date) == month,
            func.extract("year", expenses.c.expense_date) == year,
        )
    ).scalar_one()


def monthly_spending_series(db: Connection, *, user_id: int, year: int) -> dict[int, Decimal]:
    rows = db.execute(
        select(
            func.extract("month", expenses.c.expense_date),
            func.coalesce(func.sum(expenses.c.amount), 0),
        )
        .where(
            expenses.c.user_id == user_id,
            func.extract("year", expenses.c.expense_date) == year,
        )
        .group_by(func.extract("month", expenses.c.expense_date))
    ).all()
    return {int(month): Decimal(str(total)) for month, total in rows}


# ---------------------------------------------------------------------------
# Suggestions
# ---------------------------------------------------------------------------


def search_suggestions(db: Connection, query: str | None, limit: int = 10) -> list[dict]:
    stmt = (
        select(expense_suggestions.c.name, categories.c.category_name)
        .select_from(
            expense_suggestions.join(
                categories,
                expense_suggestions.c.category_id == categories.c.category_id,
            )
        )
        .where(expense_suggestions.c.is_active.is_(True))
    )
    if query:
        pattern = f"%{query.lower()}%"
        stmt = stmt.where(
            (func.lower(expense_suggestions.c.name).like(pattern))
            | (func.lower(expense_suggestions.c.keywords).like(pattern))
        )
    stmt = stmt.order_by(expense_suggestions.c.name).limit(limit)
    rows = db.execute(stmt).all()
    return [{"name": name, "category": category_name} for name, category_name in rows]


def recent_and_popular_suggestions(db: Connection, *, user_id: int = 1) -> dict[str, list[dict]]:
    recent_rows = db.execute(
        select(expenses.c.description, categories.c.category_name)
        .select_from(expenses.join(categories, expenses.c.category_id == categories.c.category_id))
        .where(expenses.c.user_id == user_id)
        .order_by(expenses.c.created_at.desc())
        .limit(20)
    ).all()

    seen: set[str] = set()
    recent: list[dict] = []
    for description, category_name in recent_rows:
        if description not in seen:
            seen.add(description)
            recent.append({"name": description, "category": category_name})
        if len(recent) >= 5:
            break

    popular_rows = db.execute(
        select(expense_suggestions.c.name, categories.c.category_name)
        .select_from(
            expense_suggestions.join(
                categories,
                expense_suggestions.c.category_id == categories.c.category_id,
            )
        )
        .where(expense_suggestions.c.is_active.is_(True))
        .order_by(expense_suggestions.c.suggestion_id)
        .limit(8)
    ).all()
    popular = [{"name": name, "category": category_name} for name, category_name in popular_rows]

    return {"recent": recent, "popular": popular}


# ---------------------------------------------------------------------------
# Analysis history (ML audit trail)
# ---------------------------------------------------------------------------


def record_analysis(
    db: Connection,
    *,
    expense_id: int | None,
    input_text: str,
    predicted_category_id: int | None,
    confidence_score: float,
) -> None:
    db.execute(
        insert(analysis_history).values(
            expense_id=expense_id,
            input_text=input_text,
            predicted_category_id=predicted_category_id,
            confidence_score=confidence_score,
        )
    )
