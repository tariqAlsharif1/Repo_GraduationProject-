"""
Dashboard summary and supporting analytics endpoints.

    GET /api/dashboard/summary
    GET /api/dashboard/recent-transactions
    GET /api/dashboard/monthly-spending
"""

from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import Connection

from app import crud
from app.database import get_db
from app.schemas import DashboardSummary, ExpenseOut
from app.services.analytics_service import (
    get_dashboard_summary,
    get_monthly_spending_chart,
)

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def dashboard_summary(
    user_id: int = 1,
    month: int | None = None,
    year: int | None = None,
    db: Connection = Depends(get_db),
) -> DashboardSummary:
    today = date.today()
    return get_dashboard_summary(
        db, user_id=user_id, month=month or today.month, year=year or today.year
    )


@router.get("/recent-transactions", response_model=list[ExpenseOut])
def recent_transactions(
    user_id: int = 1, limit: int = 8, db: Connection = Depends(get_db)
) -> list[ExpenseOut]:
    rows = crud.recent_expenses(db, user_id=user_id, limit=limit)
    return [ExpenseOut(**row) for row in rows]


@router.get("/monthly-spending")
def monthly_spending(
    user_id: int = 1, year: int | None = None, db: Connection = Depends(get_db)
) -> dict[str, float]:
    today = date.today()
    return get_monthly_spending_chart(db, user_id=user_id, year=year or today.year)
