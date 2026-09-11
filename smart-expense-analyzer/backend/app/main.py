"""
FastAPI application entrypoint.

Run with:
    uvicorn app.main:app --reload
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routes import (
    budgets,
    categories,
    classification,
    dashboard,
    expenses,
    suggestions,
)

app = FastAPI(
    title="Smart Personal Expense & Budget Analyzer API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    # Keep error responses in the clean { "detail": "..." } shape the
    # frontend expects, instead of leaking a stack trace.
    return JSONResponse(status_code=500, content={"detail": "Internal server error."})


app.include_router(expenses.router)
app.include_router(budgets.router)
app.include_router(dashboard.router)
app.include_router(classification.router)
app.include_router(categories.router)
app.include_router(suggestions.router)


@app.get("/api/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
