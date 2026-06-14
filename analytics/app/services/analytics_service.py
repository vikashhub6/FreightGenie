"""
app/services/analytics_service.py
Data access + Pandas analysis.

Production  → MONGO_URI set → MongoDB se data
Local Dev   → MONGO_URI nahi → CSV fallback
"""

import os
import json
import subprocess
import pandas as pd
from app.config.settings import settings
from app.config.database import get_db


# ─── Data Loading ───────────────────────────────────────

def load_dataframe():
    if settings.use_mongo:
        df = _load_from_mongo()
    else:
        df = _load_from_csv()

    if df is None or df.empty:
        return None

    date_col = "createdAt" if "createdAt" in df.columns else "date"
    df["date"] = pd.to_datetime(df.get(date_col), errors="coerce")
    df["complianceScore"] = pd.to_numeric(df.get("complianceScore"), errors="coerce")
    df["freightCost"] = pd.to_numeric(df.get("freightCost"), errors="coerce")
    df["month_year"] = df["date"].dt.to_period("M").astype(str)

    return df


def _load_from_mongo():
    try:
        db = get_db()
        if db is None:
            return None

        data = list(db[settings.MONGO_COLLECTION].find({"analytics": {"$exists": True}}, {"_id": 0}).sort("createdAt", -1).limit(100))
        if not data:
            return None

        rows = []
        for s in data:
            a = s.get("analytics") or {}
            row = {
                "shipmentId":      s.get("shipmentId", ""),
                "cargoType":       a.get("cargoType") or s.get("cargoType", "general"),
                "origin":          s.get("origin", ""),
                "destination":     s.get("destination", ""),
                "route":           a.get("route") or f"{s.get('origin','')} → {s.get('destination','')}",
                "shippingMode":    a.get("shippingMode") or s.get("shipmentInfo", {}).get("shippingMode", "sea"),
                "freightCost":     a.get("freightCost") or 0,
                "complianceScore": a.get("complianceScore") or s.get("complianceReport", {}).get("score") or 0,
                "riskLevel":       a.get("riskLevel") or s.get("complianceReport", {}).get("riskLevel", "low"),
                "missingDocsCount":a.get("missingDocsCount") or len(s.get("complianceReport", {}).get("missingDocs", [])),
                "createdAt":       s.get("createdAt", ""),
            }
            rows.append(row)

        return pd.DataFrame(rows)

    except Exception as e:
        print(f"MongoDB fetch failed: {e}")
        return None


def _load_from_csv():
    if not os.path.exists(settings.CSV_FILE):
        return None
    return pd.read_csv(settings.CSV_FILE)


# ─── Helpers ────────────────────────────────────────────

def data_available() -> bool:
    df = load_dataframe()
    return df is not None and not df.empty


def charts_generated() -> bool:
    return os.path.exists(settings.CHARTS_DIR) and len(os.listdir(settings.CHARTS_DIR)) > 0


# ─── Insights ───────────────────────────────────────────

def get_insights() -> dict:
    if not os.path.exists(settings.INSIGHTS_JSON):
        return None
    with open(settings.INSIGHTS_JSON) as f:
        return json.load(f)


def get_chart_path(filename: str):
    path = os.path.join(settings.CHARTS_DIR, filename)
    return path if os.path.exists(path) else None


# ─── Charts Data ────────────────────────────────────────

def get_charts_data() -> dict:
    df = load_dataframe()
    if df is None or df.empty:
        return None

    route_counts = df["route"].value_counts().head(8)
    routes = [{"route": r, "shipments": int(c)} for r, c in route_counts.items()]

    cargo_counts = df["cargoType"].value_counts()
    cargo_types = [{"name": c, "value": int(v)} for c, v in cargo_counts.items()]

    monthly = df.groupby("month_year").agg(
        shipments=("shipmentId", "count"),
        avgScore=("complianceScore", "mean"),
    ).reset_index().sort_values("month_year")
    monthly_trend = [
        {"month": row["month_year"], "shipments": int(row["shipments"]), "avgScore": round(float(row["avgScore"]), 1)}
        for _, row in monthly.iterrows()
    ]

    bins = [0, 50, 60, 70, 80, 90, 101]
    labels = ["0-49", "50-59", "60-69", "70-79", "80-89", "90-100"]
    df["scoreBucket"] = pd.cut(df["complianceScore"], bins=bins, labels=labels, right=False)
    score_dist = df["scoreBucket"].value_counts().reindex(labels, fill_value=0)
    score_distribution = [{"range": r, "count": int(c)} for r, c in score_dist.items()]

    risk_counts = df["riskLevel"].value_counts() if "riskLevel" in df.columns else pd.Series(dtype="object")
    risk_levels = [{"name": r, "value": int(v)} for r, v in risk_counts.items()]

    missing_counts = df["missingDocsCount"].value_counts().sort_index()
    missing_docs = [{"missingCount": str(int(k)), "shipments": int(v)} for k, v in missing_counts.items()]

    shipping_modes = []
    if "shippingMode" in df.columns:
        mode_counts = df["shippingMode"].value_counts()
        shipping_modes = [{"name": m, "value": int(v)} for m, v in mode_counts.items()]

    cost_by_cargo = (
        df.groupby("cargoType")["freightCost"]
        .agg(avg="mean", median="median", std="std")
        .round(2).reset_index()
        .rename(columns={"cargoType": "cargo"})
        .fillna(0).to_dict(orient="records")
    )

    return {
        "routes": routes,
        "cargoTypes": cargo_types,
        "monthlyTrend": monthly_trend,
        "scoreDistribution": score_distribution,
        "riskLevels": risk_levels,
        "missingDocs": missing_docs,
        "shippingModes": shipping_modes,
        "costByCargo": cost_by_cargo,
    }


# ─── Refresh ────────────────────────────────────────────

def run_refresh() -> tuple:
    if not data_available():
        return False, "No data found."
    try:
        result = subprocess.run(
            ["python", settings.ANALYSIS_SCRIPT],
            capture_output=True, text=True, timeout=120,
            cwd=os.path.dirname(settings.ANALYSIS_SCRIPT),
        )
        if result.returncode != 0:
            return False, f"Analysis failed: {result.stderr}"
        return True, "Analysis refreshed successfully"
    except subprocess.TimeoutExpired:
        return False, "Analysis timed out"
