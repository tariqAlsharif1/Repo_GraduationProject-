import { Pencil, Trash2 } from "lucide-react";

import { formatJD, formatShortDate } from "../utils/format";
import { getCategoryStyle } from "../utils/categoryStyles";

export default function ExpenseTable({ expenses, onEdit, onDelete, emptyMessage }) {
  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl2 border border-line shadow-card p-12 text-center">
        <p className="text-ink900 font-medium mb-1">No matching transactions found.</p>
        <p className="text-sm text-ink400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl2 border border-line shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-semibold text-ink400 uppercase tracking-wide">
              <th className="px-5 py-3 font-semibold normal-case text-xs">Date</th>
              <th className="px-5 py-3 font-semibold normal-case text-xs">Description</th>
              <th className="px-5 py-3 font-semibold normal-case text-xs">Category</th>
              <th className="px-5 py-3 font-semibold normal-case text-xs text-right">Amount</th>
              <th className="px-5 py-3 font-semibold normal-case text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => {
              const style = getCategoryStyle(expense.category_name);
              const Icon = style.icon;
              return (
                <tr
                  key={expense.expense_id}
                  className="border-b border-line last:border-0 hover:bg-canvas/60 transition-colors"
                >
                  <td className="px-5 py-3.5 text-ink600 whitespace-nowrap">
                    {formatShortDate(expense.expense_date)}
                  </td>
                  <td className="px-5 py-3.5 text-ink900 font-medium">{expense.description}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: style.bg, color: style.color }}
                    >
                      <Icon size={12} />
                      {expense.category_name}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-display font-semibold text-ink900 tabular-nums whitespace-nowrap">
                    {formatJD(expense.amount)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(expense)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-ink400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(expense)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-ink400 hover:text-danger-500 hover:bg-danger-50 transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
