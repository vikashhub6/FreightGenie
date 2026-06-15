// features/analytics/pages/AnalyticsDashboardPage.jsx

import { useNavigate } from "react-router-dom";
import Navbar from "../../../shared/components/Navbar";
import useAnalytics from "../hooks/useAnalytics";
import StatCard from "../components/StatCard";
import InsightCard from "../components/InsightCard";

const CHART_KEYS = [
  { key: "routes",     title: "Top Routes by Volume" },
  { key: "cargo",      title: "Cargo Type Distribution" },
  { key: "monthly",    title: "Monthly Trend & Compliance", wide: true },
  { key: "compliance", title: "Compliance Score Distribution" },
  { key: "missing",    title: "Missing Documents & Risk" },
  { key: "shipping",   title: "Shipping Mode Analysis" },
];

export default function AnalyticsDashboardPage() {
  const navigate = useNavigate();
  const { insights, loading, error, refreshing, handleRefresh } = useAnalytics();

  const stats     = insights?.stats     || { totalShipments: 0, avgComplianceScore: 0, highRiskCount: 0, avgMissingDocs: 0 };
  const chartUrls = insights?.chartUrls || {};

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-4 flex gap-3">
        <button className="btn-outline text-xs py-1.5 px-3" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <button className="btn-primary text-xs py-1.5 px-3" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? "Refreshing..." : "🔄 Refresh Analysis"}
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Heading */}
        <div className="mb-6 animate-fade-up">
          <h1 className="text-3xl font-black" style={{ fontFamily: "Syne,sans-serif", color: "var(--text-primary)" }}>
            Business Insights
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Data-driven analysis — powered by Pandas, NumPy & Seaborn
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="card text-center py-12" style={{ color: "var(--text-muted)" }}>
            Loading analytics...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="card text-center py-12" style={{ color: "var(--accent-amber)" }}>
            {error}
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && insights && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-up-2">
              <StatCard label="Total Shipments"      value={stats.totalShipments}     accent="var(--accent-cyan)" />
              <StatCard label="Avg Compliance Score" value={stats.avgComplianceScore} suffix="/100" accent="var(--accent-emerald)" />
              <StatCard label="High Risk Shipments"  value={stats.highRiskCount}      accent="var(--accent-rose)" />
              <StatCard label="Avg Missing Docs"     value={stats.avgMissingDocs}     accent="var(--accent-amber)" />
            </div>

            {/* AI Recommendations */}
            <div className="mb-6 animate-fade-up-2">
              <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>
                💡 AI Recommendations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(insights?.insights || []).map((ins, i) => (
                  <InsightCard key={i} insight={ins} />
                ))}
              </div>
            </div>

            {/* Seaborn Charts from Cloudinary */}
            <div className="animate-fade-up-2">
              <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>
                📊 Charts
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {CHART_KEYS.map(({ key, title, wide }) => (
                  chartUrls[key] ? (
                    <div key={key} className="card" style={wide ? { gridColumn: "1 / -1" } : {}}>
                      <h3 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                        {title}
                      </h3>
                      <img
                        src={chartUrls[key]}
                        alt={title}
                        style={{ width: "100%", borderRadius: "8px" }}
                      />
                    </div>
                  ) : null
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
