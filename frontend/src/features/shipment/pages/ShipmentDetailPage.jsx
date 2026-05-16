import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useShipment from "../hooks/useShipment";
import useSocket from "../hooks/useSocket";
import useEmailActions from "../../email/hooks/useEmailActions";
import StatusBadge from "../components/StatusBadge";
import ScoreCard from "../components/ScoreCard";
import LiveLog from "../components/LiveLog";
import StatusHistory from "../components/StatusHistory";
import ComplianceReport from "../../compliance/components/ComplianceReport";
import ComplianceChecklist from "../../compliance/components/ComplianceChecklist";
import CostEstimate from "../../compliance/components/CostEstimate";
import EmailDraft from "../../email/components/EmailDraft";
import { analyzeComplianceAPI, approveReportAPI, downloadPDFAPI, previewPDFAPI } from "../../compliance/services/complianceService";

const TABS = ["overview","documents","compliance","checklist","cost","email"];
const TAB_ICONS = { overview:"🚢", documents:"📄", compliance:"🤖", checklist:"✅", cost:"💰", email:"✉️" };

export default function ShipmentDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [editMode, setEditMode]   = useState(false);
  const [complianceLoading, setComplianceLoading] = useState("");

  const { shipment, compliance, emailDraft, setEmailDraft, loading, reload } = useShipment(id);
  const { liveLog } = useSocket(id, (data) => {
    if (["compliance_done","awaiting_review","email_sent","ai_done"].includes(data.status)) reload();
  });
  const { actionLoading, handleGenerateEmail, handleSaveDraft, handleSendEmail, handleMissingAlert } = useEmailActions(id, setEmailDraft, reload);

  const onGenerateEmail = async () => { await handleGenerateEmail(); setActiveTab("email"); };

  const handleAnalyze = async () => {
    setComplianceLoading("analyze");
    try { await analyzeComplianceAPI(id); setActiveTab("compliance"); }
    catch (e) { alert(e.response?.data?.error || "Analysis failed"); }
    finally { setComplianceLoading(""); }
  };

  const handleApprove = async () => {
    setComplianceLoading("approve");
    try { await approveReportAPI(id); await reload(); }
    catch (e) { alert(e.response?.data?.error || "Approve failed"); }
    finally { setComplianceLoading(""); }
  };

  const handlePreviewPDF = async () => {
    setComplianceLoading("preview");
    try {
      const res = await previewPDFAPI(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      window.open(url, "_blank");
    } catch (e) { alert(e.response?.data?.error || "PDF preview failed"); }
    finally { setComplianceLoading(""); }
  };

  const handleDownloadPDF = async () => {
    setComplianceLoading("download");
    try {
      const res = await downloadPDFAPI(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${shipment.shipmentId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { alert(e.response?.data?.error || "PDF download failed"); }
    finally { setComplianceLoading(""); }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-8 h-8 border-2 border-slate-700 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  );
  if (!shipment) return (
    <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>Shipment not found</div>
  );

  const canAnalyze = shipment.documents?.length > 0 && !["ai_analyzing"].includes(shipment.status);
  const canApprove = shipment.status === "awaiting_review";
  const hasPDF     = !!shipment.pdfReportPath || !!compliance;

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

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="card mb-6 animate-fade-up">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{shipment.product}</h1>
                <span className="font-mono text-xs px-2 py-0.5 rounded"
                  style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
                  {shipment.shipmentId}
                </span>
              </div>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {shipment.origin} → {shipment.destination}
                <span className="mx-2 opacity-40">·</span>
                {shipment.cargoType}
              </p>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                Exporter: <span style={{ color: "var(--text-primary)" }}>{shipment.exporterName || shipment.exporterEmail}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ScoreCard score={compliance?.score} />
              <StatusBadge status={shipment.status} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-1 mb-4 p-1 rounded-xl overflow-x-auto scrollbar-none animate-fade-up-2"
              style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)" }}>
              {TABS.map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200"
                  style={activeTab === t
                    ? { background: "linear-gradient(135deg,#0ea5e9,#6366f1)", color: "#fff", boxShadow: "0 4px 16px rgba(14,165,233,0.3)" }
                    : { color: "var(--text-muted)" }
                  }>
                  <span>{TAB_ICONS[t]}</span>
                  <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                </button>
              ))}
            </div>

            <div className="card animate-fade-up-3">
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <h2 className="font-bold" style={{ color: "var(--text-primary)" }}>Shipment Overview</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {[["Product",shipment.product],["Origin",shipment.origin],["Destination",shipment.destination],
                      ["Cargo Type",shipment.cargoType],["Exporter Email",shipment.exporterEmail],["Documents",shipment.documents?.length||0]
                    ].map(([k,v]) => (
                      <div key={k} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                        <div className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--text-muted)" }}>{k}</div>
                        <div className="font-semibold text-sm mt-1" style={{ color: "var(--text-primary)" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "documents" && (
                <div>
                  <h2 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                    Uploaded Documents ({shipment.documents?.length || 0})
                  </h2>
                  {!shipment.documents?.length
                    ? <div className="text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}>No documents yet. Waiting for exporter to upload.</div>
                    : shipment.documents.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl border mb-2 transition-all"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{doc.type==="invoice"?"🧾":doc.type==="packing_list"?"📦":doc.type==="certificate"?"📜":"📄"}</span>
                          <div>
                            <div className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{doc.originalName}</div>
                            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                              {doc.type?.replace(/_/g," ")} · {new Date(doc.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {doc.cloudinaryUrl && (
                          <a href={doc.cloudinaryUrl} target="_blank" rel="noreferrer"
                            className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                            style={{ background: "rgba(56,189,248,0.1)", color: "var(--accent-cyan)", border: "1px solid rgba(56,189,248,0.2)" }}>
                            View ↗
                          </a>
                        )}
                      </div>
                    ))
                  }
                </div>
              )}

              {activeTab === "compliance" && (
                <div>
                  <h2 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>AI Compliance Report</h2>
                  <ComplianceReport compliance={compliance} onSendAlert={handleMissingAlert} alertLoading={actionLoading==="alert"} />
                </div>
              )}
              {activeTab === "checklist" && (
                <div>
                  <h2 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>Compliance Checklist</h2>
                  <ComplianceChecklist checklist={compliance?.checklist} />
                </div>
              )}
              {activeTab === "cost" && (
                <div>
                  <h2 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>Cost / Budget Estimation</h2>
                  <CostEstimate compliance={compliance} />
                </div>
              )}
              {activeTab === "email" && (
                <div>
                  <h2 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>AI Email Draft</h2>
                  <EmailDraft
                    emailDraft={emailDraft}
                    setEmailDraft={setEmailDraft}
                    editMode={editMode}
                    setEditMode={setEditMode}
                    compliance={compliance}
                    actionLoading={actionLoading}
                    sentAt={shipment.emailDraft?.sentAt}
                    onGenerate={onGenerateEmail}
                    onSave={() => { handleSaveDraft(emailDraft); setEditMode(false); }}
                    onSend={handleSendEmail}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <LiveLog logs={liveLog} />
            <StatusHistory history={shipment.statusHistory} />
            <div className="card">
              <h3 className="font-bold mb-3 text-sm" style={{ color: "var(--text-primary)" }}>⚡ Quick Actions</h3>
              <div className="space-y-2">

                {/* Analyze */}
                {canAnalyze && (
                  <button className="btn-primary w-full text-sm" onClick={handleAnalyze}
                    disabled={complianceLoading === "analyze"}>
                    {complianceLoading === "analyze" ? "⏳ Analyzing..." : "🤖 Run AI Analysis"}
                  </button>
                )}

                {/* Approve */}
                {canApprove && (
                  <button className="btn-outline w-full text-sm" onClick={handleApprove}
                    disabled={complianceLoading === "approve"}>
                    {complianceLoading === "approve" ? "⏳ Approving..." : "✅ Approve Report"}
                  </button>
                )}

                {/* PDF Preview */}
                {hasPDF && (
                  <button className="btn-outline w-full text-sm" onClick={handlePreviewPDF}
                    disabled={complianceLoading === "preview"}>
                    {complianceLoading === "preview" ? "⏳ Loading..." : "👁️ Preview PDF"}
                  </button>
                )}

                {/* PDF Download */}
                {hasPDF && (
                  <button className="btn-outline w-full text-sm" onClick={handleDownloadPDF}
                    disabled={complianceLoading === "download"}>
                    {complianceLoading === "download" ? "⏳ Downloading..." : "⬇️ Download PDF"}
                  </button>
                )}

                <button className="btn-outline w-full text-sm justify-start" onClick={() => setActiveTab("email")}>
                  ✉️ Go to Email Draft
                </button>
                {compliance?.missingDocs?.length > 0 && (
                  <button className="btn-danger w-full text-sm" onClick={handleMissingAlert} disabled={actionLoading==="alert"}>
                    📧 Send Missing Docs Alert
                  </button>
                )}
                {compliance && !emailDraft?.body && (
                  <button className="btn-primary w-full text-sm" onClick={onGenerateEmail} disabled={actionLoading==="email"}>
                    🤖 Generate Email
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
