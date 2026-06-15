"""
app/config/settings.py
Centralized configuration — loads from analytics/.env
"""

import os
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(BASE_DIR, ".env"))


class Settings:
    # MongoDB — production pe seedha MongoDB se data fetch hoga
    MONGO_URI: str = os.environ.get("MONGO_URI", "")
    MONGO_DB: str = os.environ.get("MONGO_DB", "freightgenie")
    MONGO_COLLECTION: str = os.environ.get("MONGO_COLLECTION", "shipments")

    # CSV fallback — sirf local development ke liye
    CSV_FILE: str = os.path.join(BASE_DIR, os.environ.get("ANALYTICS_CSV_PATH", "../backend/analytics/shipment_analytics.csv"))
    CHARTS_DIR: str = os.path.join(BASE_DIR, os.environ.get("ANALYTICS_CHARTS_DIR", "charts"))
    INSIGHTS_JSON: str = os.path.join(BASE_DIR, os.environ.get("ANALYTICS_INSIGHTS_FILE", "insights.json"))
    REPORT_FILE: str = os.path.join(BASE_DIR, os.environ.get("ANALYTICS_REPORT_FILE", "business_insights_report.pdf"))
    ANALYSIS_SCRIPT: str = os.path.join(BASE_DIR, "analysis.py")
    COMPANY_NAME: str = os.environ.get("ANALYTICS_COMPANY_NAME", "FreightGenie")

    # Server
    PORT: int = int(os.environ.get("ANALYTICS_PORT", 5500))
    DEBUG: bool = os.environ.get("ANALYTICS_DEBUG", "true").lower() == "true"

    # CORS
    CORS_ORIGIN: str = os.environ.get("ANALYTICS_CORS_ORIGIN", "*")

    @property
    def cors_origins(self):
        return ["*"] if self.CORS_ORIGIN == "*" else [o.strip() for o in self.CORS_ORIGIN.split(",")]

    @property
    def use_mongo(self) -> bool:
        """Production pe MONGO_URI hoga — MongoDB use karega. Local pe CSV fallback."""
        return bool(self.MONGO_URI)


settings = Settings()
