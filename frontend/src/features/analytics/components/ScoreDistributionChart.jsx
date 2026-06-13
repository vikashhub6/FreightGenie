// features/analytics/components/ScoreDistributionChart.jsx
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// Color-code score buckets red -> amber -> green
const BUCKET_COLORS = {
  "0-49": "#fb7185",
  "50-59": "#f97316",
  "60-69": "#fbbf24",
  "70-79": "#a3e635",
  "80-89": "#34d399",
  "90-100": "#22d3ee",
};

export default function ScoreDistributionChart({ data }) {
  if (!data?.length) return null;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ left: 0, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: "#131720", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#f0f4ff" }}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={BUCKET_COLORS[d.range] || "#38bdf8"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
