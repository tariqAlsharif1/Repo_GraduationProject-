"""
Pydantic models used for request validation and response serialization.

These are separate from app.models (the SQLAlchemy Core Table objects).
Rows read from the database (RowMapping / dict-like) are adapted into
these schemas before being returned to the client.
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator

Category = Literal[
    "Food",
    "Transportation",
    "Shopping",
    "Education",
    "Entertainment",
    "Bills",
    "Other",
]

ClassificationMethod = Literal["machine_learning", "fallback", "suggestion_match"]


# ---------------------------------------------------------------------------
# Users (minimal - single-user demo auth is out of scope for this project)
# ---------------------------------------------------------------------------
class UserOut(BaseModel):
    user_id: int
    username: str
    email: EmailStr


# ---------------------------------------------------------------------------
# Categories
# ---------------------------------------------------------------------------
class CategoryOut(BaseModel):
    category_id: int
    category_name: str


# ---------------------------------------------------------------------------
# Expenses
# ---------------------------------------------------------------------------
class ExpenseBase(BaseModel):
    description: str = Field(..., min_length=2, max_length=255)
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    expense_date: date
    category_id: int

    @field_validator("description")
    @classmethod
    def strip_description(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Description must be at least 2 characters long.")
        return v


class ExpenseCreate(ExpenseBase):
    user_id: int = 1  # single-user demo; replace with auth-derived id later
    # Optional: if the frontend ran Auto Categorize before saving, it passes
    # the classification result through so it can be logged to
    # analysis_history alongside the new expense row.
    predicted_confidence: float | None = Field(None, ge=0, le=1)
    predicted_method: ClassificationMethod | None = None


class ExpenseUpdate(BaseModel):
    description: str | None = Field(None, min_length=2, max_length=255)
    amount: Decimal | None = Field(None, gt=0, decimal_places=2)
    expense_date: date | None = None
    category_id: int | None = None


class ExpenseOut(BaseModel):
    expense_id: int
    user_id: int
    category_id: int
    category_name: str | None = None
    description: str
    amount: Decimal
    expense_date: date
    created_at: datetime


class ExpenseListResponse(BaseModel):
    items: list[ExpenseOut]
    total: int


# ---------------------------------------------------------------------------
# Budgets
# ---------------------------------------------------------------------------
class BudgetCreate(BaseModel):
    user_id: int = 1
    monthly_limit: Decimal = Field(..., gt=0, decimal_places=2)
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2000, le=2100)


class BudgetUpdate(BaseModel):
    monthly_limit: Decimal = Field(..., gt=0, decimal_places=2)


class BudgetOut(BaseModel):
    budget_id: int
    user_id: int
    monthly_limit: Decimal
    month: int
    year: int


BudgetStatus = Literal["Normal", "Warning", "Exceeded"]


class BudgetSummary(BaseModel):
    budget: Decimal
    spent: Decimal
    remaining: Decimal
    usage_percentage: float
    status: BudgetStatus


# ---------------------------------------------------------------------------
# Classification
# ---------------------------------------------------------------------------
class ClassifyRequest(BaseModel):
    description: str = Field(..., min_length=2, max_length=255)


class ClassifyResponse(BaseModel):
    category: Category
    confidence: float = Field(..., ge=0, le=1)
    method: ClassificationMethod


# ---------------------------------------------------------------------------
# Suggestions
# ---------------------------------------------------------------------------
class SuggestionOut(BaseModel):
    name: str
    category: str


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------
class HighestExpenseOut(BaseModel):
    description: str
    amount: Decimal


class DashboardSummary(BaseModel):
    budget: Decimal
    total_spending: Decimal
    remaining: Decimal
    usage_percentage: float
    status: BudgetStatus
    highest_expense: HighestExpenseOut | None
    most_used_category: str | None
    transaction_count: int
    category_totals: dict[str, Decimal]


# ---------------------------------------------------------------------------
# Generic error shape
# ---------------------------------------------------------------------------
class ErrorResponse(BaseModel):
    detail: str
