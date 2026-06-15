"""
app/services/analytics_service.py
Data access + Pandas analysis + Seaborn charts → Cloudinary
"""

import os
import io
import json
import subprocess
import pandas as pd
import seaborn as sns
import matplotlib
matplotlib.use("Agg")  # GUI nahi chahiye server pe
import matplotlib.pyplot as plt
import cloudinary
import cloudinary.uploader
from app.config.settings import settings
from app.config.database import get_db

# ── Cloudinary Config ────────────────────────────────────────────
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
)

# ── Chart style ──────────────────────────────────────────────────
sns.set_theme(style="darkgrid", palette="muted")
plt.rcParams.update({
    "figure.facecolor": "#0B1929",
    "axes.facecolor":   "#0f2236",
    "axes.edgecolor":   "#1e3a5a",
    "text.color":       "#e2e8f0",
    "axes.labelcolor":  "#94a3b8",
    "xtick.color":      "#64748b",
    "ytick.color":      "#64748b",
    "grid.color":       "#1e3a5a",
})
ACCENT = ["#38bdf8","#6366f1","#34d399","#fbbf24","#fb7185","#f472b6","#a78bfa","#2dd4bf"]

# ── Cache — ek baar bana, memory mein rakho ──────────────────────
_chart_cache = {}  # { "company_id:chart_name": "cloudinary_url" }


def _upload_to_cloudinary(fig, public_id: str) -> str:
    """Matplotlib figure ko Cloudinary pe upload karo, URL return karo"""
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight", facecolor="#0B1929")
    buf.seek(0)
    plt.close(fig)
    result = cloudinary.uploader.upload(
        buf,
        public_id=public_id,
        overwrite=True,
        folder="freightgenie/charts",
        resource_type="image",
    )
    return result["secure_url"]


# ── Data Loading ─────────────────────────────────────────────────

def load_dataframe(company_id=None):
    if settings.use_mongo:
        df = _load_from_mongo(company_id=company_id)
    else:
        df = _load_from_csv()

    if df is None or df.empty:
        return None

    date_col = "createdAt" if "createdAt" in df.columns else "date"
    df["date"]            = pd.to_datetime(df.get(date_col), errors="coerce")
    df["complianceScore"] = pd.to_numeric(df.get("complianceScore"), errors="coerce")
    df["freightCost"]     = pd.to_numeric(df.get("freightCost"), errors="coerce")
    df["month_year"]      = df["date"].dt.to_period("M").astype(str)
    return df


def _load_from_mongo(company_id=None):
    try:
        db = get_db()
        if db is None:
            return None
        query = {"analytics": {"$exists": True}}
        if company_id:
            from bson import ObjectId
            try:
                query["companyId"] = ObjectId(company_id)
            except Exception:
                pass
        data = list(db[settings.MONGO_COLLECTION].find(query, {"_id": 0}).sort("createdAt", -1).limit(100))
        if not data:
            return None
        rows = []
        for s in data:
            a = s.get("analytics") or {}
            rows.append({
                "shipmentId":       s.get("shipmentId", ""),
                "cargoType":        a.get("cargoType") or s.get("cargoType", "general"),
                "origin":           s.get("origin", ""),
                "destination":      s.get("destination", ""),
                "route":            a.get("route") or f"{s.get('origin','')} → {s.get('destination','')}",
                "shippingMode":     a.get("shippingMode") or s.get("shipmentInfo", {}).get("shippingMode", "sea"),
                "freightCost":      a.get("freightCost") or 0,
                "complianceScore":  a.get("complianceScore") or s.get("complianceReport", {}).get("score") or 0,
                "riskLevel":        a.get("riskLevel") or s.get("complianceReport", {}).get("riskLevel", "low"),
                "missingDocsCount": a.get("missingDocsCount") or len(s.get("complianceReport", {}).get("missingDocs", [])),
                "createdAt":        s.get("createdAt", ""),
            })
        return pd.DataFrame(rows)
    except Exception as e:
        print(f"MongoDB fetch failed: {e}")
        return None


def _load_from_csv():
    if not os.path.exists(settings.CSV_FILE):
        return None
    return pd.read_csv(settings.CSV_FILE)


# ── Helpers ──────────────────────────────────────────────────────

def data_available() -> bool:
    df = load_dataframe()
    return df is not None and not df.empty

def charts_generated() -> bool:
    return len(_chart_cache) > 0


# ── Seaborn Charts → Cloudinary ──────────────────────────────────

