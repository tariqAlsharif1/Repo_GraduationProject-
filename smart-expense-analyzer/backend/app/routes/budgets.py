"""
Monthly budget management.

    POST /api/budgets
    GET  /api/budgets/current
    GET  /api/budgets?month=&year=
    PUT  /api/budgets/{id}
"""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Connection

from app import crud
from app.database import get_db
from app.schemas import BudgetCreate, BudgetOut, BudgetSummary, BudgetUpdate
from app.services.budget_service import get_budget_summary

router = APIRouter(prefix="/api/budgets", tags=["budgets"])


@router.post("", response_model=BudgetOut, status_code=201)
def save_budget(payload: BudgetCreate, db: Connection = Depends(get_db)) -> BudgetOut:
    budget = crud.upsert_budget(
        db,
        user_id=payload.user_id,
        month=payload.month,
        year=payload.year,
        monthly_limit=payload.monthly_limit,
    )
    return BudgetOut(**budget)


@router.get("/current", response_model=BudgetSummary)
def current_budget(user_id: int = 1, db: Connection = Depends(get_db)) -> BudgetSummary:
    today = date.today()
    return get_budget_summary(db, user_id=user_id, month=today.month, year=today.year)


@router.get("", response_model=list[BudgetOut])
def list_budgets(
    user_id: int = 1,
    month: int | None = None,
    year: int | None = None,
    db: Connection = Depends(get_db),
) -> list[BudgetOut]:
    if month is not None and year is not None:
        budget = crud.get_budget(db, user_id=user_id, month=month, year=year)
        return [BudgetOut(**budget)] if budget else []

    rows = crud.list_budgets(db, user_id=user_id)
    return [BudgetOut(**row) for row in rows]


@router.put("/{budget_id}", response_model=BudgetOut)
def update_budget(
    budget_id: int, payload: BudgetUpdate, db: Connection = Depends(get_db)
) -> BudgetOut:
    updated = crud.update_budget_by_id(db, budget_id, payload.monthly_limit)
    if updated is None:
        raise HTTPException(status_code=404, detail="Budget not found")
    return BudgetOut(**updated)
