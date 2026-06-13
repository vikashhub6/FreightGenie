// features/analytics/components/CostByCargoChart.jsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

export default function CostByCargoChart({ data }) {
  if (!data?.length) return null;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: 0, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="cargo" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${v}`} />
        <Tooltip
          contentStyle={{ background: "#131720", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#f0f4ff" }}
          formatter={(value) => `$${value}`}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
        <Bar dataKey="avg" name="Avg Freight Cost" fill="#38bdf8" radius={[6, 6, 0, 0]} />
        <Bar dataKey="median" name="Median Freight Cost" fill="#a78bfa" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