def generate_charts(df, company_id: str = "default") -> dict:
    """Seaborn se charts banao aur Cloudinary pe upload karo. URLs return karo."""
    urls = {}
    prefix = company_id or "default"

    # ── Chart 1: Route Analysis ──────────────────────────────────
    cache_key = f"{prefix}:routes"
    if cache_key not in _chart_cache:
        route_counts = df["route"].value_counts().head(10)
        fig, ax = plt.subplots(figsize=(10, 5))
        bars = ax.barh(route_counts.index, route_counts.values, color=ACCENT[:len(route_counts)])
        ax.set_title("Top Routes by Shipment Volume", fontsize=14, fontweight="bold", color="#e2e8f0", pad=12)
        ax.set_xlabel("Number of Shipments")
        for bar, val in zip(bars, route_counts.values):
            ax.text(bar.get_width() + 0.1, bar.get_y() + bar.get_height()/2, str(val), va="center", color="#94a3b8", fontsize=9)
        plt.tight_layout()
        _chart_cache[cache_key] = _upload_to_cloudinary(fig, f"{prefix}_01_route_analysis")
    urls["routes"] = _chart_cache[cache_key]

    # ── Chart 2: Cargo Type ──────────────────────────────────────
    cache_key = f"{prefix}:cargo"
    if cache_key not in _chart_cache:
        cargo_counts = df["cargoType"].value_counts()
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
        ax1.pie(cargo_counts.values, labels=cargo_counts.index, autopct="%1.1f%%",
                colors=ACCENT[:len(cargo_counts)], startangle=140,
                textprops={"color": "#e2e8f0", "fontsize": 9})
        ax1.set_title("Cargo Type Distribution", fontsize=13, fontweight="bold", color="#e2e8f0")
        ax2.bar(cargo_counts.index, cargo_counts.values, color=ACCENT[:len(cargo_counts)])
        ax2.set_title("Cargo Type Volume", fontsize=13, fontweight="bold", color="#e2e8f0")
        plt.xticks(rotation=30, ha="right")
        plt.tight_layout()
        _chart_cache[cache_key] = _upload_to_cloudinary(fig, f"{prefix}_02_cargo_type")
    urls["cargo"] = _chart_cache[cache_key]

    # ── Chart 3: Monthly Trend ───────────────────────────────────
    cache_key = f"{prefix}:monthly"
    if cache_key not in _chart_cache:
        monthly = df.groupby("month_year").agg(
            shipments=("shipmentId", "count"),
            avg_score=("complianceScore", "mean")
        ).reset_index()
        fig, ax1 = plt.subplots(figsize=(11, 5))
        ax2 = ax1.twinx()
        ax1.fill_between(monthly["month_year"], monthly["shipments"], alpha=0.3, color="#38bdf8")
        ax1.plot(monthly["month_year"], monthly["shipments"], "o-", color="#38bdf8", linewidth=2, markersize=6, label="Shipments")
        ax2.plot(monthly["month_year"], monthly["avg_score"], "s--", color="#34d399", linewidth=2, markersize=6, label="Avg Score")
        ax1.set_title("Monthly Shipment Volume & Compliance Score", fontsize=13, fontweight="bold", color="#e2e8f0", pad=12)
        ax1.set_xlabel("Month"); ax1.set_ylabel("Shipments", color="#38bdf8")
        ax2.set_ylabel("Avg Compliance Score", color="#34d399")
        plt.xticks(rotation=30, ha="right")
        lines1, labels1 = ax1.get_legend_handles_labels()
        lines2, labels2 = ax2.get_legend_handles_labels()
        ax1.legend(lines1+lines2, labels1+labels2, loc="upper left")
        plt.tight_layout()
        _chart_cache[cache_key] = _upload_to_cloudinary(fig, f"{prefix}_03_monthly_trend")
    urls["monthly"] = _chart_cache[cache_key]

    # ── Chart 4: Compliance Score ────────────────────────────────
    cache_key = f"{prefix}:compliance"
    if cache_key not in _chart_cache:
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
        ax1.hist(df["complianceScore"].dropna(), bins=20, color="#6366f1", alpha=0.8, edgecolor="#1e3a5a")
        ax1.axvline(df["complianceScore"].mean(), color="#fbbf24", linestyle="--", linewidth=2, label=f'Mean: {df["complianceScore"].mean():.1f}')
        ax1.axvline(df["complianceScore"].median(), color="#34d399", linestyle="--", linewidth=2, label=f'Median: {df["complianceScore"].median():.1f}')
        ax1.set_title("Compliance Score Distribution", fontsize=13, fontweight="bold", color="#e2e8f0")
        ax1.set_xlabel("Score"); ax1.set_ylabel("Frequency"); ax1.legend()
        if "riskLevel" in df.columns:
            risk_order = ["low","medium","high"]
            risk_data  = [df[df["riskLevel"]==r]["complianceScore"].dropna() for r in risk_order]
            bp = ax2.boxplot(risk_data, tick_labels=risk_order, patch_artist=True)
            for patch, color in zip(bp["boxes"], ["#34d399","#fbbf24","#fb7185"]):
                patch.set_facecolor(color); patch.set_alpha(0.7)
            ax2.set_title("Score by Risk Level", fontsize=13, fontweight="bold", color="#e2e8f0")
        plt.tight_layout()
        _chart_cache[cache_key] = _upload_to_cloudinary(fig, f"{prefix}_04_compliance_score")
    urls["compliance"] = _chart_cache[cache_key]

    # ── Chart 5: Missing Docs ────────────────────────────────────
    cache_key = f"{prefix}:missing"
    if cache_key not in _chart_cache:
        risk_counts  = df["riskLevel"].value_counts()
        missing_avg  = df.groupby("cargoType")["missingDocsCount"].mean().sort_values(ascending=False)
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
        colors_risk = {"low": "#34d399", "medium": "#fbbf24", "high": "#fb7185"}
        bar_colors  = [colors_risk.get(r, "#94a3b8") for r in risk_counts.index]
        ax1.bar(risk_counts.index, risk_counts.values, color=bar_colors, alpha=0.85)
        ax1.set_title("Shipments by Risk Level", fontsize=13, fontweight="bold", color="#e2e8f0")
        ax2.barh(missing_avg.index, missing_avg.values, color=ACCENT[:len(missing_avg)])
        ax2.set_title("Avg Missing Docs by Cargo Type", fontsize=13, fontweight="bold", color="#e2e8f0")
        plt.tight_layout()
        _chart_cache[cache_key] = _upload_to_cloudinary(fig, f"{prefix}_05_missing_docs")
    urls["missing"] = _chart_cache[cache_key]

    # ── Chart 6: Shipping Mode ───────────────────────────────────
    cache_key = f"{prefix}:shipping"
    if cache_key not in _chart_cache:
        mode_counts = df["shippingMode"].value_counts()
        fig, ax = plt.subplots(figsize=(8, 5))
        bars = ax.bar(mode_counts.index, mode_counts.values, color=ACCENT[:len(mode_counts)], alpha=0.85, width=0.5)
        ax.set_title("Shipments by Shipping Mode", fontsize=13, fontweight="bold", color="#e2e8f0", pad=12)
        ax.set_xlabel("Mode"); ax.set_ylabel("Shipments")
        for bar, val in zip(bars, mode_counts.values):
            ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1, str(val), ha="center", color="#94a3b8")
        plt.tight_layout()
        _chart_cache[cache_key] = _upload_to_cloudinary(fig, f"{prefix}_06_shipping_mode")
    urls["shipping"] = _chart_cache[cache_key]

    return urls


