import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useShipment from "../hooks/useShipment";
import useSocket from "../hooks/useSocket";
import ProfileDocsTab from "../../dashboard/components/ProfileDocsTab";
import AIAnalysisTab from "../../dashboard/components/AIAnalysisTab";
import ChecklistTab from "../../dashboard/components/ChecklistTab";
import CostTab from "../../dashboard/components/CostTab";
import EmailDraftTab from "../../dashboard/components/EmailDraftTab";
import SendReportTab from "../../dashboard/components/SendReportTab";

const INNER_TABS = [
  { id: "profile",   label: "Profile & Docs",  icon: "📋" },
  { id: "ai",        label: "AI Analysis",      icon: "🤖" },
  { id: "checklist", label: "Checklist",        icon: "✅" },
  { id: "cost",      label: "Cost",             icon: "💰" },
  { id: "email",     label: "Email Draft",      icon: "✉️" },
  { id: "send",      label: "Send Report",      icon: "📤" },
];

const STATUS_STYLE = {
  awaiting_review: "bg-amber-500/15   text-amber-300   border-amber-500/30   shadow-[0_0_10px_rgba(251,191,36,0.2)]",
  compliance_done: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(52,211,153,0.2)]",
  docs_uploaded:   "bg-blue-500/15   text-blue-300   border-blue-500/30   shadow-[0_0_10px_rgba(59,130,246,0.2)]",
};

export default function ShipmentDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [activeInner, setActiveInner] = useState("profile");

  const { shipment, setShipment, loading, reload } = useShipment(id);
  useSocket(id, (data) => {
    if (["compliance_done","awaiting_review","email_sent","ai_done"].includes(data.status)) reload();
  });

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-8 h-8 border-2 border-slate-700 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  );
  if (!shipment) return (
    <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>Shipment not found</div>
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Navbar */}
      <nav className="border-b px-6 py-4 flex items-center gap-4"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        <button onClick={() => navigate("/dashboard")}
          className="text-lg transition-colors hover:text-white" style={{ color: "var(--text-muted)" }}>←</button>
        <span className="text-xl">🚢</span>
        <span className="text-lg font-bold" style={{ fontFamily: "Syne,sans-serif", color: "var(--text-primary)" }}>FreightGenie</span>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6 relative space-y-4">

        {/* Ambient background orbs */}
        <div className="pointer-events-none fixed top-20 left-10 w-96 h-96 rounded-full bg-cyan-600/5 blur-3xl" />
        <div className="pointer-events-none fixed bottom-20 right-10 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl" />

        {/* Exporter Info Bar */}
        <div className="relative rounded-2xl overflow-hidden
          bg-gradient-to-r from-slate-800/70 via-slate-800/60 to-slate-900/70
          border border-slate-700/50
          shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]
          backdrop-blur-xl p-4 animate-fade-up"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-500/30 to-transparent" />

          <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
            {[
              { label: "Exporter", value: shipment.exporterName || shipment.exporterEmail },
              { label: "Product",  value: shipment.product },
              { label: "Route",    value: `${shipment.origin} → ${shipment.destination}` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5 font-medium">{label}</p>
                <p className="text-white text-sm font-semibold">{value}</p>
              </div>
            ))}

            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5 font-medium">PIN</p>
              <p className="text-cyan-400 font-mono font-bold text-sm
                drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                {shipment.exporterPin}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5 font-medium">Status</p>
              <span className={`
                text-[11px] px-2.5 py-1 rounded-lg font-semibold border tracking-wide
                ${STATUS_STYLE[shipment.status] || "bg-slate-500/15 text-slate-400 border-slate-500/30"}
              `}>
                {shipment.status?.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>

        {/* Inner Tab Bar */}
        <div className="relative rounded-2xl overflow-hidden
          bg-slate-900/80 border border-slate-700/40
          shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.04)]
          backdrop-blur-xl p-1.5 animate-fade-up-2"
        >
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {INNER_TABS.map((tab) => {
              const active = activeInner === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveInner(tab.id)}
                  className={`
                    relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl
                    text-xs font-semibold whitespace-nowrap
                    transition-all duration-200
                    ${active
                      ? `bg-gradient-to-b from-cyan-600/80 to-blue-700/80
                         text-white border border-cyan-500/40
                         shadow-[0_4px_16px_rgba(6,182,212,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]`
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }
                  `}
                >
                  {active && (
                    <span className="absolute inset-x-0 top-0 h-px rounded-t-xl
                      bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
                  )}
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inner Tab Content */}
        <div className="relative rounded-2xl overflow-hidden
          bg-gradient-to-b from-slate-800/60 to-slate-900/80
          border border-slate-700/40
          shadow-[0_8px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]
          backdrop-blur-xl p-5 animate-fade-up-3"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-600/40 to-transparent" />

          {activeInner === "profile"   && <ProfileDocsTab  shipment={shipment} />}
          {activeInner === "ai"        && <AIAnalysisTab   shipment={shipment} onUpdate={setShipment} />}
          {activeInner === "checklist" && <ChecklistTab    shipment={shipment} />}
          {activeInner === "cost"      && <CostTab         shipment={shipment} />}
          {activeInner === "email"     && <EmailDraftTab   shipment={shipment} onUpdate={setShipment} />}
          {activeInner === "send"      && <SendReportTab   shipment={shipment} onUpdate={setShipment} />}
        </div>
      </div>

      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
