// features/compliance/components/ComplianceReport.js
const checkIcon = (st) => st === "ok" ? "✅" : st === "warning" ? "⚠️" : "❌";

const ComplianceReport = ({ compliance, onSendAlert, alertLoading }) => {
  if (!compliance) return <div className="text-center py-8 text-gray-400">Upload documents to get AI compliance analysis</div>;

  const scoreColor = compliance.score >= 70 ? "text-green-600" : compliance.score >= 50 ? "text-yellow-600" : "text-red-600";
  const scoreBg    = compliance.score >= 70 ? "bg-green-50 border-green-200" : compliance.score >= 50 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200";

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-xl border ${scoreBg} flex items-center justify-between`}>
        <div>
          <div className={`text-4xl font-bold ${scoreColor}`}>{compliance.score}/100</div>
          <div className="text-sm text-gray-500 mt-1">Risk: <span className="font-medium uppercase">{compliance.riskLevel}</span></div>
        </div>
        <div className="text-right text-sm text-gray-600 max-w-xs">{compliance.summary}</div>
      </div>

      {compliance.missingDocs?.length > 0 && (
        <div>
          <h3 className="font-medium text-red-600 mb-2">❌ Missing Documents</h3>
          {compliance.missingDocs.map((d, i) => <div key={i} className="bg-red-50 text-red-700 text-sm p-2 rounded mb-1">• {d}</div>)}
          <button className="btn-danger text-sm mt-2" onClick={onSendAlert} disabled={alertLoading}>
            {alertLoading ? "Sending..." : "📧 Send Missing Docs Alert"}
          </button>
        </div>
      )}

      {compliance.issues?.length > 0 && (
        <div>
          <h3 className="font-medium text-red-600 mb-2">⚠️ Issues Found</h3>
          {compliance.issues.map((i, idx) => <div key={idx} className="bg-orange-50 text-orange-700 text-sm p-2 rounded mb-1">• {i}</div>)}
        </div>
      )}

      {compliance.suggestions?.length > 0 && (
        <div>
          <h3 className="font-medium text-green-600 mb-2">✅ Recommendations</h3>
          {compliance.suggestions.map((s, i) => <div key={i} className="bg-green-50 text-green-700 text-sm p-2 rounded mb-1">• {s}</div>)}
        </div>
      )}

      {compliance.expiryAlerts?.length > 0 && (
        <div>
          <h3 className="font-medium text-yellow-600 mb-2">⏰ Expiry Alerts</h3>
          {compliance.expiryAlerts.map((e, i) => <div key={i} className="bg-yellow-50 text-yellow-700 text-sm p-2 rounded mb-1">• {e.doc}: {e.date}</div>)}
        </div>
      )}
    </div>
  );
};

export default ComplianceReport;
