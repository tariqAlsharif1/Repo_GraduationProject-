"""
Budget math lives entirely on the backend, per the project requirement that
the frontend must never hard-code or recompute usage/status itself.
"""

from decimal import Decimal

from sqlalchemy import Connection

from app import crud
from app.schemas import BudgetStatus, BudgetSummary


def compute_status(usage_percentage: float) -> BudgetStatus:
    if usage_percentage >= 100:
        return "Exceeded"
    if usage_percentage >= 75:
        return "Warning"
    return "Normal"


def compute_usage_percentage(spent: Decimal, budget: Decimal) -> float:
    if budget <= 0:
        return 0.0
    return round(float(spent / budget) * 100, 2)


def warning_message(usage_percentage: float, spent: Decimal, budget: Decimal) -> str | None:
    """Human-readable warning text matching the spec's example copy."""
    if usage_percentage >= 100:
        over_amount = spent - budget
        return f"You have exceeded your monthly budget by {over_amount:.2f} JD."
    if usage_percentage >= 90:
        return "You are approaching your monthly spending limit."
    if usage_percentage >= 75:
        return f"You have used {usage_percentage:.0f}% of your monthly budget."
    return None


def get_budget_summary(db: Connection, *, user_id: int, month: int, year: int) -> BudgetSummary:
    budget_row = crud.get_budget(db, user_id=user_id, month=month, year=year)
    monthly_limit = budget_row["monthly_limit"] if budget_row else Decimal(0)

    spent = crud.sum_spent(db, user_id=user_id, month=month, year=year)
    usage_percentage = compute_usage_percentage(spent, monthly_limit)
    remaining = monthly_limit - spent

    return BudgetSummary(
        budget=monthly_limit,
        spent=spent,
        remaining=remaining,
        usage_percentage=usage_percentage,
        status=compute_status(usage_percentage),
    )
