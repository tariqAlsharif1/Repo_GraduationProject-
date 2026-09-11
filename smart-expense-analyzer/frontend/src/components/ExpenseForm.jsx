import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { classifyExpense } from "../services/api";
import ExpenseAutocomplete from "./ExpenseAutocomplete";

const TODAY = () => new Date().toISOString().slice(0, 10);

export default function ExpenseForm({
  categories,
  initial,
  submitLabel = "Add Expense",
  onSubmit,
  onCancel,
  loading,
}) {
  const [description, setDescription] = useState(initial?.description || "");
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [expenseDate, setExpenseDate] = useState(initial?.expense_date || TODAY());
  const [categoryId, setCategoryId] = useState(initial?.category_id || "");
  const [categoryTouched, setCategoryTouched] = useState(Boolean(initial?.category_id));
  const [classifying, setClassifying] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      setDescription(initial.description || "");
      setAmount(initial.amount ?? "");
      setExpenseDate(initial.expense_date || TODAY());
      setCategoryId(initial.category_id || "");
      setCategoryTouched(Boolean(initial.category_id));
    }
  }, [initial]);

  const categoryIdByName = (name) => categories.find((c) => c.category_name === name)?.category_id;

  const applySuggestedCategory = (categoryName) => {
    if (categoryTouched) return; // user already picked one manually — don't override
    const id = categoryIdByName(categoryName);
    if (id) setCategoryId(id);
  };

  const handleAutoCategorize = async () => {
    if (!description.trim()) {
      setErrors((e) => ({ ...e, description: "Enter a description first." }));
      return;
    }
    setClassifying(true);
    try {
      const result = await classifyExpense(description);
      setPrediction(result);
      const id = categoryIdByName(result.category);
      if (id) {
        setCategoryId(id);
        setCategoryTouched(false); // still "suggested", user can still override
      }
    } catch {
      setPrediction(null);
    } finally {
      setClassifying(false);
    }
  };

  const validate = () => {
    const next = {};
    if (!description.trim() || description.trim().length < 2) {
      next.description = "Description must be at least 2 characters.";
    }
    const amountNum = Number(amount);
    if (!amount || Number.isNaN(amountNum) || amountNum <= 0) {
      next.amount = "Enter a valid amount greater than 0.";
    }
    if (!expenseDate) next.expenseDate = "Pick a date.";
    if (!categoryId) next.category = "Choose a category.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      description: description.trim(),
      amount: Number(amount),
      expense_date: expenseDate,
      category_id: Number(categoryId),
      ...(prediction
        ? { predicted_confidence: prediction.confidence, predicted_method: prediction.method }
        : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl2 border border-line shadow-card p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-ink900 mb-1.5">Expense</label>
        <ExpenseAutocomplete
          value={description}
          onChange={(v) => {
            setDescription(v);
            setPrediction(null);
          }}
          onSelectCategory={applySuggestedCategory}
        />
        {errors.description && (
          <p className="text-xs text-danger-500 mt-1">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-ink900 mb-1.5">Amount (JD)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
          />
          {errors.amount && <p className="text-xs text-danger-500 mt-1">{errors.amount}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-ink900 mb-1.5">Date</label>
          <input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
          />
          {errors.expenseDate && (
            <p className="text-xs text-danger-500 mt-1">{errors.expenseDate}</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-ink900">Category</label>
          <button
            type="button"
            onClick={handleAutoCategorize}
            disabled={classifying}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-50"
          >
            <Sparkles size={14} />
            {classifying ? "Analyzing..." : "Auto Categorize"}
          </button>
        </div>
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setCategoryTouched(true);
          }}
          className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 bg-white"
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((c) => (
            <option key={c.category_id} value={c.category_id}>
              {c.category_name}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-xs text-danger-500 mt-1">{errors.category}</p>}

        {prediction && (
          <div className="mt-2 inline-flex items-center gap-2 text-xs font-medium bg-brand-50 text-brand-700 px-2.5 py-1.5 rounded-lg">
            <Sparkles size={12} />
            {prediction.category} — {Math.round(prediction.confidence * 100)}% confident
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 sm:flex-none bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm rounded-lg px-6 py-2.5 transition-colors disabled:opacity-60"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-ink600 hover:text-ink900 px-4 py-2.5"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
