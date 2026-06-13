// features/analytics/components/MonthlyTrendChart.jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

export default function MonthlyTrendChart({ data }) {
  if (!data?.length) return null;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ left: 0, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
        <YAxis yAxisId="left" stroke="#38bdf8" fontSize={11} />
        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#fbbf24" fontSize={11} />
        <Tooltip
          contentStyle={{ background: "#131720", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#f0f4ff" }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
        <Line yAxisId="left" type="monotone" dataKey="shipments" name="Shipments" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
        <Line yAxisId="right" type="monotone" dataKey="avgScore" name="Avg Compliance Score" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
