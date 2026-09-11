"""
Auto-categorization endpoint.

    POST /api/classify-expense
"""

from fastapi import APIRouter, Depends
from sqlalchemy import Connection

from app.database import get_db
from app.schemas import ClassifyRequest, ClassifyResponse
from app.services.classification_service import classify

router = APIRouter(prefix="/api", tags=["classification"])


@router.post("/classify-expense", response_model=ClassifyResponse)
def classify_expense(
    payload: ClassifyRequest, db: Connection = Depends(get_db)
) -> ClassifyResponse:
    category, confidence, method = classify(db, payload.description)
    return ClassifyResponse(category=category, confidence=round(confidence, 4), method=method)
