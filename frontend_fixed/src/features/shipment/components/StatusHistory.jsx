// features/shipment/components/StatusHistory.js
const StatusHistory = ({ history = [] }) => (
  <div className="card">
    <h3 className="font-semibold mb-3 text-sm">📋 Status History</h3>
    <div className="space-y-2">
      {[...history].reverse().map((h, i) => (
        <div key={i} className="text-xs border-l-2 border-blue-200 pl-2 py-1">
          <div className="font-medium text-gray-700">{h.message}</div>
          <div className="text-gray-400">{new Date(h.timestamp).toLocaleString()}</div>
        </div>
      ))}
    </div>
  </div>
);

export default StatusHistory;
