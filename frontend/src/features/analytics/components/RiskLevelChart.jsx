// features/analytics/components/RiskLevelChart.jsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const RISK_COLORS = { low: "#34d399", medium: "#fbbf24", high: "#fb7185" };

export default function RiskLevelChart({ data }) {
  if (!data?.length) return null;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={85}
          label={({ name, value }) => `${name}: ${value}`}
          labelLine={false}
        >
          {data.map((d, i) => (
            <Cell key={i} fill={RISK_COLORS[d.name] || "#94a3b8"} stroke="#0a0c10" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "#131720", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#f0f4ff" }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
