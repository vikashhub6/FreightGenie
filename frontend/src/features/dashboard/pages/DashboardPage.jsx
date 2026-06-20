import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../auth/hooks/useAuth";
import useShipments from "../hooks/useShipments";
import StatsBar from "../components/StatsBar";
import ShipmentCard from "../components/ShipmentCard";
import Navbar from "../../../shared/components/Navbar";
import NotificationBell from "../components/NotificationBell";
import WorkspaceTab from "../components/WorkspaceTab";
import NotificationsTab from "../components/NotificationsTab";

const TABS = [
  { id: "Shipments",     icon: "🚢" },
  { id: "Workspace",     icon: "🔍" },
  { id: "Notifications", icon: "🔔" },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const { shipments, loading, stats } = useShipments();
  const [activeTab, setActiveTab]     = useState("Shipments");

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(circle at 15% 0%, rgba(14,165,233,0.12), transparent 40%), radial-gradient(circle at 85% 15%, rgba(99,102,241,0.12), transparent 40%), var(--bg-primary)",
      }}
    >
      <Navbar>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm hidden sm:block" style={{ color: "var(--text-muted)" }}>
            {user?.companyName || user?.company || user?.name}
          </span>
          <NotificationBell userId={user?._id || user?.id} />
          {user?.role === "admin" && (
            <button
              className="text-xs py-1.5 px-3 rounded-lg transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "var(--text-primary)",
              }}
              onClick={() => navigate("/admin")}
            >
              🛡️ Admin
            </button>
          )}
          <button
            className="text-xs py-1.5 px-3 rounded-lg transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "var(--text-primary)",
            }}
            onClick={() => navigate("/profile")}
          >
            ⚙ Profile
          </button>
          <button
            className="text-xs py-1.5 px-3 rounded-lg transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "var(--text-primary)",
            }}
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </Navbar>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 animate-fade-up">
          <div>
            <h1 className="text-3xl font-black" style={{ fontFamily: "Syne,sans-serif", color: "var(--text-primary)" }}>
              Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="animate-fade-up px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.14)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
                color: "var(--text-primary)",
              }}
              onClick={() => navigate("/analytics")}
            >
              📊 Business Insights
            </button>
            <button
              className="animate-fade-up px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, rgba(14,165,233,0.9), rgba(99,102,241,0.9))",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.25)",
                boxShadow: "0 8px 24px rgba(14,165,233,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
                color: "#fff",
              }}
              onClick={() => navigate("/shipment/create")}
            >
              + New Shipment
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div
          className="flex gap-1 mb-6 p-1.5 rounded-2xl w-fit animate-fade-up-2"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={activeTab === tab.id
                ? {
                    background: "linear-gradient(135deg, rgba(14,165,233,0.95), rgba(99,102,241,0.95))",
                    color: "#fff",
                    boxShadow: "0 4px 16px rgba(14,165,233,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }
                : { color: "var(--text-muted)", border: "1px solid transparent" }
              }>
              <span>{tab.icon}</span>
              <span>{tab.id}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "Shipments" && (
          <div>
            <div className="animate-fade-up-2">
              <StatsBar stats={stats} />
            </div>
            <div
              className="animate-fade-up-3 rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.045)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-bold text-lg" style={{ fontFamily: "Syne,sans-serif", color: "var(--text-primary)" }}>
                  All Shipments
                </h2>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{shipments.length} total</span>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-16 gap-3" style={{ color: "var(--text-muted)" }}>
                  <div className="w-5 h-5 border-2 border-slate-700 border-t-cyan-400 rounded-full animate-spin" />
                  Loading shipments...
                </div>
              ) : shipments.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4 opacity-20">📦</div>
                  <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>No shipments yet. Create your first one!</p>
                  <button
                    className="px-4 py-2 rounded-xl text-sm font-semibold"
                    style={{
                      background: "linear-gradient(135deg, rgba(14,165,233,0.9), rgba(99,102,241,0.9))",
                      boxShadow: "0 8px 24px rgba(14,165,233,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      color: "#fff",
                    }}
                    onClick={() => navigate("/shipment/create")}
                  >
                    Create First Shipment
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {shipments.map((s, i) => (
                    <div
                      key={s._id}
                      style={{
                        animationDelay: `${i * 0.05}s`,
                        background: "rgba(255,255,255,0.035)",
                        backdropFilter: "blur(14px)",
                        WebkitBackdropFilter: "blur(14px)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "14px",
                        boxShadow: "0 6px 18px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)",
                      }}
                      className="animate-fade-up"
                    >
                      <ShipmentCard shipment={s} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "Workspace"     && <WorkspaceTab />}
        {activeTab === "Notifications" && <NotificationsTab />}
      </div>
    </div>
  );
}
