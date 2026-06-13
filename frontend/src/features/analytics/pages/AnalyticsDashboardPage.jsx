// features/analytics/pages/AnalyticsDashboardPage.jsx
import { useNavigate } from "react-router-dom";
import Navbar from "../../../shared/components/Navbar";
import useAnalytics from "../hooks/useAnalytics";
import StatCard from "../components/StatCard";
import InsightCard from "../components/InsightCard";
import RouteVolumeChart from "../components/RouteVolumeChart";
import CargoPieChart from "../components/CargoPieChart";
import MonthlyTrendChart from "../components/MonthlyTrendChart";
import ScoreDistributionChart from "../components/ScoreDistributionChart";
import RiskLevelChart from "../components/RiskLevelChart";
import CostByCargoChart from "../components/CostByCargoChart";

export default function AnalyticsDashboardPage() {
  const navigate = useNavigate();
  const { insights, charts, loading, error, refreshing, handleRefresh } = useAnalytics();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Navbar>
        <div className="ml-auto flex items-center gap-3">
          <button className="btn-outline text-xs py-1.5 px-3" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
          <button className="btn-primary text-xs py-1.5 px-3" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? "Refreshing..." : "🔄 Refresh Analysis"}
          </button>
        </div>
      </Navbar>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 animate-fade-up">
          <h1 className="text-3xl font-black" style={{ fontFamily: "Syne,sans-serif", color: "var(--text-primary)" }}>
            Business Insights
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Data-driven analysis of your shipment history — powered by Pandas, NumPy &amp; Seaborn
          </p>
        </div>

        {loading && (
          <div className="card text-center py-12" style={{ color: "var(--text-muted)" }}>
            Loading analytics...
          </div>
        )}

        {!loading && error && (
          <div className="card text-center py-12" style={{ color: "var(--accent-amber)" }}>
            {error}
          </div>
        )}

        {!loading && !error && insights && charts && (
          <>
            {/* ── Top-line stats ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-up-2">
              <StatCard label="Total Shipments" value={insights.stats.totalShipments} accent="var(--accent-cyan)" />
              <StatCard label="Avg Compliance Score" value={insights.stats.avgComplianceScore} suffix="/100" accent="var(--accent-emerald)" />
              <StatCard label="High Risk Shipments" value={insights.stats.highRiskCount} accent="var(--accent-rose)" />
              <StatCard label="Avg Missing Docs" value={insights.stats.avgMissingDocs} accent="var(--accent-amber)" />
            </div>

            {/* ── Business Insights / Recommendations ── */}
            <div className="mb-6 animate-fade-up-2">
              <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>
                💡 AI Recommendations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.insights.map((ins, i) => (
                  <InsightCard key={i} insight={ins} />
                ))}
              </div>
            </div>

            {/* ── Charts grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                  Top Routes by Volume
                </h3>
                <RouteVolumeChart data={charts.routes} />
              </div>

              <div className="card">
                <h3 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                  Cargo Type Distribution
                </h3>
                <CargoPieChart data={charts.cargoTypes} />
              </div>

              <div className="card lg:col-span-2">
                <h3 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                  Monthly Shipment Volume &amp; Compliance Trend
                </h3>
                <MonthlyTrendChart data={charts.monthlyTrend} />
              </div>

              <div className="card">
                <h3 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                  Compliance Score Distribution
                </h3>
                <ScoreDistributionChart data={charts.scoreDistribution} />
              </div>

              <div className="card">
                <h3 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                  Risk Level Breakdown
                </h3>
                <RiskLevelChart data={charts.riskLevels} />
              </div>

              <div className="card lg:col-span-2">
                <h3 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                  Freight Cost Analysis by Cargo Type (Avg / Median)
                </h3>
                <CostByCargoChart data={charts.costByCargo} />
              </div>
            </div>

            <p className="text-xs mt-6 text-center" style={{ color: "var(--text-muted)" }}>
              Last generated: {new Date(insights.stats.generatedAt).toLocaleString()}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
