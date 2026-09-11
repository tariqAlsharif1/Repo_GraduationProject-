import { useEffect, useState } from "react";

import BudgetProgress from "../components/BudgetProgress";
import { useToast } from "../components/ToastProvider";
import { getDashboardSummary, saveBudget } from "../services/api";
import { budgetWarningMessage } from "../utils/budgetMessage";
import { MONTH_NAMES } from "../utils/format";

const now = new Date();
const YEARS = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

export default function Budget() {
  const notify = useToast();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [summary, setSummary] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async (m, y) => {
    setLoading(true);
    try {
      const data = await getDashboardSummary({ month: m, year: y });
      setSummary(data);
      setMonthlyLimit(data.budget > 0 ? String(data.budget) : "");
    } catch {
      notify("Failed to connect to server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(month, year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const handleSave = async (e) => {
    e.preventDefault();
    const value = Number(monthlyLimit);
    if (!value || value <= 0) {
      notify("Enter a monthly budget greater than 0.", "error");
      return;
    }
    setSaving(true);
    try {
      await saveBudget({ user_id: 1, monthly_limit: value, month, year });
      notify("Budget saved successfully.");
      load(month, year);
    } catch {
      notify("Failed to save budget.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-3xl space-y-6">
      <form
        onSubmit={handleSave}
        className="bg-white rounded-xl2 border border-line shadow-card p-6 space-y-5"
      >
        <h2 className="font-display font-semibold text-lg text-ink900">Monthly Budget</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink900 mb-1.5">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/40 bg-white"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink900 mb-1.5">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/40 bg-white"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-ink900 mb-1.5">
              Monthly Budget (JD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="500.00"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm rounded-lg px-6 py-2.5 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Budget"}
        </button>
      </form>

      {loading ? (
        <div className="text-sm text-ink400">Loading...</div>
      ) : (
        summary && (
          <BudgetProgress
            budget={summary.budget}
            spent={summary.total_spending}
            remaining={summary.remaining}
            usagePercentage={summary.usage_percentage}
            status={summary.status}
            message={budgetWarningMessage(
              summary.usage_percentage,
              summary.total_spending,
              summary.budget
            )}
          />
        )
      )}
    </div>
  );
}
