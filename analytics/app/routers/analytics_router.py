"""
app/routers/analytics_router.py
Router — companyId query param se company-specific analytics
"""

from fastapi import APIRouter, Query
from typing import Optional
from app.controllers import analytics_controller as controller
from app.models.analytics_models import HealthResponse, InsightsResponse, ChartsResponse, RefreshResponse

router = APIRouter(prefix="/api", tags=["analytics"])

router.get("/health", response_model=HealthResponse)(controller.health_check)
router.get("/insights", response_model=InsightsResponse)(controller.get_insights)
router.get("/charts/{filename}")(controller.get_chart_image)

# ✅ companyId optional query param — agar diya to sirf us company ka data
@router.get("/charts", response_model=ChartsResponse)
def get_charts(company_id: Optional[str] = Query(None, alias="companyId")):
    return controller.get_charts_data(company_id=company_id)

@router.post("/refresh", response_model=RefreshResponse)
def refresh(company_id: Optional[str] = Query(None, alias="companyId")):
    return controller.refresh_analysis(company_id=company_id)
