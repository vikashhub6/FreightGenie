"""
app/routers/analytics_router.py
Router — defines the URL paths (like routes/*.js in the Node backend)
and wires each one to a controller function.
"""

from fastapi import APIRouter
from app.controllers import analytics_controller as controller
from app.models.analytics_models import HealthResponse, InsightsResponse, ChartsResponse, RefreshResponse

router = APIRouter(prefix="/api", tags=["analytics"])

router.get("/health", response_model=HealthResponse)(controller.health_check)
router.get("/insights", response_model=InsightsResponse)(controller.get_insights)
router.get("/charts/{filename}")(controller.get_chart_image)
router.get("/charts", response_model=ChartsResponse)(controller.get_charts_data)
router.post("/refresh", response_model=RefreshResponse)(controller.refresh_analysis)
