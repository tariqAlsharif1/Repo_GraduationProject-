export default function StatCard({ icon: Icon, label, value, hint, accent = "brand" }) {
  const accentClasses = {
    brand: "bg-brand-50 text-brand-600",
    warn: "bg-warn-50 text-warn-500",
    ok: "bg-ok-50 text-ok-500",
    danger: "bg-danger-50 text-danger-500",
    ink: "bg-ink-soft/10 text-ink600",
  };

  return (
    <div className="bg-white rounded-xl2 border border-line shadow-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink600">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accentClasses[accent]}`}>
          <Icon size={18} strokeWidth={2.25} />
        </div>
      </div>
      <div className="font-display text-2xl font-semibold text-ink900 tabular-nums">{value}</div>
      {hint && <span className="text-xs text-ink400">{hint}</span>}
    </div>
  );
}
