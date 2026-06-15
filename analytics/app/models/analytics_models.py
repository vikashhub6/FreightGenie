"""
app/models/analytics_models.py
Pydantic models — define the shape of JSON responses.
"""

from pydantic import BaseModel
from typing import List, Optional, Any, Dict


class HealthResponse(BaseModel):
    status: str
    dataAvailable: bool
    chartsGenerated: bool
    dataSource: str


class InsightItem(BaseModel):
    type: str
    title: str
    detail: str
    action: str


class InsightStats(BaseModel):
    totalShipments: int
    avgComplianceScore: float
    highRiskCount: int
    avgMissingDocs: float
    topRoute: str
    topCargo: str
    generatedAt: str


class InsightsResponse(BaseModel):
    stats: Optional[InsightStats] = None
    insights: Optional[List[InsightItem]] = None
    charts: Optional[Dict[str, Any]] = None

    class Config:
        extra = "allow"


# ── New ChartsResponse — chartUrls + stats ────────────────────────
class ChartsResponse(BaseModel):
    chartUrls: Dict[str, str]
    stats: Dict[str, Any]

    class Config:
        extra = "allow"


class RefreshResponse(BaseModel):
    message: str
    success: bool = True