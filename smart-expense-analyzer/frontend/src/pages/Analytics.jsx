import { Receipt, Star, Tag, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

import CategoryChart from "../components/CategoryChart";
import SpendingChart from "../components/SpendingChart";
import StatCard from "../components/StatCard";
import { getDashboardSummary, getMonthlySpending } from "../services/api";
import { getCategoryStyle } from "../utils/categoryStyles";
import { formatJD } from "../utils/format";

const now = new Date();
const YEARS = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

export default function Analytics() {
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [summaryData, monthlyData] = await Promise.all([
          getDashboardSummary(),
          getMonthlySpending({ year }),
        ]);
        if (!cancelled) {
          setSummary(summaryData);
          setMonthly(monthlyData);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [year]);

  if (loading || !summary) {
    return <div className="p-8 text-sm text-ink400">Loading analytics...</div>;
  }

  const totals = Object.entries(summary.category_totals || {}).sort((a, b) => b[1] - a[1]);
  const grandTotal = totals.reduce((sum, [, v]) => sum + Number(v), 0);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Total Spending"
          value={formatJD(summary.total_spending)}
          hint="This month"
        />
        <StatCard
          icon={Receipt}
          label="Transactions"
          value={summary.transaction_count}
          hint="This month"
          accent="ink"
        />
        <StatCard
          icon={Star}
          label="Highest Expense"
          value={summary.highest_expense ? formatJD(summary.highest_expense.amount) : "—"}
          hint={summary.highest_expense?.description || "No expenses yet"}
          accent="warn"
        />
        <StatCard
          icon={Tag}
          label="Most-Used Category"
          value={summary.most_used_category || "—"}
          hint={`${summary.usage_percentage.toFixed(0)}% of budget used`}
          accent="ok"
        />
      </div>

      <div className="bg-white rounded-xl2 border border-line shadow-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-ink900">Monthly Spending</h3>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/40"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <SpendingChart data={monthly} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl2 border border-line shadow-card p-6">
          <h3 className="font-display font-semibold text-ink900 mb-5">Spending by Category</h3>
          <CategoryChart data={summary.category_totals} />
        </div>

        <div className="bg-white rounded-xl2 border border-line shadow-card p-6">
          <h3 className="font-display font-semibold text-ink900 mb-5">Category Breakdown</h3>
          {totals.length === 0 ? (
            <p className="text-sm text-ink400">No spending recorded yet this month.</p>
          ) : (
            <div className="space-y-4">
              {totals.map(([name, value]) => {
                const style = getCategoryStyle(name);
                const Icon = style.icon;
                const pct = grandTotal > 0 ? ((Number(value) / grandTotal) * 100).toFixed(1) : "0.0";
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-7 h-7 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: style.bg, color: style.color }}
                        >
                          <Icon size={14} />
                        </span>
                        <span className="text-sm font-medium text-ink900">{name}</span>
                      </div>
                      <span className="text-sm font-display font-semibold text-ink900 tabular-nums">
                        {formatJD(value)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-canvas overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: style.color }}
                      />
                    </div>
                    <p className="text-xs text-ink400 mt-1">{pct}% of spending</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
