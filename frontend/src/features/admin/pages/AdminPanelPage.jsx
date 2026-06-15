// features/admin/pages/AdminPanelPage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import api from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function AdminPanelPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [tab, setTab]                   = useState("pending"); // "pending" | "all"
  const [actionLoading, setActionLoading] = useState({});
  const [message, setMessage]           = useState("");

  // Sirf admin access kar sakta hai
  useEffect(() => {
    if (user && user.role !== "admin") navigate("/dashboard");
  }, [user, navigate]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        api.get("/admin/pending-users"),
        api.get("/admin/all-users"),
      ]);
      setPendingUsers(pendingRes.data);
      setAllUsers(allRes.data);
    } catch (err) {
      setMessage("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId, action) => {
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const res = await api.put(`/admin/${action}/${userId}`);
      setMessage(res.data.message);
      await fetchUsers();
    } catch (err) {
      setMessage(err.response?.data?.error || "Action failed");
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const statusBadge = (status) => {
    const colors = {
      active: "bg-green-500/20 text-green-400",
      pending: "bg-yellow-500/20 text-yellow-400",
      rejected: "bg-red-500/20 text-red-400",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${colors[status] || ""}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen p-6" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/dashboard")} className="text-sm" style={{ color: "var(--accent-cyan)" }}>
            ← Dashboard
          </button>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            🛡️ Admin Panel
          </h1>
        </div>

        {message && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
            style={{ background: "var(--bg-card)", border: "1px solid var(--accent-cyan)", color: "var(--accent-cyan)" }}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {["pending", "all"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: tab === t ? "var(--accent-cyan)" : "var(--bg-card)",
                color: tab === t ? "#0d1117" : "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
            >
              {t === "pending" ? `⏳ Pending (${pendingUsers.length})` : `👥 All Users (${allUsers.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>Loading...</div>
        ) : (
          <div className="space-y-3">
            {(tab === "pending" ? pendingUsers : allUsers).length === 0 ? (
              <div className="text-center py-12 rounded-xl" style={{ background: "var(--bg-card)", color: "var(--text-muted)" }}>
                {tab === "pending" ? "🎉 Koi pending request nahi hai!" : "Koi user nahi mila."}
              </div>
            ) : (
              (tab === "pending" ? pendingUsers : allUsers).map((u) => (
                <div key={u._id} className="p-4 rounded-xl flex items-center justify-between gap-4"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <div>
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{u.name}</p>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>{u.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      {statusBadge(u.status)}
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{u.role}</span>
                    </div>
                  </div>

                  {u.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleAction(u._id, "approve")}
                        disabled={actionLoading[u._id]}
                        className="px-4 py-1.5 rounded-lg text-sm font-semibold"
                        style={{ background: "#16a34a", color: "white" }}
                      >
                        {actionLoading[u._id] ? "..." : "✅ Approve"}
                      </button>
                      <button
                        onClick={() => handleAction(u._id, "reject")}
                        disabled={actionLoading[u._id]}
                        className="px-4 py-1.5 rounded-lg text-sm font-semibold"
                        style={{ background: "#dc2626", color: "white" }}
                      >
                        {actionLoading[u._id] ? "..." : "❌ Reject"}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
