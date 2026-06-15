import { useState } from "react";
import { searchByPinAPI } from "../../shipment/services/shipmentService";
import ProfileDocsTab from "./ProfileDocsTab";
import AIAnalysisTab from "./AIAnalysisTab";
import ChecklistTab from "./ChecklistTab";
import CostTab from "./CostTab";
import EmailDraftTab from "./EmailDraftTab";
import SendReportTab from "./SendReportTab";

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

export default function WorkspaceTab() {
  const [pin, setPin]             = useState("");
  const [shipment, setShipment]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [activeInner, setActiveInner] = useState("profile");

  const handleSearch = async () => {
    if (!pin.trim()) return;
    setLoading(true);
    setError("");
    setShipment(null);
    try {
      const res = await searchByPinAPI(pin.trim().toUpperCase());
      setShipment(res.data);
      setActiveInner("profile");
    } catch (err) {
      setError(err.response?.data?.error || "Shipment not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative animate-fade-up space-y-5">

      {/* Ambient background orbs */}
      <div className="pointer-events-none fixed top-20 left-10 w-96 h-96 rounded-full bg-cyan-600/5 blur-3xl" />
      <div className="pointer-events-none fixed bottom-20 right-10 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl" />

      {/* ── PIN Search Card ── */}
      <div className="relative rounded-2xl overflow-hidden
        bg-gradient-to-b from-slate-800/70 to-slate-900/80
        border border-slate-700/50
        shadow-[0_8px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.07)]
        backdrop-blur-xl p-5"
      >
        {/* top shimmer line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/25 to-violet-500/25
            border border-cyan-500/30
            shadow-[0_4px_14px_rgba(6,182,212,0.2)]
            flex items-center justify-center text-sm"
          >🔍</div>
          <h2 className="text-white font-bold text-sm tracking-tight"
            style={{ fontFamily: "Syne, sans-serif" }}>
            Workspace — Search by PIN
          </h2>
        </div>

        <div className="flex gap-3">
          <input
            className="
              flex-1 bg-slate-900/70 border border-slate-700/60
              rounded-xl px-4 py-2.5
              text-white font-mono tracking-widest uppercase text-sm
              placeholder:text-slate-600 placeholder:normal-case placeholder:tracking-normal
              focus:outline-none focus:border-cyan-500/60
              focus:shadow-[0_0_0_3px_rgba(6,182,212,0.1)]
              transition-all duration-200
            "
            placeholder="Enter PIN  (e.g. SC-4821)"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />

          <button
            onClick={handleSearch}
            disabled={loading}
            className="
              relative px-6 py-2.5 rounded-xl text-sm font-semibold
              bg-gradient-to-r from-cyan-600/80 to-blue-600/80
              border border-cyan-500/40
              text-white
              shadow-[0_4px_20px_rgba(6,182,212,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]
              hover:shadow-[0_4px_28px_rgba(6,182,212,0.5)]
              hover:from-cyan-500/90 hover:to-blue-500/90
              active:scale-95 transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
              overflow-hidden
            "
          >
            <span className="pointer-events-none absolute inset-0">
              <span className="absolute top-0 left-[-100%] w-full h-full
                bg-gradient-to-r from-transparent via-white/10 to-transparent
                animate-[shimmer_2.5s_infinite]" />
            </span>
            {loading ? (
              <span className="flex items-center gap-2 relative z-10">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                </svg>
                Searching...
              </span>
            ) : (
              <span className="relative z-10">Search</span>
            )}
          </button>
        </div>

        {error && (
          <p className="flex items-center gap-2 text-rose-400 text-xs mt-3
            bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
            ⚠️ {error}
          </p>
        )}
      </div>

      {/* ── Shipment Workspace ── */}
      {shipment && (
        <div className="space-y-4">

          {/* Exporter Info Bar */}
          <div className="relative rounded-2xl overflow-hidden
            bg-gradient-to-r from-slate-800/70 via-slate-800/60 to-slate-900/70
            border border-slate-700/50
            shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]
            backdrop-blur-xl p-4"
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
            backdrop-blur-xl p-1.5"
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
            backdrop-blur-xl p-5"
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
      )}

      {/* Empty State */}
      {!shipment && !loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <div className="w-20 h-20 rounded-2xl
            bg-gradient-to-br from-slate-800 to-slate-900
            border border-slate-700/50
            shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]
            flex items-center justify-center"
          >
            <span className="text-3xl opacity-25">🔍</span>
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-sm font-medium">No shipment loaded</p>
            <p className="text-slate-600 text-xs mt-1">Enter a PIN above to open exporter workspace</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0%   { left: -100%; }
          100% { left: 200%; }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}