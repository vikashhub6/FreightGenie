"""
FreightGenie — Phase 2 Data Analytics
Run: python3 analysis.py
Generates: charts/ folder + insights.json
"""

import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import json
import os
from datetime import datetime
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

# ── Config (all overridable via analytics/.env) ────────────────────
CSV_FILE    = os.path.join(BASE_DIR, os.environ.get("ANALYTICS_CSV_PATH", "../backend/analytics/shipment_analytics.csv"))
CHARTS_DIR  = os.path.join(BASE_DIR, os.environ.get("ANALYTICS_CHARTS_DIR", "charts"))
OUTPUT_JSON = os.path.join(BASE_DIR, os.environ.get("ANALYTICS_INSIGHTS_FILE", "insights.json"))

os.makedirs(CHARTS_DIR, exist_ok=True)

sns.set_theme(style="darkgrid", palette="muted")
plt.rcParams.update({"figure.facecolor": "#0B1929", "axes.facecolor": "#0f2236",
                     "axes.edgecolor": "#1e3a5a", "text.color": "#e2e8f0",
                     "axes.labelcolor": "#94a3b8", "xtick.color": "#64748b",
                     "ytick.color": "#64748b", "grid.color": "#1e3a5a"})

ACCENT = ["#38bdf8","#6366f1","#34d399","#fbbf24","#fb7185","#f472b6","#a78bfa","#2dd4bf"]

def load_data():
    if not os.path.exists(CSV_FILE):
        print(f"❌ CSV not found: {CSV_FILE}")
        print("   Run the app and complete some shipments first.")
        exit(1)
    df = pd.read_csv(CSV_FILE)
    df["date"]            = pd.to_datetime(df["date"], errors="coerce")
    df["complianceScore"] = pd.to_numeric(df["complianceScore"], errors="coerce")
    df["month_year"]      = df["date"].dt.to_period("M").astype(str)
    print(f"✅ Loaded {len(df)} shipments")
    return df

# ── Chart 1: Route Analysis ───────────────────────────────────────
def chart_route_analysis(df):
    route_counts = df["route"].value_counts().head(10)
    fig, ax = plt.subplots(figsize=(10, 5))
    bars = ax.barh(route_counts.index, route_counts.values, color=ACCENT[:len(route_counts)])
    ax.set_title("Top Routes by Shipment Volume", fontsize=14, fontweight="bold", color="#e2e8f0", pad=12)
    ax.set_xlabel("Number of Shipments")
    for bar, val in zip(bars, route_counts.values):
        ax.text(bar.get_width() + 0.1, bar.get_y() + bar.get_height()/2,
                str(val), va="center", color="#94a3b8", fontsize=9)
    plt.tight_layout()
    path = f"{CHARTS_DIR}/01_route_analysis.png"
    plt.savefig(path, dpi=150, bbox_inches="tight", facecolor="#0B1929")
    plt.close()
    print(f"  📊 {path}")
    return route_counts.to_dict()

# ── Chart 2: Cargo Type Distribution ─────────────────────────────
def chart_cargo_type(df):
    cargo_counts = df["cargoType"].value_counts()
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    # Pie
    wedges, texts, autotexts = ax1.pie(cargo_counts.values, labels=cargo_counts.index,
        autopct="%1.1f%%", colors=ACCENT[:len(cargo_counts)], startangle=140,
        textprops={"color": "#e2e8f0", "fontsize": 9})
    ax1.set_title("Cargo Type Distribution", fontsize=13, fontweight="bold", color="#e2e8f0")
    # Bar
    ax2.bar(cargo_counts.index, cargo_counts.values, color=ACCENT[:len(cargo_counts)])
    ax2.set_title("Cargo Type Volume", fontsize=13, fontweight="bold", color="#e2e8f0")
    ax2.set_xlabel("Cargo Type"); ax2.set_ylabel("Shipments")
    plt.xticks(rotation=30, ha="right")
    plt.tight_layout()
    path = f"{CHARTS_DIR}/02_cargo_type.png"
    plt.savefig(path, dpi=150, bbox_inches="tight", facecolor="#0B1929")
    plt.close()
    print(f"  📊 {path}")
    return cargo_counts.to_dict()

