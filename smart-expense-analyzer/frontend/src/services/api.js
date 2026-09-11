import axios from "axios";

// In dev, Vite proxies /api -> http://localhost:8000 (see vite.config.js),
// so requests can stay relative and work the same after a production build
// as long as the backend is served behind the same origin/path.
const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// -----------------------------------------------------------------------
// Categories
// -----------------------------------------------------------------------
export const getCategories = () => api.get("/categories").then((r) => r.data);

// -----------------------------------------------------------------------
// Expenses
// -----------------------------------------------------------------------
export const listExpenses = (params = {}) =>
  api.get("/expenses", { params }).then((r) => r.data);

export const getExpense = (id) => api.get(`/expenses/${id}`).then((r) => r.data);

export const createExpense = (payload) =>
  api.post("/expenses", payload).then((r) => r.data);

export const updateExpense = (id, payload) =>
  api.put(`/expenses/${id}`, payload).then((r) => r.data);

export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

// -----------------------------------------------------------------------
// Budgets
// -----------------------------------------------------------------------
export const saveBudget = (payload) => api.post("/budgets", payload).then((r) => r.data);

export const getCurrentBudget = () => api.get("/budgets/current").then((r) => r.data);

export const listBudgets = (params = {}) =>
  api.get("/budgets", { params }).then((r) => r.data);

export const updateBudget = (id, payload) =>
  api.put(`/budgets/${id}`, payload).then((r) => r.data);

// -----------------------------------------------------------------------
// Dashboard / analytics
// -----------------------------------------------------------------------
export const getDashboardSummary = (params = {}) =>
  api.get("/dashboard/summary", { params }).then((r) => r.data);

export const getRecentTransactions = (params = {}) =>
  api.get("/dashboard/recent-transactions", { params }).then((r) => r.data);

export const getMonthlySpending = (params = {}) =>
  api.get("/dashboard/monthly-spending", { params }).then((r) => r.data);

// -----------------------------------------------------------------------
// Classification
// -----------------------------------------------------------------------
export const classifyExpense = (description) =>
  api.post("/classify-expense", { description }).then((r) => r.data);

// -----------------------------------------------------------------------
// Suggestions / autocomplete
// -----------------------------------------------------------------------
export const getSuggestions = (q) =>
  api.get("/expense-suggestions", { params: q ? { q } : {} }).then((r) => r.data);

export default api;
