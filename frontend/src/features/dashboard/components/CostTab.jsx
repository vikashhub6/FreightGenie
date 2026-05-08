export default function CostTab({ shipment }) {
  const report = shipment.complianceReport;

  if (!report?.hsCode && !report?.freightCost) {
    return (
      <div className="text-center py-12 text-slate-500">
        <div className="text-4xl mb-3 opacity-30">💰</div>
        <p>No cost data yet. Run AI Analysis first.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-white font-semibold mb-4">💰 Cost Estimation</h3>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "HS Code", value: report.hsCode, icon: "🏷️" },
          { label: "Customs Duty", value: report.dutyEstimate, icon: "🏛️" },
          { label: "Freight Cost", value: report.freightCost, icon: "🚢" },
          { label: "Total Landed Cost", value: report.totalCost, icon: "💵" },
        ].map((item) => (
          <div key={item.label} className="bg-slate-800/50 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">{item.icon} {item.label}</p>
            <p className="text-white font-semibold">{item.value || "—"}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
        <p className="text-xs text-blue-400 mb-1">Route</p>
        <p className="text-white">{shipment.origin} → {shipment.destination}</p>
        <p className="text-xs text-slate-500 mt-1">Cargo: {shipment.cargoType}</p>
      </div>
    </div>
  );
}
