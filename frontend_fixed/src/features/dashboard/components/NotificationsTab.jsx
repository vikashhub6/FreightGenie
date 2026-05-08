import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";

const TYPE_CONFIG = {
  docs_uploaded: { icon: "📄", color: "rgba(56,189,248,0.3)",  textColor: "#38bdf8" },
  ai_done:       { icon: "🤖", color: "rgba(167,139,250,0.3)", textColor: "#a78bfa" },
  missing_docs:  { icon: "⚠️", color: "rgba(251,191,36,0.3)",  textColor: "#fbbf24" },
  expiry_alert:  { icon: "⏰", color: "rgba(251,113,133,0.3)", textColor: "#fb7185" },
};

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    api.get("/notifications")
      .then(res => setNotifications(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await api.put("/notifications/read-all");
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24 gap-3" style={{ color: "var(--text-muted)" }}>
      <div className="w-5 h-5 border-2 border-slate-700 border-t-cyan-400 rounded-full animate-spin" />
      <span className="text-sm">Loading notifications...</span>
    </div>
  );

  return (
    <div className="animate-fade-up">
      <div className="card">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-bold text-lg" style={{ fontFamily: "Syne,sans-serif", color: "var(--text-primary)" }}>
            🔔 Notifications
          </h2>
          {notifications.some(n => !n.read) && (
            <button className="text-xs hover:text-white transition-colors" style={{ color: "var(--accent-cyan)" }} onClick={markAllRead}>
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
              <span className="text-3xl opacity-20">🔔</span>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => {
              const cfg = TYPE_CONFIG[n.type] || { icon: "🔔", color: "rgba(148,163,184,0.2)", textColor: "#94a3b8" };
              return (
                <div
                  key={n._id}
                  onClick={() => !n.read && markRead(n._id)}
                  className="flex gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer"
                  style={{
                    background: n.read ? "rgba(255,255,255,0.02)" : "rgba(56,189,248,0.04)",
                    borderColor: n.read ? "var(--border)" : "rgba(56,189,248,0.2)",
                  }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                    style={{ background: n.read ? "rgba(255,255,255,0.04)" : cfg.color, border: `1px solid ${cfg.color}` }}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug" style={{ color: n.read ? "var(--text-secondary)" : "var(--text-primary)" }}>
                      {n.message}
                    </p>
                    {n.shipmentId?.exporterPin && (
                      <span className="text-xs font-mono mt-1 inline-block" style={{ color: "var(--accent-cyan)" }}>
                        PIN: {n.shipmentId.exporterPin}
                      </span>
                    )}
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {new Date(n.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                      style={{ background: "var(--accent-cyan)", boxShadow: "0 0 6px rgba(56,189,248,0.6)" }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
