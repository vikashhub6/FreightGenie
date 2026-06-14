"""
app/controllers/analytics_controller.py
Controller layer — request handlers.
"""

from fastapi import HTTPException
from fastapi.responses import FileResponse
from app.services import analytics_service as service
from app.config.settings import settings


def health_check():
    return {
        "status": "ok",
        "dataAvailable": service.data_available(),
        "chartsGenerated": service.charts_generated(),
        "dataSource": "mongodb" if settings.use_mongo else "csv",
    }


def get_insights():
    data = service.get_insights()
    if data is None:
        charts = service.get_charts_data()
        if charts is None:
            raise HTTPException(status_code=404, detail="No data available yet.")
        return {"insights": [], "charts": charts}
    return data


def get_chart_image(filename: str):
    path = service.get_chart_path(filename)
    if path is None:
        raise HTTPException(status_code=404, detail="Chart not found.")
    return FileResponse(path, media_type="image/png")


def get_charts_data():
    data = service.get_charts_data()
    if data is None:
        raise HTTPException(status_code=404, detail="No shipment data found.")
    return data


def refresh_analysis():
    success, message = service.run_refresh()
    if not success:
        data = service.get_charts_data()
        if data:
            return {"message": "Data fetched directly from MongoDB", "success": True}
        raise HTTPException(status_code=500, detail=message)
    return {"message": message, "success": True}
