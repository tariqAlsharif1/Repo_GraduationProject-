# Smart Expense & Budget Analyzer — Backend

FastAPI + SQLAlchemy Core (no ORM) + PostgreSQL + Alembic + scikit-learn.

## Status

This is the **schema + migrations phase**. `app/models.py` declares the full
Core schema (`MetaData()` / `Table()` / `Column()` / `ForeignKey()`), Alembic
is wired to it, and both migrations have been dry-run end-to-end against a
scratch SQLite DB (upgrade → seed data verified → downgrade), so the SQL/DDL
logic is confirmed correct. Route modules are stubbed (empty `APIRouter`s)
and will be filled in during the CRUD / Budget / Dashboard / ML phases.

## Setup

1. **Create the database** (you already have PostgreSQL running):

   ```sql
   CREATE DATABASE smart_expense_db;
   ```

2. **Create a virtual environment and install dependencies:**

   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate        # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set `DATABASE_URL` to your real PostgreSQL credentials, e.g.:

   ```text
   DATABASE_URL=postgresql+psycopg2://postgres:yourpassword@localhost:5432/smart_expense_db
   ```

4. **Run the migrations:**

   ```bash
   alembic upgrade head
   ```

   This creates all 6 tables (`users`, `categories`, `expenses`, `budgets`,
   `analysis_history`, `expense_suggestions`) and seeds:
   - The 7 required categories (Food, Transportation, Shopping, Education,
     Entertainment, Bills, Other)
   - ~55 autocomplete suggestion records across all categories

   To roll everything back: `alembic downgrade base`
   To check current revision: `alembic current`

5. **Create a demo user** (the app currently assumes `user_id = 1`; a real
   auth system is out of scope for this project):

   ```sql
   INSERT INTO users (username, email) VALUES ('demo', 'demo@example.com');
   ```

6. **Run the API:**

   ```bash
   uvicorn app.main:app --reload
   ```

   Then visit `http://localhost:8000/docs` for interactive API docs, or
   `http://localhost:8000/api/health` to confirm it's up.

## Project structure

```text
backend/
├── app/
│   ├── main.py          # FastAPI app, CORS, router wiring
│   ├── config.py         # Settings loaded from .env
│   ├── database.py       # Engine + get_db() Core connection dependency
│   ├── models.py         # SQLAlchemy Core schema (MetaData/Table/Column)
│   ├── schemas.py         # Pydantic request/response models
│   ├── crud.py            # (to be filled) shared Core query helpers
│   ├── routes/             # (stubs) expenses, budgets, dashboard,
│   │                        # classification, categories, suggestions
│   ├── services/            # (to be filled) budget/analytics/classification logic
│   └── ml/                   # trained model artifacts land here
├── ml_training/
│   └── train_model.py        # (to be added) TF-IDF + Logistic Regression training
├── alembic/
│   ├── env.py                 # wired to app.models.metadata + DATABASE_URL
│   └── versions/
│       ├── 0001_initial_schema.py           # core tables + category seed
│       └── 0002_add_expense_suggestions.py  # suggestions table + seed
├── alembic.ini
├── requirements.txt
└── .env.example
```

## Why SQLAlchemy Core (not ORM)

Per the assignment requirements, `declarative_base()`, ORM model classes, and
`Session.query()` are not used anywhere. All schema definition uses
`MetaData()` + `Table()` + `Column()` + `ForeignKey()`, and (in later phases)
all reads/writes use `insert()` / `select()` / `update()` / `delete()`
against those `Table` objects directly.

## Code quality

```bash
ruff check .
ruff format .
```

Both currently pass clean on this codebase.

## Next phases

- Expense CRUD APIs (`app/routes/expenses.py`, `app/crud.py`)
- Budget + Dashboard APIs with backend-calculated status (Normal/Warning/Exceeded)
- Autocomplete suggestions API
- ML classification pipeline (TF-IDF + Logistic Regression) + keyword fallback
- React frontend
