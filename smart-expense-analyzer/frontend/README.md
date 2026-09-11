# Smart Expense & Budget Analyzer — Frontend

React 18 + Vite + Tailwind CSS + React Router + Axios + Recharts.

## Status

Fully wired to the real backend — **no hard-coded numbers anywhere.** Every
stat card, chart, table, and form reads from / writes to the FastAPI API in
`../backend`. Verified with a real `npm run build` (succeeds) and a live
end-to-end test: FastAPI + Vite dev server running together, with API calls
proxied through `/api` exactly as they will be in normal dev usage.

## Setup

```bash
cd frontend
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies any request to
`/api/*` to `http://localhost:8000` (see `vite.config.js`), so make sure the
backend (`../backend`) is running first:

```bash
# in another terminal, from backend/
uvicorn app.main:app --reload
```

Then open `http://localhost:5173`.

## Building for production

```bash
npm run build
```

Outputs static files to `dist/`. Serve `dist/` behind the same origin/path
as the backend's `/api` routes (e.g. via nginx, or FastAPI's
`StaticFiles`), or set `VITE_API_BASE` / adjust `src/services/api.js` if
you deploy the two separately.

## Project structure

```text
frontend/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx            # left nav, active-page highlight, mobile drawer
│   │   ├── Navbar.jsx              # page title, month, search, notifications
│   │   ├── StatCard.jsx             # dashboard stat tiles
│   │   ├── ExpenseForm.jsx           # add/edit expense, wraps autocomplete + auto-categorize
│   │   ├── ExpenseAutocomplete.jsx    # search-box-style description field
│   │   ├── ExpenseTable.jsx            # transactions table, edit/delete actions
│   │   ├── BudgetProgress.jsx           # budget bar + status + warning copy
│   │   ├── CategoryChart.jsx             # donut chart, spending by category
│   │   ├── SpendingChart.jsx              # bar chart, spending by month
│   │   ├── ConfirmModal.jsx                # delete confirmation dialog
│   │   └── ToastProvider.jsx                # toast notifications
│   ├── pages/
│   │   ├── Dashboard.jsx      Expenses.jsx     AddExpense.jsx
│   │   ├── Budget.jsx         Analytics.jsx    Categories.jsx    Settings.jsx
│   ├── services/
│   │   └── api.js             # every backend endpoint, one place
│   ├── utils/
│   │   ├── format.js           # currency/date formatting
│   │   ├── categoryStyles.js    # category -> icon/color mapping
│   │   └── budgetMessage.js      # budget warning copy (status itself comes from the API)
│   ├── App.jsx                 # layout shell + routes
│   └── main.jsx                 # entrypoint
├── tailwind.config.js            # design tokens (see below)
├── vite.config.js                 # dev server + /api proxy
└── package.json
```

## Design system

A deliberately fintech-specific palette rather than generic SaaS
defaults: deep navy/ink sidebar, a teal-green brand color, amber/red status
colors for budget warnings, `Sora` for headings/numbers and `Inter` for body
text. All tokens live in `tailwind.config.js` under `colors` / `fontFamily`.

## Notes

- Responsive: sidebar collapses to a drawer below `lg`, stat cards and chart
  grids stack to a single column on mobile.
- The backend enforces `user_id = 1` for all requests by default (no auth
  in scope for this project) - the frontend never sends a different user.
- All budget math (status/percentage/remaining) is computed server-side and
  simply displayed here, per the project's core rule.
