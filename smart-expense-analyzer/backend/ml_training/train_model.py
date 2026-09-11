"""
Trains the expense classification pipeline:

    Expense Description -> Text Preprocessing -> TF-IDF -> Logistic Regression -> Category

Run from backend/:
    python ml_training/train_model.py

Writes app/ml/expense_model.joblib and app/ml/vectorizer.joblib, and prints
accuracy / precision / recall / F1 / confusion matrix.
"""

import sys
from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)
from sklearn.model_selection import train_test_split

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from app.ml.preprocessing import clean_text  # noqa: E402

DATASET_PATH = Path(__file__).parent / "expense_dataset.csv"
MODEL_OUTPUT_PATH = BACKEND_DIR / "app" / "ml" / "expense_model.joblib"
VECTORIZER_OUTPUT_PATH = BACKEND_DIR / "app" / "ml" / "vectorizer.joblib"


def main() -> None:
    df = pd.read_csv(DATASET_PATH)
    df = df.dropna(subset=["description", "category"])
    df["clean_description"] = df["description"].apply(clean_text)

    X_train, X_test, y_train, y_test = train_test_split(
        df["clean_description"],
        df["category"],
        test_size=0.2,
        random_state=42,
        stratify=df["category"],
    )

    vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    model = LogisticRegression(max_iter=1000, C=5.0)
    model.fit(X_train_vec, y_train)

    y_pred = model.predict(X_test_vec)

    print("=" * 60)
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print("=" * 60)
    print("Classification Report (precision / recall / F1 per class):")
    print(classification_report(y_test, y_pred, zero_division=0))
    print("=" * 60)
    print("Confusion Matrix:")
    labels = sorted(df["category"].unique())
    cm = confusion_matrix(y_test, y_pred, labels=labels)
    header = " " * 16 + "  ".join(f"{label[:10]:>10}" for label in labels)
    print(header)
    for label, row in zip(labels, cm, strict=True):
        print(f"{label[:14]:<16}" + "  ".join(f"{value:>10}" for value in row))
    print("=" * 60)

    MODEL_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_OUTPUT_PATH)
    joblib.dump(vectorizer, VECTORIZER_OUTPUT_PATH)
    print(f"Saved model to {MODEL_OUTPUT_PATH}")
    print(f"Saved vectorizer to {VECTORIZER_OUTPUT_PATH}")


if __name__ == "__main__":
    main()
