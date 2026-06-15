// features/analytics/components/StatCard.jsx
export default function StatCard({ label, value, accent = "var(--accent-cyan)", suffix = "" }) {
  return (
    <div className="card flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      <span className="text-2xl font-black" style={{ fontFamily: "Syne,sans-serif", color: accent }}>
        {value}
        {suffix}
      </span>
    </div>
  );
}
