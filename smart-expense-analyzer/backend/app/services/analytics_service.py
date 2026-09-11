"""
Aggregation logic backing the Dashboard and Analytics pages. All numbers
come from PostgreSQL via app.crud - nothing here is hard-coded.
"""

from sqlalchemy import Connection

from app import crud
from app.schemas import DashboardSummary, HighestExpenseOut
from app.services.budget_service import get_budget_summary


def get_dashboard_summary(
    db: Connection, *, user_id: int, month: int, year: int
) -> DashboardSummary:
    budget_summary = get_budget_summary(db, user_id=user_id, month=month, year=year)

    totals = crud.category_totals(db, user_id=user_id, month=month, year=year)
    most_used_category = max(totals, key=totals.get) if totals else None

    highest = crud.highest_expense(db, user_id=user_id, month=month, year=year)
    highest_out = (
        HighestExpenseOut(description=highest["description"], amount=highest["amount"])
        if highest
        else None
    )

    count = crud.transaction_count(db, user_id=user_id, month=month, year=year)

    return DashboardSummary(
        budget=budget_summary.budget,
        total_spending=budget_summary.spent,
        remaining=budget_summary.remaining,
        usage_percentage=budget_summary.usage_percentage,
        status=budget_summary.status,
        highest_expense=highest_out,
        most_used_category=most_used_category,
        transaction_count=count,
        category_totals=totals,
    )


def get_monthly_spending_chart(db: Connection, *, user_id: int, year: int) -> dict[str, float]:
    """Jan..Dec spending totals for the given year, zero-filled for months with no data."""
    month_names = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ]
    totals = crud.monthly_spending_series(db, user_id=user_id, year=year)
    return {month_names[m - 1]: float(totals.get(m, 0)) for m in range(1, 13)}
