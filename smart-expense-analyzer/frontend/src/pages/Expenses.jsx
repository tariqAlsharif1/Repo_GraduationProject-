import { PlusCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ConfirmModal from "../components/ConfirmModal";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseTable from "../components/ExpenseTable";
import {
  deleteExpense,
  getCategories,
  listExpenses,
  updateExpense,
} from "../services/api";
import { useToast } from "../components/ToastProvider";

const DATE_OPTIONS = ["All time", "This Month", "Last Month"];

export default function Expenses() {
  const notify = useToast();
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [dateFilter, setDateFilter] = useState("All time");
  const [sort, setSort] = useState("");

  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const buildParams = () => {
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (category !== "All Categories") params.category = category;
    if (sort) params.sort = sort;
    if (dateFilter === "This Month" || dateFilter === "Last Month") {
      const now = new Date();
      const month = dateFilter === "This Month" ? now.getMonth() + 1 : now.getMonth();
      const year = month === 0 ? now.getFullYear() - 1 : now.getFullYear();
      params.month = month === 0 ? 12 : month;
      params.year = year;
    }
    return params;
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await listExpenses(buildParams());
      setExpenses(data.items);
    } catch {
      notify("Failed to connect to server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, dateFilter, sort]);

  const handleUpdate = async (values) => {
    try {
      await updateExpense(editing.expense_id, values);
      notify("Expense updated successfully.");
      setEditing(null);
      load();
    } catch {
      notify("Failed to update expense.", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteExpense(deleteTarget.expense_id);
      notify("Expense deleted.");
      setDeleteTarget(null);
      load();
    } catch {
      notify("Failed to delete expense.", "error");
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expenses..."
            className="w-full rounded-lg border border-line bg-white pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
          />
        </div>

        <Link
          to="/add-expense"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
        >
          <PlusCircle size={16} />
          Add Expense
        </Link>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/40"
        >
          <option>All Categories</option>
          {categories.map((c) => (
            <option key={c.category_id}>{c.category_name}</option>
          ))}
        </select>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/40"
        >
          {DATE_OPTIONS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/40"
        >
          <option value="">Newest first</option>
          <option value="amount_desc">Highest first</option>
          <option value="amount_asc">Lowest first</option>
        </select>
      </div>

      {loading ? (
        <div className="text-sm text-ink400 py-8">Loading expenses...</div>
      ) : (
        <ExpenseTable
          expenses={expenses}
          onEdit={setEditing}
          onDelete={setDeleteTarget}
          emptyMessage="Try a different search or filter."
        />
      )}

      {editing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditing(null)} />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="font-display font-semibold text-lg text-white mb-3">Edit Expense</h3>
            <ExpenseForm
              categories={categories}
              initial={editing}
              submitLabel="Save Changes"
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Expense?"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
