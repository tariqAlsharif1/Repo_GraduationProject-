"""
GET /api/categories
"""

from fastapi import APIRouter, Depends
from sqlalchemy import Connection

from app import crud
from app.database import get_db
from app.schemas import CategoryOut

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[CategoryOut])
def list_categories(db: Connection = Depends(get_db)) -> list[CategoryOut]:
    return [CategoryOut(**row) for row in crud.list_categories(db)]
