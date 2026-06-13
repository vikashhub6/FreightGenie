import { useNavigate } from "react-router-dom";

const STATUS_CONFIG = {
  pending:         { label: "Pending",         color: "#fbbf24" },
  invite_sent:     { label: "Invite Sent",     color: "#38bdf8" },
  docs_uploaded:   { label: "Docs Uploaded",   color: "#a78bfa" },
  ai_analyzing:    { label: "AI Analyzing…",   color: "#a78bfa" },
  awaiting_review: { label: "Awaiting Review", color: "#fb923c" },
  compliance_done: { label: "Compliance Done", color: "#34d399" },
  email_sent:      { label: "Email Sent",      color: "#34d399" },
  completed:       { label: "Completed",       color: "#34d399" },
};

const MODE_ICON = { sea: "🚢", air: "✈️", road: "🚛", rail: "🚂" };

export default function ShipmentCard({ shipment }) {
  const navigate = useNavigate();
  const score  = shipment.complianceReport?.score;
  const risk   = shipment.complianceReport?.riskLevel;
  const cfg    = STATUS_CONFIG[shipment.status] || { label: shipment.status, color: "#fbbf24" };
  const mode   = shipment.shipmentInfo?.shippingMode || "sea";
  const scoreColor = score >= 75 ? "#34d399" : score >= 50 ? "#fbbf24" : score !== undefined ? "#fb7185" : "var(--text-muted)";
  const riskColor  = risk === "low" ? "#34d399" : risk === "medium" ? "#fbbf24" : risk === "high" ? "#fb7185" : null;

  return (
    <div onClick={() => navigate(`/shipment/${shipment._id}`)}
      className="flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 group"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(56,189,248,0.05)"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.2)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Mode icon */}
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
          style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)" }}>
          {MODE_ICON[mode] || "📦"}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{shipment.product}</span>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded"
              style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
              {shipment.shipmentId}
            </span>
          </div>
          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
            {shipment.origin} → {shipment.destination}
            {shipment.shipmentInfo?.paymentTerms && (
              <span className="mx-1.5 opacity-40">·</span>
            )}
            {shipment.shipmentInfo?.paymentTerms && (
              <span>{shipment.shipmentInfo.paymentTerms}</span>
            )}
            <span className="mx-1.5 opacity-40">·</span>
            {shipment.exporterEmail}
          </p>
          {/* Consignee row */}
          {shipment.shipmentInfo?.consigneeName && (
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
              Consignee: {shipment.shipmentInfo.consigneeName}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
        {/* Risk badge */}
        {riskColor && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
            style={{ background: `${riskColor}20`, color: riskColor, border: `1px solid ${riskColor}40` }}>
            {risk}
          </span>
        )}
        {/* Score */}
        {score !== undefined && (
          <span className="text-sm font-bold font-mono tabular-nums" style={{ color: scoreColor }}>
            {score}/100
          </span>
        )}
        {/* Status */}
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
          {cfg.label}
        </span>
        <span className="opacity-30 group-hover:opacity-60 transition-opacity" style={{ color: "var(--text-secondary)" }}>›</span>
      </div>
    </div>
  );
}
