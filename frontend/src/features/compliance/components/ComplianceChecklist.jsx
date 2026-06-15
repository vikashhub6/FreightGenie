// features/compliance/components/ComplianceChecklist.js
const checkIcon = (st) => st === "ok" ? "✅" : st === "warning" ? "⚠️" : "❌";

const ComplianceChecklist = ({ checklist = [] }) => {
  if (!checklist.length) return <div className="text-center py-8 text-gray-400">Checklist will appear after AI analysis</div>;

  return (
    <div>
      {["exporter", "forwarder"].map((role) => (
        <div key={role} className="mb-6">
          <h3 className="text-sm font-semibold uppercase text-gray-400 mb-2">
            {role === "exporter" ? "📤 Exporter Tasks" : "🏢 Forwarder Tasks"}
          </h3>
          {checklist.filter((c) => c.assignedTo === role).map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg mb-2">
              <span>{checkIcon(item.status)}</span>
              <span className="text-sm text-gray-700">{item.task}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ComplianceChecklist;
