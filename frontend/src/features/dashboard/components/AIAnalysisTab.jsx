import { useState, useEffect } from "react";
import api from "../../../api/axiosInstance";
import useSocket from "../../shipment/hooks/useSocket";

export default function AIAnalysisTab({ shipment, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const report = shipment.complianceReport;

  // ✅ Socket se real-time status sun — jab AI done ho, report aa jaayegi
  useSocket(shipment._id, async (data) => {
    setStatusMsg(data.message || "");

    // Jab AI done ho (report aaya socket mein) ya status change ho
    if (data.status === "awaiting_review" || data.report) {
      setLoading(false);
      // Fresh shipment fetch karo DB se (report ke saath)
      try {
        const res = await api.get(`/shipments/${shipment._id}`);
        onUpdate(res.data);
      } catch {
        // silently ignore
      }
    }

    if (data.status === "error") {
      setLoading(false);
      setStatusMsg("❌ AI analysis failed. Dobara try karo.");
    }
  });

  const runAnalysis = async () => {
    setLoading(true);
    setStatusMsg("🚀 AI analysis shuru ho rahi hai...");
    try {
      await api.post(`/compliance/${shipment._id}/analyze`);
      setStatusMsg("📄 AI documents padh raha hai...");
      // ✅ Yahan wait nahi karna — socket event aayega automatically
    } catch (err) {
      setLoading(false);
      setStatusMsg("");
      alert(err.response?.data?.error || "Analysis failed");
    }
  };

  const scoreColor = (score) => {
    if (score >= 75) return "text-emerald-300";
    if (score >= 50) return "text-amber-300";
    return "text-rose-300";
  };

  const scoreGlow = (score) => {
    if (score >= 75) return "drop-shadow-[0_0_20px_rgba(52,211,153,0.8)]";
    if (score >= 50) return "drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]";
    return "drop-shadow-[0_0_20px_rgba(251,113,133,0.8)]";
  };

  const riskBadge = (risk) =>
    ({
      low: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(52,211,153,0.3)]",
      medium: "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(251,191,36,0.3)]",
      high: "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(251,113,133,0.3)]",
    }[risk] || "bg-slate-500/20 text-slate-400 border border-slate-500/30");

  return (
    <div className="relative">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -top-10 -left-10 w-64 h-64 rounded-full bg-cyan-500/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 w-64 h-64 rounded-full bg-violet-500/5 blur-3xl" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/30 to-violet-500/30 border border-cyan-500/30 flex items-center justify-center shadow-[0_4px_16px_rgba(6,182,212,0.25)] backdrop-blur-sm">
            <span className="text-base">🤖</span>
          </div>
          <h3 className="text-white font-bold tracking-tight text-sm">
            AI Compliance Analysis
          </h3>
        </div>

        <button
          onClick={runAnalysis}
          disabled={loading}
          className={`
            relative px-4 py-2 rounded-xl text-xs font-semibold tracking-wide
            bg-gradient-to-r from-cyan-500/20 to-violet-500/20
            border border-cyan-500/40
            text-cyan-300
            shadow-[0_4px_20px_rgba(6,182,212,0.25),inset_0_1px_0_rgba(255,255,255,0.1)]
            hover:shadow-[0_4px_28px_rgba(6,182,212,0.45),inset_0_1px_0_rgba(255,255,255,0.15)]
            hover:border-cyan-400/60 hover:text-white
            active:scale-95
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
            overflow-hidden
          `}
        >
          {/* Shimmer line */}
          <span className="pointer-events-none absolute inset-0 rounded-xl overflow-hidden">
            <span className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" />
          </span>

          {loading ? (
            <span className="flex items-center gap-2 relative z-10">
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
              Analyzing...
            </span>
          ) : (
            <span className="relative z-10">{report ? "Re-analyze" : "Run AI Analysis"}</span>
          )}
        </button>
      </div>

      {/* ✅ Real-time socket status message */}
      {statusMsg && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs animate-pulse mb-4">
          <svg className="w-3 h-3 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
          </svg>
          {statusMsg}
        </div>
      )}

      {!report ? (
        /* Empty state */
        <div className="text-center py-16 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]">
            <span className="text-3xl opacity-30">🤖</span>
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">No analysis yet</p>
            <p className="text-slate-600 text-xs mt-1">Click "Run AI Analysis" to start</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Score Cards Row */}
          <div className="flex gap-3 flex-wrap">
            {/* Compliance Score */}
            <div className="flex-1 min-w-[100px] relative group rounded-2xl overflow-hidden
              bg-gradient-to-b from-slate-800/80 to-slate-900/80
              border border-slate-700/50
              shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]
              backdrop-blur-sm p-4 text-center
              hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]
              hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-500/30 to-transparent" />
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-medium">Compliance Score</p>
              <p className={`text-4xl font-black tabular-nums ${scoreColor(report.score)} ${scoreGlow(report.score)} transition-all`}>
                {report.score}
                <span className="text-lg font-semibold text-slate-500">/100</span>
              </p>
            </div>

            {/* Risk Level */}
            <div className="flex-1 min-w-[100px] relative group rounded-2xl overflow-hidden
              bg-gradient-to-b from-slate-800/80 to-slate-900/80
              border border-slate-700/50
              shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]
              backdrop-blur-sm p-4 text-center
              hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-500/30 to-transparent" />
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-medium">Risk Level</p>
              <div className="flex justify-center">
                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wider ${riskBadge(report.riskLevel)}`}>
                  {report.riskLevel?.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="flex-1 min-w-[100px] relative group rounded-2xl overflow-hidden
              bg-gradient-to-b from-slate-800/80 to-slate-900/80
              border border-slate-700/50
              shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]
              backdrop-blur-sm p-4 text-center
              hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-500/30 to-transparent" />
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-medium">Status</p>
              <p className="text-white text-xs font-semibold leading-snug">
                {report.status?.replace(/_/g, " ")}
              </p>
            </div>
          </div>

          {/* Summary */}
          {report.summary && (
            <div className="relative rounded-2xl overflow-hidden
              bg-gradient-to-b from-slate-800/60 to-slate-900/60
              border border-slate-700/40
              shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]
              backdrop-blur-sm p-4"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-600/40 to-transparent" />
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-semibold">Summary</p>
              <p className="text-sm text-slate-300 leading-relaxed">{report.summary}</p>
            </div>
          )}

          {/* Issues */}
          {report.issues?.length > 0 && (
            <div className="relative rounded-2xl overflow-hidden
              bg-gradient-to-b from-rose-950/40 to-slate-900/60
              border border-rose-500/25
              shadow-[0_8px_32px_rgba(244,63,94,0.1),inset_0_1px_0_rgba(255,255,255,0.04)]
              backdrop-blur-sm p-4"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
              <p className="text-[10px] uppercase tracking-widest text-rose-400 mb-3 font-semibold flex items-center gap-1.5">
                <span>⚠️</span> Issues Found
              </p>
              <ul className="space-y-2">
                {report.issues.map((issue, i) => (
                  <li key={i} className="text-sm text-slate-300 flex gap-2.5 items-start">
                    <span className="text-rose-400 mt-0.5 shrink-0">▸</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing Docs */}
          {report.missingDocs?.length > 0 && (
            <div className="relative rounded-2xl overflow-hidden
              bg-gradient-to-b from-amber-950/40 to-slate-900/60
              border border-amber-500/25
              shadow-[0_8px_32px_rgba(245,158,11,0.1),inset_0_1px_0_rgba(255,255,255,0.04)]
              backdrop-blur-sm p-4"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
              <p className="text-[10px] uppercase tracking-widest text-amber-400 mb-3 font-semibold flex items-center gap-1.5">
                <span>📄</span> Missing Documents
              </p>
              <ul className="space-y-2">
                {report.missingDocs.map((doc, i) => (
                  <li key={i} className="text-sm text-slate-300 flex gap-2.5 items-start">
                    <span className="text-amber-400 mt-0.5 shrink-0">▸</span>
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Expiry Alerts */}
          {report.expiryAlerts?.length > 0 && (
            <div className="relative rounded-2xl overflow-hidden
              bg-gradient-to-b from-orange-950/40 to-slate-900/60
              border border-orange-500/25
              shadow-[0_8px_32px_rgba(249,115,22,0.1),inset_0_1px_0_rgba(255,255,255,0.04)]
              backdrop-blur-sm p-4"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
              <p className="text-[10px] uppercase tracking-widest text-orange-400 mb-3 font-semibold flex items-center gap-1.5">
                <span>⏰</span> Expiry Alerts
              </p>
              <div className="space-y-2">
                {report.expiryAlerts.map((alert, i) => (
                  <p key={i} className="text-sm text-slate-300 flex gap-2.5 items-start">
                    <span className="text-orange-400 mt-0.5 shrink-0">▸</span>
                    <span>
                      <span className="text-orange-300 font-medium">{alert.doc}</span>
                      <span className="text-slate-500"> — expires </span>
                      {alert.date}
                    </span>
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {report.suggestions?.length > 0 && (
            <div className="relative rounded-2xl overflow-hidden
              bg-gradient-to-b from-blue-950/40 to-slate-900/60
              border border-blue-500/25
              shadow-[0_8px_32px_rgba(59,130,246,0.1),inset_0_1px_0_rgba(255,255,255,0.04)]
              backdrop-blur-sm p-4"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
              <p className="text-[10px] uppercase tracking-widest text-blue-400 mb-3 font-semibold flex items-center gap-1.5">
                <span>💡</span> Suggestions
              </p>
              <ul className="space-y-2">
                {report.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-slate-300 flex gap-2.5 items-start">
                    <span className="text-blue-400 mt-0.5 shrink-0">▸</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Shimmer keyframe — inject once via style tag */}
      <style>{`
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 200%; }
        }
      `}</style>
    </div>
  );
}