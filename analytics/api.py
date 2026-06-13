import os, json, subprocess, math
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

CSV_FILE      = os.path.join(BASE_DIR, os.environ.get("ANALYTICS_CSV_PATH", "../backend/analytics/shipment_analytics.csv"))
CHARTS_DIR    = os.path.join(BASE_DIR, os.environ.get("ANALYTICS_CHARTS_DIR", "charts"))
INSIGHTS_JSON = os.path.join(BASE_DIR, os.environ.get("ANALYTICS_INSIGHTS_FILE", "insights.json"))
ANALYSIS_SCRIPT = os.path.join(BASE_DIR, "analysis.py")
PORT = int(os.environ.get("ANALYTICS_PORT", 5500))
CORS_ORIGIN = os.environ.get("ANALYTICS_CORS_ORIGIN", "*")
DEBUG = os.environ.get("ANALYTICS_DEBUG", "true").lower() == "true"

app = FastAPI(title="FreightGenie Analytics API")

origins = [o.strip() for o in CORS_ORIGIN.split(",")] if CORS_ORIGIN != "*" else ["*"]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=False, allow_methods=["*"], allow_headers=["*"])

def clean_nan(obj):
    if isinstance(obj, float) and math.isnan(obj): return None
    if isinstance(obj, dict): return {k: clean_nan(v) for k, v in obj.items()}
    if isinstance(obj, list): return [clean_nan(i) for i in obj]
    return obj

def load_df():
    if not os.path.exists(CSV_FILE): return None
    df = pd.read_csv(CSV_FILE)
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["complianceScore"] = pd.to_numeric(df["complianceScore"], errors="coerce")
    df["freightCost"] = pd.to_numeric(df["freightCost"], errors="coerce")
    df["month_year"] = df["date"].dt.to_period("M").astype(str)
    return df

@app.get("/api/health")
def health():
    return {"status": "ok", "csvFound": os.path.exists(CSV_FILE)}

@app.get("/api/insights")
def insights():
    if not os.path.exists(INSIGHTS_JSON):
        raise HTTPException(status_code=404, detail="Run analysis first.")
    with open(INSIGHTS_JSON) as f: return json.load(f)

@app.get("/api/charts/{filename}")
def chart_image(filename: str):
    file_path = os.path.join(CHARTS_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Chart not found.")
    return FileResponse(file_path, media_type="image/png")

@app.get("/api/charts")
def charts_data():
    df = load_df()
    if df is None or df.empty:
        raise HTTPException(status_code=404, detail="No data yet.")
    routes = [{"route": r, "shipments": int(c)} for r, c in df["route"].value_counts().head(8).items()]
    cargoTypes = [{"name": c, "value": int(v)} for c, v in df["cargoType"].value_counts().items()]
    monthly = df.groupby("month_year").agg(shipments=("shipmentId","count"), avgScore=("complianceScore","mean")).reset_index()
    monthlyTrend = [{"month": row["month_year"], "shipments": int(row["shipments"]), "avgScore": round(float(row["avgScore"]),1)} for _, row in monthly.iterrows()]
    bins=[0,50,60,70,80,90,101]; labels=["0-49","50-59","60-69","70-79","80-89","90-100"]
    df["scoreBucket"] = pd.cut(df["complianceScore"], bins=bins, labels=labels, right=False)
    scoreDistribution = [{"range": r, "count": int(c)} for r, c in df["scoreBucket"].value_counts().reindex(labels, fill_value=0).items()]
    riskLevels = [{"name": r, "value": int(v)} for r, v in df["riskLevel"].value_counts().items()]
    missingDocs = [{"missingCount": str(int(k)), "shipments": int(v)} for k, v in df["missingDocsCount"].value_counts().sort_index().items()]
    shippingModes = [{"name": m, "value": int(v)} for m, v in df["shippingMode"].value_counts().items()]
    costByCargo = df.groupby("cargoType")["freightCost"].agg(avg="mean",median="median",std="std").round(2).reset_index().rename(columns={"cargoType":"cargo"}).to_dict(orient="records")
    return JSONResponse(clean_nan({"routes":routes,"cargoTypes":cargoTypes,"monthlyTrend":monthlyTrend,"scoreDistribution":scoreDistribution,"riskLevels":riskLevels,"missingDocs":missingDocs,"shippingModes":shippingModes,"costByCargo":costByCargo}))

@app.post("/api/refresh")
def refresh():
    if not os.path.exists(CSV_FILE):
        raise HTTPException(status_code=404, detail="No CSV data found.")
    try:
        result = subprocess.run(["python", ANALYSIS_SCRIPT], capture_output=True, text=True, timeout=120, cwd=BASE_DIR)
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Analysis failed: {result.stderr}")
        return {"message": "Analysis refreshed successfully"}
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=500, detail="Analysis timed out")

if __name__ == "__main__":
    import uvicorn
    print(f"\n📊 FreightGenie Analytics API running on http://localhost:{PORT}")
    uvicorn.run("api:app", host="0.0.0.0", port=PORT, reload=DEBUG)