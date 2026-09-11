import { useEffect, useState } from "react";

import { getCategories, getDashboardSummary } from "../services/api";
import { getCategoryStyle } from "../utils/categoryStyles";
import { formatJD } from "../utils/format";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCategories(), getDashboardSummary()])
      .then(([cats, summary]) => {
        setCategories(cats);
        setTotals(summary.category_totals || {});
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-sm text-ink400">Loading categories...</div>;

  return (
    <div className="p-4 lg:p-8 space-y-4">
      <p className="text-sm text-ink400 max-w-xl">
        These are the fixed expense categories loaded from PostgreSQL — every expense, budget
        chart, and autocomplete suggestion in the app is classified into one of these.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => {
          const style = getCategoryStyle(c.category_name);
          const Icon = style.icon;
          const spent = totals[c.category_name] || 0;
          return (
            <div
              key={c.category_id}
              className="bg-white rounded-xl2 border border-line shadow-card p-5 flex items-center gap-4"
            >
              <span
                className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: style.bg, color: style.color }}
              >
                <Icon size={20} />
              </span>
              <div>
                <p className="font-display font-semibold text-ink900">{c.category_name}</p>
                <p className="text-xs text-ink400">{formatJD(spent)} this month</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
