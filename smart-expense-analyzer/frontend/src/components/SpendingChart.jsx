import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatJD } from "../utils/format";

export default function SpendingChart({ data }) {
  const chartData = Object.entries(data || {}).map(([month, total]) => ({
    month,
    total: Number(total),
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#E4E7EC" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#667085" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 12, fill: "#667085" }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => formatJD(value)}
            cursor={{ fill: "#F4F6FA" }}
            contentStyle={{ borderRadius: 10, border: "1px solid #E4E7EC", fontSize: 13 }}
          />
          <Bar dataKey="total" fill="#1F7A5C" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
