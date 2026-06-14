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


class RouteVolume(BaseModel):
    route: str
    shipments: int


class NameValue(BaseModel):
    name: str
    value: int


class MonthlyTrend(BaseModel):
    month: str
    shipments: int
    avgScore: float


class ScoreBucket(BaseModel):
    range: str
    count: int


class MissingDocsBucket(BaseModel):
    missingCount: str
    shipments: int


class CostByCargo(BaseModel):
    cargo: str
    avg: float
    median: float
    std: Optional[float] = None


class ChartsResponse(BaseModel):
    routes: List[RouteVolume]
    cargoTypes: List[NameValue]
    monthlyTrend: List[MonthlyTrend]
    scoreDistribution: List[ScoreBucket]
    riskLevels: List[NameValue]
    missingDocs: List[MissingDocsBucket]
    shippingModes: List[NameValue]
    costByCargo: List[CostByCargo]


class RefreshResponse(BaseModel):
    message: str
    success: bool = True
