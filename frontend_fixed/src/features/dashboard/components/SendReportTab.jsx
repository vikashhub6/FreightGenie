import { useState } from "react";
import api from "../../../api/axiosInstance";

const API_BASE = process.env.REACT_APP_API_URL?.replace("/api", "") || "http://localhost:5003";

export default function SendReportTab({ shipment, onUpdate }) {
  const [sending, setSending]       = useState(false);
  const [generating, setGenerating] = useState(false);
  const [approving, setApproving]   = useState(false);
  const [genEmail, setGenEmail]     = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const sent = !!shipment.emailDraft?.sentAt;
  const report = shipment.complianceReport;
  const status = shipment.status;

  /* ── helpers ── */
  const generatePDF = async () => {
    setGenerating(true);
    try {
      const res = await api.post(`/compliance/${shipment._id}/generate-pdf`);
      onUpdate(res.data.shipment);
    } catch (err) { alert(err.response?.data?.error || "Failed to generate PDF"); }
    finally { setGenerating(false); }
  };

  const approveReport = async () => {
    setApproving(true);
    try {
      const res = await api.post(`/compliance/${shipment._id}/approve`);
      onUpdate(res.data.shipment);
    } catch (err) { alert(err.response?.data?.error || "Approval failed"); }
    finally { setApproving(false); }
  };

  const generateEmail = async () => {
    setGenEmail(true);
    try {
      const res = await api.post(`/compliance/${shipment._id}/generate-email`);
      onUpdate(res.data.shipment);
    } catch (err) { alert(err.response?.data?.error || "Email generation failed"); }
    finally { setGenEmail(false); }
  };

  const sendEmail = async () => {
    if (!shipment.emailDraft?.body && !shipment.emailDraft?.editedBody) {
      return alert("Please generate an email draft first!");
    }
    setSending(true);
    try {
      const res = await api.post(`/email/${shipment._id}/send`);
      onUpdate(res.data.shipment);
    } catch (err) { alert(err.response?.data?.error || "Failed to send email"); }
    finally { setSending(false); }
  };

  // Open PDF preview in new tab
  const previewPDF = () => {
    const token = localStorage.getItem("token");
    window.open(`${API_BASE}/api/compliance/${shipment._id}/preview-pdf?token=${token}`, "_blank");
  };

  const downloadPDF = () => {
    const token = localStorage.getItem("token");
    window.open(`${API_BASE}/api/compliance/${shipment._id}/download-pdf?token=${token}`, "_blank");
  };

  // Workflow steps
  const steps = [
    { key: "docs",     label: "Documents Uploaded",    done: shipment.documents?.length > 0 },
    { key: "ai",       label: "AI Analysis Complete",  done: !!report?.score },
    { key: "reviewed", label: "Report Reviewed",       done: ["compliance_done","email_sent","completed"].includes(status) },
    { key: "pdf",      label: "PDF Generated",         done: !!shipment.pdfReportPath },
    { key: "draft",    label: "Email Draft Ready",     done: !!(shipment.emailDraft?.body || shipment.emailDraft?.editedBody) },
    { key: "sent",     label: "Email Sent to Exporter",done: sent },
  ];
  const currentStep = steps.findIndex(s => !s.done);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
          style={{ background: "linear-gradient(135deg,rgba(14,165,233,0.25),rgba(99,102,241,0.25))", border: "1px solid rgba(99,179,237,0.25)" }}>
          📤
        </div>
        <div>
          <h3 className="text-white font-bold text-sm tracking-tight">Send Report</h3>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Review → Approve → Send</p>
        </div>
      </div>

      {/* ── STEP 1: Review & Approve ── */}
      {status === "awaiting_review" && (
        <div className="rounded-2xl p-4 border"
          style={{ background: "rgba(245,158,11,0.06)", borderColor: "rgba(245,158,11,0.3)" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-amber-300 font-bold text-sm flex items-center gap-2">
                <span>⏳</span> Awaiting Your Review
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                AI analysis is complete. Review the report before sending email to exporter.
              </p>
              {report && (
                <div className="flex gap-4 mt-2">
                  <span className="text-xs font-mono text-amber-200">Score: {report.score}/100</span>
                  <span className="text-xs font-mono"
                    style={{ color: report.riskLevel === "high" ? "#fb7185" : report.riskLevel === "medium" ? "#fbbf24" : "#34d399" }}>
                    {report.riskLevel?.toUpperCase()} RISK
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {shipment.pdfReportPath && (
                <button onClick={previewPDF} className="btn-outline text-xs py-2 px-3">
                  👁 Preview PDF
                </button>
              )}
              <button onClick={approveReport} disabled={approving} className="btn-amber text-xs py-2 px-4">
                {approving ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-slate-800/40 border-t-slate-800 rounded-full animate-spin" />
                    Approving...
                  </span>
                ) : "✅ Approve & Proceed"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PDF Section ── */}
      <div className="rounded-xl p-4 border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-white font-semibold text-sm flex items-center gap-2">📄 PDF Compliance Report</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {shipment.pdfReportPath ? "✅ PDF generated" : "Not generated yet"}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {shipment.pdfReportPath && (
              <>
                <button onClick={previewPDF} className="btn-outline text-xs py-1.5 px-3">
                  👁 Preview
                </button>
                <button onClick={downloadPDF} className="btn-outline text-xs py-1.5 px-3">
                  ⬇ Download
                </button>
              </>
            )}
            <button onClick={generatePDF} disabled={generating} className="btn-primary text-xs py-1.5 px-3">
              {generating ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </span>
              ) : shipment.pdfReportPath ? "🔄 Re-generate" : "Generate PDF"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Generate Email ── */}
      {status !== "awaiting_review" && (
        <div className="rounded-xl p-4 border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-white font-semibold text-sm flex items-center gap-2">🤖 Generate Email Draft</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {shipment.emailDraft?.body ? "Draft ready — go to Email Draft tab to edit" : "AI will write a professional compliance email"}
              </p>
            </div>
            <button onClick={generateEmail} disabled={genEmail || !report} className="btn-primary text-xs py-1.5 px-3">
              {genEmail ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </span>
              ) : shipment.emailDraft?.body ? "🔄 Re-generate" : "Generate Draft"}
            </button>
          </div>
        </div>
      )}

      {/* ── Send Email ── */}
      <div className="rounded-xl p-4 border" style={{ background: "rgba(255,255,255,0.03)", borderColor: sent ? "rgba(52,211,153,0.3)" : "var(--border)" }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-white font-semibold text-sm flex items-center gap-2">
              ✉️ Send Email to Exporter
              {sent && <span className="text-xs text-emerald-400 font-normal">• Sent ✅</span>}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              To: {shipment.exporterEmail}
              {shipment.emailDraft?.sentAt && (
                <span className="ml-2">· Last sent: {new Date(shipment.emailDraft.sentAt).toLocaleString("en-IN")}</span>
              )}
            </p>
          </div>
          <button
            onClick={sendEmail}
            disabled={sending || status === "awaiting_review" || (!shipment.emailDraft?.body && !shipment.emailDraft?.editedBody)}
            className={sent ? "btn-success text-xs py-2 px-4" : "btn-primary text-xs py-2 px-4"}
          >
            {sending ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </span>
            ) : sent ? "📨 Resend" : "📨 Send Email + PDF"}
          </button>
        </div>
      </div>

      {/* ── Workflow Progress ── */}
      <div className="rounded-xl p-4 border" style={{ background: "rgba(56,189,248,0.04)", borderColor: "rgba(56,189,248,0.15)" }}>
        <p className="section-label mb-3">Workflow Progress</p>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                step.done
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : i === currentStep
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "bg-slate-800 border border-slate-700"
              }`}>
                {step.done ? "✓" : i === currentStep ? "→" : ""}
              </div>
              <span className={`text-sm ${
                step.done ? "text-white" : i === currentStep ? "text-amber-300" : "text-slate-600"
              }`}>
                {step.label}
              </span>
              {i === currentStep && !step.done && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 ml-auto">
                  current
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