# ── Insights ─────────────────────────────────────────────────────

def get_insights() -> dict:
    if not os.path.exists(settings.INSIGHTS_JSON):
        return None
    with open(settings.INSIGHTS_JSON) as f:
        return json.load(f)


# ── Charts Data (Seaborn → Cloudinary URLs) ──────────────────────

def get_charts_data(company_id=None) -> dict:
    df = load_dataframe(company_id=company_id)
    if df is None or df.empty:
        return None

    # Seaborn charts banao aur Cloudinary URLs lo
    chart_urls = generate_charts(df, company_id=company_id or "default")

    # Stats bhi return karo
    route_counts = df["route"].value_counts().head(1)
    cargo_counts = df["cargoType"].value_counts().head(1)
    risk_counts  = df["riskLevel"].value_counts() if "riskLevel" in df.columns else {}

    stats = {
        "totalShipments":     int(len(df)),
        "avgComplianceScore": round(float(df["complianceScore"].mean()), 1),
        "highRiskCount":      int(risk_counts.get("high", 0)),
        "avgMissingDocs":     round(float(df["missingDocsCount"].mean()), 1),
        "topRoute":           route_counts.index[0] if len(route_counts) else "—",
        "topCargo":           cargo_counts.index[0] if len(cargo_counts) else "—",
    }

    return {
        "chartUrls": chart_urls,
        "stats": stats,
    }


# ── Refresh ───────────────────────────────────────────────────────

def run_refresh(company_id=None) -> tuple:
    # Cache clear karo taaki naye charts banen
    prefix = company_id or "default"
    keys_to_delete = [k for k in _chart_cache if k.startswith(prefix)]
    for k in keys_to_delete:
        del _chart_cache[k]

    df = load_dataframe(company_id=company_id)
    if df is None or df.empty:
        return False, "No data found."
    try:
        generate_charts(df, company_id=prefix)
        return True, "Charts refreshed successfully"
    except Exception as e:
        return False, str(e)
