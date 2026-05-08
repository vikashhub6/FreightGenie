import { useNavigate } from "react-router-dom";

const STATUS_CONFIG = {
  pending:          { label: "Pending",          cls: "badge-pending" },
  invite_sent:      { label: "Invite Sent",      cls: "badge-invite_sent" },
  docs_uploaded:    { label: "Docs Uploaded",    cls: "badge-docs_uploaded" },
  ai_analyzing:     { label: "AI Analyzing…",    cls: "badge-ai_analyzing" },
  awaiting_review:  { label: "Awaiting Review",  cls: "badge-awaiting_review" },
  compliance_done:  { label: "Compliance Done",  cls: "badge-compliance_done" },
  email_sent:       { label: "Email Sent",       cls: "badge-email_sent" },
  completed:        { label: "Completed",        cls: "badge-completed" },
};

export default function ShipmentCard({ shipment }) {
  const navigate = useNavigate();
  const score  = shipment.complianceReport?.score;
  const cfg    = STATUS_CONFIG[shipment.status] || { label: shipment.status, cls: "badge-pending" };

  const scoreColor = score >= 75 ? "#34d399" : score >= 50 ? "#fbbf24" : "#fb7185";

  return (
    <div
      onClick={() => navigate(`/shipment/${shipment._id}`)}
      className="flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 group"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(56,189,248,0.05)";
        e.currentTarget.style.borderColor = "rgba(56,189,248,0.2)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.025)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
          style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)" }}>
          📦
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              {shipment.product}
            </span>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded"
              style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
              {shipment.shipmentId}
            </span>
          </div>
          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
            {shipment.origin} → {shipment.destination}
            <span className="mx-1.5 opacity-40">·</span>
            {shipment.exporterEmail}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
        {score !== undefined && (
          <span className="text-sm font-bold font-mono tabular-nums" style={{ color: scoreColor }}>
            {score}/100
          </span>
        )}
        <span className={cfg.cls}>{cfg.label}</span>
        <span className="opacity-30 group-hover:opacity-60 transition-opacity" style={{ color: "var(--text-secondary)" }}>›</span>
      </div>
    </div>
  );
}
