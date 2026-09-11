"""
Autocomplete suggestions for the expense description field.

    GET /api/expense-suggestions           -> { recent: [...], popular: [...] }
    GET /api/expense-suggestions?q=uber    -> [ { name, category }, ... ]
"""

from fastapi import APIRouter, Depends
from sqlalchemy import Connection

from app import crud
from app.database import get_db
from app.schemas import SuggestionOut

router = APIRouter(prefix="/api/expense-suggestions", tags=["suggestions"])


@router.get("")
def get_suggestions(
    q: str | None = None, user_id: int = 1, db: Connection = Depends(get_db)
) -> list[SuggestionOut] | dict[str, list[SuggestionOut]]:
    if q:
        results = crud.search_suggestions(db, q)
        if results:
            return [SuggestionOut(**row) for row in results]
        # No result: frontend shows "Use '<text>' as expense description".
        return []

    grouped = crud.recent_and_popular_suggestions(db, user_id=user_id)
    return {
        "recent": [SuggestionOut(**row) for row in grouped["recent"]],
        "popular": [SuggestionOut(**row) for row in grouped["popular"]],
    }
