import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { getCategoryStyle } from "../utils/categoryStyles";
import { formatJD } from "../utils/format";

export default function CategoryChart({ data }) {
  const entries = Object.entries(data || {});

  if (entries.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-ink400">
        No spending recorded yet this month.
      </div>
    );
  }

  const chartData = entries.map(([name, value]) => ({ name, value: Number(value) }));
  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="w-48 h-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={getCategoryStyle(entry.name).color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatJD(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 w-full space-y-2.5">
        {chartData
          .sort((a, b) => b.value - a.value)
          .map((entry) => {
            const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0.0";
            const style = getCategoryStyle(entry.name);
            return (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: style.color }}
                  />
                  <span className="text-ink900 font-medium">{entry.name}</span>
                </div>
                <div className="flex items-center gap-3 text-ink600">
                  <span className="tabular-nums">{formatJD(entry.value)}</span>
                  <span className="text-ink400 tabular-nums w-12 text-right">{pct}%</span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
