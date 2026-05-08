const STATS = [
  { key: "total",     label: "Total Shipments", icon: "🚢", color: "#38bdf8", glow: "rgba(56,189,248,0.25)" },
  { key: "pending",   label: "Pending",         icon: "⏳", color: "#fbbf24", glow: "rgba(251,191,36,0.25)" },
  { key: "analyzing", label: "AI Analyzing",    icon: "🤖", color: "#a78bfa", glow: "rgba(167,139,250,0.25)" },
  { key: "done",      label: "Completed",       icon: "✅", color: "#34d399", glow: "rgba(52,211,153,0.25)" },
];

export default function StatsBar({ stats = {} }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {STATS.map((s) => (
        <div key={s.key} className="card relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-200"
          style={{ boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)` }}>
          {/* top accent line */}
          <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${s.color}50, transparent)` }} />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-black tabular-nums" style={{ color: s.color, textShadow: `0 0 20px ${s.glow}` }}>
                {stats[s.key] ?? 0}
              </p>
              <p className="text-xs mt-1 font-medium" style={{ color: "var(--text-muted)" }}>{s.label}</p>
            </div>
            <span className="text-xl opacity-50 group-hover:opacity-80 transition-opacity">{s.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
