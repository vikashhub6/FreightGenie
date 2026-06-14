"""
app/main.py
FastAPI app entry point — bilkul backend/server.js jaisa!
"""

from fastapi import FastAPI
from app.middleware.cors import setup_cors
from app.routers.analytics_router import router as analytics_router
from app.config.settings import settings
from app.config.database import connect_db, close_db

app = FastAPI(
    title="FreightGenie Analytics API",
    description="Phase 2 - Pandas/NumPy analytics for FreightGenie Business Insights",
    version="1.0.0",
)

setup_cors(app)
app.include_router(analytics_router)


@app.on_event("startup")
async def startup_event():
    """Server start hote hi MongoDB connect karo — server.js jaisa!"""
    connect_db()


@app.on_event("shutdown")
async def shutdown_event():
    """Server band hote hi MongoDB disconnect karo."""
    close_db()


@app.get("/")
def root():
    return {
        "service": "FreightGenie Analytics API",
        "docs": "/docs",
        "health": "/api/health",
    }
