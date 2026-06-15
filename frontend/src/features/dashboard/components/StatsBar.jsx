export default function StatsBar({ stats = {} }) {
  const items = [
    { label: "Total Shipments", value: stats.total     ?? 0, icon: "🚢", color: "#38bdf8", glow: "rgba(56,189,248,0.25)" },
    { label: "Pending",         value: stats.pending   ?? 0, icon: "⏳", color: "#fbbf24", glow: "rgba(251,191,36,0.25)" },
    { label: "AI Analyzing",    value: stats.analyzing ?? 0, icon: "🤖", color: "#a78bfa", glow: "rgba(167,139,250,0.25)" },
    { label: "Completed",       value: stats.done      ?? 0, icon: "✅", color: "#34d399", glow: "rgba(52,211,153,0.25)" },
    { label: "Avg. Score",      value: stats.avgScore  ? `${stats.avgScore}` : "—", icon: "📊", color: "#f472b6", glow: "rgba(244,114,182,0.25)" },
    { label: "High Risk",       value: stats.highRisk  ?? 0, icon: "⚠️", color: "#fb7185", glow: "rgba(251,113,133,0.25)" },
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
      {items.map((s) => (
        <div key={s.label} className="card relative overflow-hidden hover:-translate-y-0.5 transition-all duration-200"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)", padding: "12px" }}>
          <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${s.color}50,transparent)` }} />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-black tabular-nums" style={{ color: s.color, textShadow: `0 0 20px ${s.glow}` }}>
                {s.value}
              </p>
              <p className="text-[10px] mt-1 font-medium" style={{ color: "var(--text-muted)" }}>{s.label}</p>
            </div>
            <span className="text-lg opacity-40">{s.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
