import { ArrowRight, PiggyBank, Receipt, TrendingDown, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import BudgetProgress from "../components/BudgetProgress";
import CategoryChart from "../components/CategoryChart";
import StatCard from "../components/StatCard";
import { getDashboardSummary, getRecentTransactions } from "../services/api";
import { getCategoryStyle } from "../utils/categoryStyles";
import { formatJD, formatRelativeDay } from "../utils/format";
import { budgetWarningMessage } from "../utils/budgetMessage";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [summaryData, recentData] = await Promise.all([
          getDashboardSummary(),
          getRecentTransactions({ limit: 6 }),
        ]);
        if (!cancelled) {
          setSummary(summaryData);
          setRecent(recentData);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("Failed to connect to server.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="p-8 text-sm text-ink400">Loading dashboard...</div>;
  }

  if (error || !summary) {
    return <div className="p-8 text-sm text-danger-500">{error || "Something went wrong."}</div>;
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Wallet}
          label="Monthly Budget"
          value={formatJD(summary.budget)}
          hint="Set for this month"
          accent="brand"
        />
        <StatCard
          icon={Receipt}
          label="Total Spent"
          value={formatJD(summary.total_spending)}
          hint={`${summary.transaction_count} transactions`}
          accent="ink"
        />
        <StatCard
          icon={PiggyBank}
          label="Remaining"
          value={formatJD(summary.remaining)}
          hint={summary.remaining >= 0 ? "Still available" : "Over budget"}
          accent={summary.remaining >= 0 ? "ok" : "danger"}
        />
        <StatCard
          icon={TrendingDown}
          label="Budget Used"
          value={`${summary.usage_percentage.toFixed(0)}%`}
          hint={summary.status}
          accent={summary.status === "Exceeded" ? "danger" : summary.status === "Warning" ? "warn" : "ok"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BudgetProgress
            budget={summary.budget}
            spent={summary.total_spending}
            remaining={summary.remaining}
            usagePercentage={summary.usage_percentage}
            status={summary.status}
            message={budgetWarningMessage(summary.usage_percentage, summary.total_spending, summary.budget)}
          />

          <div className="bg-white rounded-xl2 border border-line shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-ink900">Recent Transactions</h3>
              <Link
                to="/expenses"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                View All <ArrowRight size={12} />
              </Link>
            </div>

            {recent.length === 0 ? (
              <p className="text-sm text-ink400 py-6 text-center">
                No expenses yet. Start tracking your spending by adding your first expense.
              </p>
            ) : (
              <div className="space-y-1">
                {recent.map((e) => {
                  const style = getCategoryStyle(e.category_name);
                  const Icon = style.icon;
                  return (
                    <div
                      key={e.expense_id}
                      className="flex items-center gap-3 py-2.5 border-b border-line last:border-0"
                    >
                      <span
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: style.bg, color: style.color }}
                      >
                        <Icon size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink900 truncate">{e.description}</p>
                        <p className="text-xs text-ink400">
                          {e.category_name} · {formatRelativeDay(e.expense_date)}
                        </p>
                      </div>
                      <span className="font-display text-sm font-semibold text-ink900 tabular-nums">
                        -{formatJD(e.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-xl2 border border-line shadow-card p-6">
          <h3 className="font-display font-semibold text-ink900 mb-5">Spending by Category</h3>
          <CategoryChart data={summary.category_totals} />
        </div>
      </div>
    </div>
  );
}
