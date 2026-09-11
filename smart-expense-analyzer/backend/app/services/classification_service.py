"""
Expense classification: TF-IDF + Logistic Regression, with a keyword
fallback and a suggestions-table fallback for when the ML model either
isn't confident enough or hasn't been trained yet.

Resolution order for POST /api/classify-expense:
    1. ML model, if its top prediction clears ML_CONFIDENCE_THRESHOLD.
    2. Keyword fallback (simple substring match against a known keyword map).
    3. expense_suggestions table match (covers merchants the keyword map
       doesn't know about but that were seeded/added for autocomplete).
    4. "Other", as a last resort.
"""

from pathlib import Path

import joblib
from sqlalchemy import Connection

from app import crud
from app.config import settings
from app.ml.preprocessing import clean_text
from app.schemas import ClassificationMethod

# Keyword -> category. Checked as a substring match against the lowercased,
# cleaned description. Order matters only in that the first hit wins, so
# more specific keywords are listed first.
KEYWORD_FALLBACK: dict[str, str] = {
    "uber": "Transportation",
    "careem": "Transportation",
    "taxi": "Transportation",
    "petrol": "Transportation",
    "fuel": "Transportation",
    "gas station": "Transportation",
    "gas": "Transportation",
    "parking": "Transportation",
    "bus": "Transportation",
    "restaurant": "Food",
    "coffee": "Food",
    "starbucks": "Food",
    "burger": "Food",
    "pizza": "Food",
    "talabat": "Food",
    "mcdonald": "Food",
    "kfc": "Food",
    "netflix": "Entertainment",
    "spotify": "Entertainment",
    "cinema": "Entertainment",
    "shahid": "Entertainment",
    "playstation": "Entertainment",
    "steam": "Entertainment",
    "tuition": "Education",
    "university": "Education",
    "course": "Education",
    "udemy": "Education",
    "coursera": "Education",
    "school": "Education",
    "electricity": "Bills",
    "water bill": "Bills",
    "internet": "Bills",
    "zain": "Bills",
    "orange": "Bills",
    "umniah": "Bills",
    "rent": "Bills",
    "amazon": "Shopping",
    "shein": "Shopping",
    "zara": "Shopping",
    "ikea": "Shopping",
    "carrefour": "Shopping",
    "pharmacy": "Shopping",
}

FALLBACK_CONFIDENCE = 0.60
SUGGESTION_MATCH_CONFIDENCE = 0.50
NO_MATCH_CONFIDENCE = 0.30

_model = None
_vectorizer = None
_model_load_attempted = False


def _load_model() -> tuple[object | None, object | None]:
    """Lazily load the trained model + vectorizer. Safe to call if they
    don't exist yet (e.g. before ml_training/train_model.py has been run) -
    classification just falls back to keyword/suggestion matching."""
    global _model, _vectorizer, _model_load_attempted
    if _model_load_attempted:
        return _model, _vectorizer

    _model_load_attempted = True
    model_path = Path(settings.ml_model_path)
    vectorizer_path = Path(settings.ml_vectorizer_path)

    if model_path.exists() and vectorizer_path.exists():
        _model = joblib.load(model_path)
        _vectorizer = joblib.load(vectorizer_path)

    return _model, _vectorizer


def _keyword_fallback(description: str) -> str | None:
    cleaned = clean_text(description)
    for keyword, category in KEYWORD_FALLBACK.items():
        if keyword in cleaned:
            return category
    return None


def classify(db: Connection, description: str) -> tuple[str, float, ClassificationMethod]:
    """Returns (category, confidence, method)."""
    model, vectorizer = _load_model()

    if model is not None and vectorizer is not None:
        cleaned = clean_text(description)
        vector = vectorizer.transform([cleaned])
        probabilities = model.predict_proba(vector)[0]
        best_index = probabilities.argmax()
        category = model.classes_[best_index]
        confidence = float(probabilities[best_index])

        if confidence >= settings.ml_confidence_threshold:
            return category, confidence, "machine_learning"

    keyword_category = _keyword_fallback(description)
    if keyword_category:
        return keyword_category, FALLBACK_CONFIDENCE, "fallback"

    suggestions = crud.search_suggestions(db, description, limit=1)
    if suggestions:
        return (
            suggestions[0]["category"],
            SUGGESTION_MATCH_CONFIDENCE,
            "suggestion_match",
        )

    return "Other", NO_MATCH_CONFIDENCE, "fallback"
