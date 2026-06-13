// features/analytics/components/RouteVolumeChart.jsx
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const COLORS = ["#38bdf8", "#6366f1", "#34d399", "#fbbf24", "#fb7185", "#f472b6", "#a78bfa", "#2dd4bf"];

export default function RouteVolumeChart({ data }) {
  if (!data?.length) return null;

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 36)}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
        <XAxis type="number" stroke="#64748b" fontSize={11} />
        <YAxis type="category" dataKey="route" stroke="#94a3b8" fontSize={11} width={130} />
        <Tooltip
          contentStyle={{ background: "#131720", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#f0f4ff" }}
        />
        <Bar dataKey="shipments" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
