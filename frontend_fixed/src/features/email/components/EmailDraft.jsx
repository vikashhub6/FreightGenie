// features/email/components/EmailDraft.js
const EmailDraft = ({ emailDraft, setEmailDraft, editMode, setEditMode, onSave, onSend, onGenerate, compliance, actionLoading, sentAt }) => {
  if (!emailDraft.body) return (
    <div className="text-center py-8">
      <div className="text-4xl mb-3">✉️</div>
      <p className="text-gray-500 mb-4">AI will write a professional email with compliance report</p>
      <button className="btn-primary" disabled={!compliance || actionLoading === "email"} onClick={onGenerate}>
        {actionLoading === "email" ? "AI Writing..." : "🤖 Generate Email Draft"}
      </button>
    </div>
  );

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Subject</label>
        {editMode
          ? <input className="input" value={emailDraft.subject} onChange={(e) => setEmailDraft({ ...emailDraft, subject: e.target.value })} />
          : <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm font-medium">{emailDraft.subject}</div>
        }
      </div>
      <div>
        <label className="label">Email Body</label>
        {editMode
          ? <textarea className="input min-h-64 font-mono text-xs" value={emailDraft.body} onChange={(e) => setEmailDraft({ ...emailDraft, body: e.target.value })} />
          : <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm whitespace-pre-wrap font-mono text-xs max-h-64 overflow-y-auto">{emailDraft.body}</div>
        }
      </div>
      <div className="flex gap-2 pt-2 border-t">
        {editMode
          ? <button className="btn-primary text-sm flex-1" onClick={onSave} disabled={actionLoading === "save"}>💾 Save</button>
          : <button className="btn-outline text-sm flex-1" onClick={() => setEditMode(true)}>✏️ Edit Draft</button>
        }
        <button className="btn-success text-sm flex-1" disabled={actionLoading === "send"} onClick={onSend}>
          {actionLoading === "send" ? "Sending..." : "📤 Send to Exporter"}
        </button>
      </div>
      {sentAt && <p className="text-xs text-green-600 text-center">✅ Last sent: {new Date(sentAt).toLocaleString()}</p>}
    </div>
  );
};

export default EmailDraft;
