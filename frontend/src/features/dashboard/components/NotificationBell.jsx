// features/dashboard/components/NotificationBell.js
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useNotifications from "../hooks/useNotifications";

const TYPE_ICON = {
  docs_uploaded: "📄",
  ai_done: "🤖",
  missing_docs: "⚠️",
  expiry_alert: "⏰",
};


const NotificationBell = ({ userId }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(userId);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = async (notif) => {
    if (!notif.read) await markRead(notif._id);
    setOpen(false);
    navigate(`/shipment/${notif.shipmentId}`);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "relative",
          width: 36, height: 36,
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.04)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
          transition: "all 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            background: "#ef4444", color: "white",
            fontSize: 10, fontWeight: 700,
            width: 16, height: 16, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #0a0f1e",
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: 44, right: 0, width: 340, zIndex: 100,
          background: "#111827",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, color: "#f1f5f9", fontSize: 14 }}>
              Notifications {unreadCount > 0 && <span style={{ color: "#60a5fa", fontSize: 12 }}>({unreadCount} new)</span>}
            </span>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                style={{ fontSize: 11, color: "#60a5fa", cursor: "pointer", background: "none", border: "none" }}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#64748b", fontSize: 13 }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n._id}
                  onClick={() => handleClick(n)}
                  style={{
                    display: "flex", gap: 12, alignItems: "flex-start",
                    padding: "12px 16px", cursor: "pointer",
                    background: n.read ? "transparent" : "rgba(59,130,246,0.06)",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = n.read ? "transparent" : "rgba(59,130,246,0.06)"}
                >
                  <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>
                    {TYPE_ICON[n.type] || "🔔"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 13, color: n.read ? "#94a3b8" : "#e2e8f0",
                      margin: 0, lineHeight: 1.4,
                    }}>
                      {n.message}
                    </p>
                    <p style={{ fontSize: 11, color: "#475569", marginTop: 3 }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!n.read && (
                    <div style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: "#3b82f6", flexShrink: 0, marginTop: 5,
                    }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
