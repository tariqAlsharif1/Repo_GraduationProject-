"""
Expense CRUD, filtering and search.

    POST   /api/expenses
    GET    /api/expenses
    GET    /api/expenses/{id}
    PUT    /api/expenses/{id}
    DELETE /api/expenses/{id}
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Connection

from app import crud
from app.database import get_db
from app.schemas import ExpenseCreate, ExpenseListResponse, ExpenseOut, ExpenseUpdate

router = APIRouter(prefix="/api/expenses", tags=["expenses"])


@router.post("", response_model=ExpenseOut, status_code=201)
def create_expense(payload: ExpenseCreate, db: Connection = Depends(get_db)) -> ExpenseOut:
    category_name = crud.get_category_name_by_id(db, payload.category_id)
    if category_name is None:
        raise HTTPException(status_code=422, detail="Invalid category.")

    expense = crud.create_expense(
        db,
        user_id=payload.user_id,
        category_id=payload.category_id,
        description=payload.description,
        amount=payload.amount,
        expense_date=payload.expense_date,
    )

    # If Auto Categorize ran before saving, log it now that we have an expense_id.
    if payload.predicted_confidence is not None:
        crud.record_analysis(
            db,
            expense_id=expense["expense_id"],
            input_text=payload.description,
            predicted_category_id=payload.category_id,
            confidence_score=payload.predicted_confidence,
        )

    return ExpenseOut(**expense)


@router.get("", response_model=ExpenseListResponse)
def list_expenses(
    user_id: int = 1,
    category: str | None = None,
    month: int | None = None,
    year: int | None = None,
    search: str | None = None,
    sort: str | None = None,
    db: Connection = Depends(get_db),
) -> ExpenseListResponse:
    rows = crud.list_expenses(
        db,
        user_id=user_id,
        category=category,
        month=month,
        year=year,
        search=search,
        sort=sort,
    )
    return ExpenseListResponse(items=[ExpenseOut(**row) for row in rows], total=len(rows))


@router.get("/{expense_id}", response_model=ExpenseOut)
def get_expense(expense_id: int, db: Connection = Depends(get_db)) -> ExpenseOut:
    expense = crud.get_expense(db, expense_id)
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return ExpenseOut(**expense)


@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense(
    expense_id: int, payload: ExpenseUpdate, db: Connection = Depends(get_db)
) -> ExpenseOut:
    existing = crud.get_expense(db, expense_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Expense not found")

    values = payload.model_dump(exclude_unset=True)
    if "category_id" in values:
        category_name = crud.get_category_name_by_id(db, values["category_id"])
        if category_name is None:
            raise HTTPException(status_code=422, detail="Invalid category.")

    updated = crud.update_expense(db, expense_id, values)
    return ExpenseOut(**updated)


@router.delete("/{expense_id}", status_code=204)
def delete_expense(expense_id: int, db: Connection = Depends(get_db)) -> None:
    deleted = crud.delete_expense(db, expense_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Expense not found")
