// features/analytics/components/InsightCard.jsx
const TYPE_STYLES = {
  growth:   { icon: "📈", color: "var(--accent-emerald)", bg: "rgba(52,211,153,0.08)" },
  cargo:    { icon: "📦", color: "var(--accent-cyan)",    bg: "rgba(56,189,248,0.08)" },
  success:  { icon: "✅", color: "var(--accent-emerald)", bg: "rgba(52,211,153,0.08)" },
  warning:  { icon: "⚠️", color: "var(--accent-amber)",   bg: "rgba(251,191,36,0.08)" },
  default:  { icon: "💡", color: "var(--accent-violet)",  bg: "rgba(167,139,250,0.08)" },
};

export default function InsightCard({ insight }) {
  const style = TYPE_STYLES[insight.type] || TYPE_STYLES.default;

  return (
    <div className="card" style={{ borderLeft: `3px solid ${style.color}`, background: style.bg }}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{style.icon}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            {insight.title}
          </h4>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            {insight.detail}
          </p>
          <p className="text-xs mt-2 font-medium" style={{ color: style.color }}>
            → {insight.action}
          </p>
        </div>
      </div>
    </div>
  );
}
