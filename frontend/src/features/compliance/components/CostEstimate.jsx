// features/compliance/components/CostEstimate.js
const CostEstimate = ({ compliance }) => {
  if (!compliance) return <div className="text-center py-8 text-gray-400">Cost estimate will appear after AI analysis</div>;
  return (
    <div className="space-y-3">
      {[["📦 HS Code", compliance.hsCode], ["🚢 Freight Cost", compliance.freightCost], ["🏛️ Duty Estimate", compliance.dutyEstimate], ["💰 Total Landed Cost", compliance.totalCost]].map(([label, value]) => (
        <div key={label} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
          <span className="font-medium text-gray-700">{label}</span>
          <span className="text-blue-700 font-semibold">{value || "TBD"}</span>
        </div>
      ))}
      <p className="text-xs text-gray-400 mt-2">* AI-generated estimates. Actual costs may vary.</p>
    </div>
  );
};

export default CostEstimate;
