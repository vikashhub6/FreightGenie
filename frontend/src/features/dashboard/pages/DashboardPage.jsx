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
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Navbar>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm hidden sm:block" style={{ color: "var(--text-muted)" }}>
            {user?.company || user?.name}
          </span>
          <NotificationBell userId={user?._id || user?.id} />
          <button className="btn-outline text-xs py-1.5 px-3" onClick={() => navigate("/profile")}>⚙ Profile</button>
          <button className="btn-outline text-xs py-1.5 px-3" onClick={logout}>Logout</button>
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
          <button className="btn-primary animate-fade-up" onClick={() => navigate("/shipment/create")}>
            + New Shipment
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit animate-fade-up-2"
          style={{ background: "rgba(0,0,0,0.4)", border: "1px solid var(--border)" }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={activeTab === tab.id
                ? { background: "linear-gradient(135deg,#0ea5e9,#6366f1)", color: "#fff", boxShadow: "0 4px 16px rgba(14,165,233,0.3)" }
                : { color: "var(--text-muted)" }
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
            <div className="card animate-fade-up-3">
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
                  <button className="btn-primary" onClick={() => navigate("/shipment/create")}>Create First Shipment</button>
                </div>
              ) : (
                <div className="space-y-2">
                  {shipments.map((s, i) => (
                    <div key={s._id} style={{ animationDelay: `${i * 0.05}s` }} className="animate-fade-up">
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
