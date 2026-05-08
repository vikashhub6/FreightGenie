// features/shipment/components/ScoreCard.js
const ScoreCard = ({ score }) => {
  if (score === undefined) return null;
  const color = score >= 70 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600";
  const bg    = score >= 70 ? "bg-green-50 border-green-200" : score >= 50 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200";
  return (
    <div className={`text-center px-4 py-2 rounded-xl border ${bg}`}>
      <div className={`text-2xl font-bold ${color}`}>{score}/100</div>
      <div className="text-xs text-gray-500">Compliance</div>
    </div>
  );
};

export default ScoreCard;