# ── Chart 3: Monthly Volume Trend ────────────────────────────────
def chart_monthly_trend(df):
    monthly = df.groupby("month_year").agg(
        shipments=("shipmentId", "count"),
        avg_score=("complianceScore", "mean")
    ).reset_index()
    fig, ax1 = plt.subplots(figsize=(11, 5))
    ax2 = ax1.twinx()
    ax1.fill_between(monthly["month_year"], monthly["shipments"], alpha=0.3, color="#38bdf8")
    ax1.plot(monthly["month_year"], monthly["shipments"], "o-", color="#38bdf8", linewidth=2, markersize=6, label="Shipments")
    ax2.plot(monthly["month_year"], monthly["avg_score"], "s--", color="#34d399", linewidth=2, markersize=6, label="Avg Score")
    ax1.set_title("Monthly Shipment Volume & Compliance Score Trend", fontsize=13, fontweight="bold", color="#e2e8f0", pad=12)
    ax1.set_xlabel("Month"); ax1.set_ylabel("Shipments", color="#38bdf8")
    ax2.set_ylabel("Avg Compliance Score", color="#34d399")
    plt.xticks(rotation=30, ha="right")
    lines1, labels1 = ax1.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax1.legend(lines1+lines2, labels1+labels2, loc="upper left")
    plt.tight_layout()
    path = f"{CHARTS_DIR}/03_monthly_trend.png"
    plt.savefig(path, dpi=150, bbox_inches="tight", facecolor="#0B1929")
    plt.close()
    print(f"  📊 {path}")
    return monthly.to_dict(orient="records")

# ── Chart 4: Compliance Score Distribution ───────────────────────
def chart_compliance_score(df):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    # Histogram
    ax1.hist(df["complianceScore"].dropna(), bins=20, color="#6366f1", alpha=0.8, edgecolor="#1e3a5a")
    ax1.axvline(df["complianceScore"].mean(), color="#fbbf24", linestyle="--", linewidth=2, label=f'Mean: {df["complianceScore"].mean():.1f}')
    ax1.axvline(df["complianceScore"].median(), color="#34d399", linestyle="--", linewidth=2, label=f'Median: {df["complianceScore"].median():.1f}')
    ax1.set_title("Compliance Score Distribution", fontsize=13, fontweight="bold", color="#e2e8f0")
    ax1.set_xlabel("Score"); ax1.set_ylabel("Frequency")
    ax1.legend()
    # Boxplot by risk
    if "riskLevel" in df.columns:
        risk_order = ["low","medium","high"]
        risk_data  = [df[df["riskLevel"]==r]["complianceScore"].dropna() for r in risk_order]
        bp = ax2.boxplot(risk_data, labels=risk_order, patch_artist=True)
        for patch, color in zip(bp["boxes"], ["#34d399","#fbbf24","#fb7185"]):
            patch.set_facecolor(color); patch.set_alpha(0.7)
        ax2.set_title("Score by Risk Level", fontsize=13, fontweight="bold", color="#e2e8f0")
        ax2.set_xlabel("Risk Level"); ax2.set_ylabel("Compliance Score")
    plt.tight_layout()
    path = f"{CHARTS_DIR}/04_compliance_score.png"
    plt.savefig(path, dpi=150, bbox_inches="tight", facecolor="#0B1929")
    plt.close()
    print(f"  📊 {path}")

# ── Chart 5: Missing Documents Pattern ───────────────────────────
def chart_missing_docs(df):
    risk_counts = df["riskLevel"].value_counts()
    missing_avg = df.groupby("cargoType")["missingDocsCount"].mean().sort_values(ascending=False)
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    colors_risk = {"low": "#34d399", "medium": "#fbbf24", "high": "#fb7185"}
    bar_colors  = [colors_risk.get(r, "#94a3b8") for r in risk_counts.index]
    ax1.bar(risk_counts.index, risk_counts.values, color=bar_colors, alpha=0.85)
    ax1.set_title("Shipments by Risk Level", fontsize=13, fontweight="bold", color="#e2e8f0")
    ax1.set_xlabel("Risk Level"); ax1.set_ylabel("Count")
    for i, (idx, val) in enumerate(risk_counts.items()):
        ax1.text(i, val + 0.1, str(val), ha="center", color="#94a3b8")
    ax2.barh(missing_avg.index, missing_avg.values, color=ACCENT[:len(missing_avg)])
    ax2.set_title("Avg Missing Docs by Cargo Type", fontsize=13, fontweight="bold", color="#e2e8f0")
    ax2.set_xlabel("Avg Missing Documents")
    plt.tight_layout()
    path = f"{CHARTS_DIR}/05_missing_docs.png"
    plt.savefig(path, dpi=150, bbox_inches="tight", facecolor="#0B1929")
    plt.close()
    print(f"  📊 {path}")
    return risk_counts.to_dict()

