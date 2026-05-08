import { useState, useEffect } from "react";
import api from "../../../api/axiosInstance";

export default function EmailDraftTab({ shipment, onUpdate }) {
  const [subject, setSubject]     = useState(shipment.emailDraft?.subject || "");
  const [body, setBody]           = useState(shipment.emailDraft?.editedBody || shipment.emailDraft?.body || "");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  useEffect(() => {
    setSubject(shipment.emailDraft?.subject || "");
    setBody(shipment.emailDraft?.editedBody || shipment.emailDraft?.body || "");
  }, [shipment]);

  const generateDraft = async () => {
    setGenerating(true);
    try {
      const res = await api.post(`/compliance/${shipment._id}/generate-email`);
      onUpdate(res.data.shipment);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to generate email");
    } finally { setGenerating(false); }
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/email/${shipment._id}/draft`, { subject, body });
      onUpdate(res.data.shipment);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Failed to save draft");
    } finally { setSaving(false); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ background: "linear-gradient(135deg,rgba(14,165,233,0.25),rgba(99,102,241,0.25))", border: "1px solid rgba(99,179,237,0.25)" }}>
            ✉️
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Email Draft</h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              To: {shipment.exporterEmail}
            </p>
          </div>
        </div>
        <button className="btn-primary text-xs py-1.5 px-3" onClick={generateDraft} disabled={generating || !shipment.complianceReport}>
          {generating ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </span>
          ) : body ? "🔄 Re-generate" : "🤖 Generate with AI"}
        </button>
      </div>

      {!body ? (
        <div className="text-center py-14 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
            <span className="text-3xl opacity-20">✉️</span>
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>No draft yet</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {shipment.complianceReport ? 'Click "Generate with AI" to create one' : "Run AI analysis first"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="label">Subject</label>
            <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="label">Body (editable)</label>
            <textarea
              className="input font-mono text-xs leading-relaxed"
              rows={14}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>
          <button className={`w-full text-sm py-2.5 rounded-xl font-semibold transition-all duration-200 ${
            saved ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "btn-primary"
          }`} onClick={saveDraft} disabled={saving}>
            {saving ? "Saving..." : saved ? "✅ Saved!" : "💾 Save Draft"}
          </button>
        </div>
      )}
    </div>
  );
}
