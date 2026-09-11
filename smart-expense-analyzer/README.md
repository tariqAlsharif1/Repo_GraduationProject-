# Smart Personal Expense & Budget Analyzer

A full-stack personal finance web app: record expenses, auto-categorize
them with a trained ML model, track a monthly budget, and see spending
broken down across an interactive dashboard.

```
React (Vite) → FastAPI → TF-IDF + Logistic Regression → SQLAlchemy Core → PostgreSQL
```

## What's here

```text
smart-expense-analyzer/
├── backend/        FastAPI + SQLAlchemy Core (no ORM) + Alembic + ML pipeline
├── frontend/        React + Vite + Tailwind CSS + Recharts
├── dataset/           expense_dataset.csv (the labeled ML training set)
└── README.md            (this file)
```

Each half has its own detailed README (`backend/README.md`,
`frontend/README.md`) with full setup steps. Quick start:

## Quick start

**1. Backend** (needs PostgreSQL running):

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # then edit DATABASE_URL
alembic upgrade head        # creates tables + seeds categories/suggestions
# insert a demo user (single-user app, no auth):
#   INSERT INTO users (username, email) VALUES ('demo','demo@example.com');
python ml_training/generate_dataset.py   # (already generated, re-run only if you want fresh data)
python ml_training/train_model.py        # trains + saves app/ml/*.joblib
uvicorn app.main:app --reload
```

**2. Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## What's implemented

- **Database**: 6 tables (`users`, `categories`, `expenses`, `budgets`,
  `analysis_history`, `expense_suggestions`), declared purely with
  SQLAlchemy Core (`MetaData()`/`Table()`/`Column()`/`ForeignKey()` — no
  ORM anywhere), managed by two Alembic migrations.
- **Expense CRUD**: full create/read/update/delete with category, date,
  and search filtering, backed by real `insert()`/`select()`/`update()`/
  `delete()` Core statements.
- **Autocomplete**: `/api/expense-suggestions` serves recent + popular
  suggestions on focus and filters as you type, backed by a seeded
  `expense_suggestions` table (~55 merchants across all 7 categories).
- **ML classification**: TF-IDF + Logistic Regression trained on a
  466-example labeled dataset (96.8% held-out accuracy), with a keyword
  fallback and a suggestions-table fallback for low-confidence or
  out-of-vocabulary descriptions. Every classification is logged to
  `analysis_history` alongside the expense it was used for.
- **Budget logic**: status (Normal / Warning / Exceeded), usage
  percentage, and remaining amount are all computed in FastAPI — never
  hard-coded or recomputed in React.
- **Dashboard & analytics**: monthly summary, category breakdown (donut
  chart), monthly spending trend (bar chart), highest expense, most-used
  category, all pulled live from PostgreSQL.
- **Frontend**: full sidebar/navbar app shell, responsive down to mobile,
  toast notifications, loading/empty states, and a distinct fintech visual
  design (not default SaaS-template styling).

## Verification already done

- Backend: full request-cycle smoke test via FastAPI's `TestClient`
  against a scratch SQLite DB — categories, budget creation, expense
  create/list/filter/search/update/delete, classification (ML + fallback),
  dashboard summary, and autocomplete all exercised and returned correct
  data. `ruff check` / `ruff format` both pass clean.
- Frontend: `npm install` and `npm run build` both succeed; the built app
  was served and returned 200s; and the full stack (FastAPI + Vite dev
  server) was run together with real HTTP requests proxied through
  `/api`, confirming the frontend talks to the real backend end-to-end.

## Still to do before submission

- Point `DATABASE_URL` at your real PostgreSQL instance (this was
  developed and tested against SQLite in the sandbox, since no Postgres
  server was available there — the SQL/Core code is dialect-agnostic and
  the migrations were verified to apply and roll back cleanly).
- Re-run `alembic upgrade head` against that real database.
- Optionally expand `ml_training/generate_dataset.py` with more real-world
  examples before re-training, and pin exact dependency versions in
  `requirements.txt` per the assignment's submission checklist.
- Write up the README sections your assignment specifically asks for that
  are program-specific (e.g. your name, course/section, submission date).