# ── Chart 6: Shipping Mode Analysis ──────────────────────────────
def chart_shipping_mode(df):
    mode_counts = df["shippingMode"].value_counts()
    fig, ax = plt.subplots(figsize=(8, 5))
    bars = ax.bar(mode_counts.index, mode_counts.values, color=ACCENT[:len(mode_counts)], alpha=0.85, width=0.5)
    ax.set_title("Shipments by Shipping Mode", fontsize=13, fontweight="bold", color="#e2e8f0", pad=12)
    ax.set_xlabel("Mode"); ax.set_ylabel("Shipments")
    for bar, val in zip(bars, mode_counts.values):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1, str(val), ha="center", color="#94a3b8")
    plt.tight_layout()
    path = f"{CHARTS_DIR}/06_shipping_mode.png"
    plt.savefig(path, dpi=150, bbox_inches="tight", facecolor="#0B1929")
    plt.close()
    print(f"  📊 {path}")
    return mode_counts.to_dict()

# ── Business Insights Generator ──────────────────────────────────
def generate_insights(df, route_data, cargo_data, risk_data):
    insights = []
    total = len(df)

    # Top route
    if route_data:
        top_route = list(route_data.keys())[0]
        top_pct   = round(list(route_data.values())[0] / total * 100, 1)
        insights.append({
            "type": "growth",
            "title": f"Top Route: {top_route}",
            "detail": f"{top_pct}% of all shipments. Consider dedicated team or preferred carrier for this route.",
            "action": "Negotiate volume discounts with carriers on this route"
        })

    # Top cargo
    if cargo_data:
        top_cargo = list(cargo_data.keys())[0]
        top_c_pct = round(list(cargo_data.values())[0] / total * 100, 1)
        insights.append({
            "type": "cargo",
            "title": f"Dominant Cargo: {top_cargo}",
            "detail": f"{top_c_pct}% of shipments are {top_cargo}. Specialization opportunity.",
            "action": f"Develop specialized compliance templates for {top_cargo} cargo"
        })

    # Avg score
    avg_score = df["complianceScore"].mean()
    if avg_score < 70:
        insights.append({
            "type": "warning",
            "title": f"Low Average Compliance Score: {avg_score:.1f}/100",
            "detail": "Average score below 70 indicates systemic document issues.",
            "action": "Create exporter training program for common document errors"
        })
    else:
        insights.append({
            "type": "success",
            "title": f"Good Compliance Average: {avg_score:.1f}/100",
            "detail": "Strong document compliance across shipments.",
            "action": "Maintain current compliance process; target 85+"
        })

    # High risk
    high_risk_count = risk_data.get("high", 0)
    high_risk_pct   = round(high_risk_count / total * 100, 1) if total else 0
    if high_risk_pct > 20:
        insights.append({
            "type": "warning",
            "title": f"High Risk Alert: {high_risk_pct}% shipments are HIGH RISK",
            "detail": f"{high_risk_count} shipments flagged high risk — compliance action required.",
            "action": "Immediate review of high-risk shipments; contact exporters for missing docs"
        })

    # Missing docs
    avg_missing = df["missingDocsCount"].mean()
    if avg_missing > 1.5:
        insights.append({
            "type": "warning",
            "title": f"Document Submission Gap: avg {avg_missing:.1f} docs missing per shipment",
            "detail": "Exporters consistently submitting incomplete document sets.",
            "action": "Send pre-shipment document checklist to exporters 7 days in advance"
        })

    # Stats summary
    stats = {
        "totalShipments":    int(total),
        "avgComplianceScore": round(float(avg_score), 1),
        "highRiskCount":     int(high_risk_count),
        "avgMissingDocs":    round(float(avg_missing), 1),
        "topRoute":          list(route_data.keys())[0] if route_data else "—",
        "topCargo":          list(cargo_data.keys())[0] if cargo_data else "—",
        "generatedAt":       datetime.now().isoformat(),
    }

    return {"insights": insights, "stats": stats}

# ── MAIN ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n🚀 FreightGenie Analytics Starting...\n")
    df = load_data()

    print("\n📊 Generating charts...")
    route_data = chart_route_analysis(df)
    cargo_data = chart_cargo_type(df)
    chart_monthly_trend(df)
    chart_compliance_score(df)
    risk_data  = chart_missing_docs(df)
    chart_shipping_mode(df)

    print("\n💡 Generating business insights...")
    result = generate_insights(df, route_data, cargo_data, risk_data)

    with open(OUTPUT_JSON, "w") as f:
        json.dump(result, f, indent=2)

    print(f"\n✅ insights.json saved")
    print(f"\n📈 KEY STATS:")
    for k, v in result["stats"].items():
        print(f"   {k}: {v}")

    print(f"\n💡 BUSINESS INSIGHTS:")
    for ins in result["insights"]:
        print(f"\n  [{ins['type'].upper()}] {ins['title']}")
        print(f"  → {ins['action']}")

    print(f"\n✅ All done! Charts in: {CHARTS_DIR}/\n")
