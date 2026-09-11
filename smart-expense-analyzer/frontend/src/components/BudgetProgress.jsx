import { formatJD } from "../utils/format";

const STATUS_STYLES = {
  Normal: { bar: "bg-ok-500", chip: "bg-ok-50 text-ok-500" },
  Warning: { bar: "bg-warn-500", chip: "bg-warn-50 text-warn-500" },
  Exceeded: { bar: "bg-danger-500", chip: "bg-danger-50 text-danger-500" },
};

export default function BudgetProgress({ budget, spent, remaining, usagePercentage, status, message }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Normal;
  const clampedWidth = Math.min(usagePercentage, 100);

  return (
    <div className="bg-white rounded-xl2 border border-line shadow-card p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display font-semibold text-ink900">Monthly Budget</h3>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${style.chip}`}>
          {status}
        </span>
      </div>
      <p className="text-sm text-ink600 mb-4">
        {formatJD(spent)} of {formatJD(budget)}
      </p>

      <div className="h-3 rounded-full bg-canvas overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
          style={{ width: `${clampedWidth}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-3 text-sm">
        <span className="text-ink600">{usagePercentage.toFixed(0)}% used</span>
        <span className="text-ink600">{formatJD(remaining)} remaining</span>
      </div>

      {message && (
        <div
          className={`mt-4 rounded-lg px-3 py-2.5 text-sm font-medium ${
            status === "Exceeded"
              ? "bg-danger-50 text-danger-500"
              : "bg-warn-50 text-warn-500"
          }`}
        >
          {status === "Exceeded" ? "Budget Exceeded — " : "Budget Warning — "}
          {message}
        </div>
      )}
    </div>
  );
}
