export default function ChecklistTab({ shipment }) {
  const checklist = shipment.complianceReport?.checklist || [];

  const statusIcon = (status) => ({
    ok: "✅",
    warning: "⚠️",
    missing: "❌",
  }[status] || "⬜");

  const exporterTasks = checklist.filter((t) => t.assignedTo === "exporter");
  const forwarderTasks = checklist.filter((t) => t.assignedTo === "forwarder");

  if (checklist.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <div className="text-4xl mb-3 opacity-30">✅</div>
        <p>No checklist yet. Run AI Analysis first.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-white font-semibold mb-4">✅ Compliance Checklist</h3>

      {/* Exporter Tasks */}
      {exporterTasks.length > 0 && (
        <div className="mb-5">
          <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wider">Exporter Tasks</p>
          <div className="space-y-2">
            {exporterTasks.map((task, i) => (
              <div key={i} className="flex gap-3 items-start p-3 bg-slate-800/50 rounded-xl">
                <span className="text-lg">{statusIcon(task.status)}</span>
                <p className="text-sm text-slate-300">{task.task}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forwarder Tasks */}
      {forwarderTasks.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wider">Forwarder Tasks</p>
          <div className="space-y-2">
            {forwarderTasks.map((task, i) => (
              <div key={i} className="flex gap-3 items-start p-3 bg-slate-800/50 rounded-xl">
                <span className="text-lg">{statusIcon(task.status)}</span>
                <p className="text-sm text-slate-300">{task.task}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
