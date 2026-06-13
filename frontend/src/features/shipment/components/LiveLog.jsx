// features/shipment/components/LiveLog.js
const LiveLog = ({ logs }) => (
  <div className="card">
    <h3 className="font-semibold mb-3 text-sm">🔴 Live Updates</h3>
    {logs.length === 0 ? (
      <p className="text-xs text-gray-400">Waiting for activity...</p>
    ) : (
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {logs.map((l, i) => (
          <div key={i} className={`text-xs p-2 rounded-lg ${l.status === "error" ? "bg-red-50 text-red-600" : i === 0 ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-600"}`}>
            <div className="font-medium">{l.message}</div>
            <div className="text-gray-400">{l.time}</div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default LiveLog;
