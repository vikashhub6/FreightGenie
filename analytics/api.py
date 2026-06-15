"""
api.py — FreightGenie Analytics
Entry point — bilkul backend/server.js jaisa!

Run:  python api.py
 or:  uvicorn app.main:app --port 5500 --reload
"""

from app.main import app  # noqa: F401

if __name__ == "__main__":
    import uvicorn
    from app.config.settings import settings

    print("\n")
    print("  ╔══════════════════════════════════════════════╗")
    print("  ║       🚢  FreightGenie Analytics API         ║")
    print("  ╠══════════════════════════════════════════════╣")
    print(f"  ║  🌐  Server    : http://localhost:{settings.PORT}       ║")
    print(f"  ║  📖  API Docs  : http://localhost:{settings.PORT}/docs   ║")
    print(f"  ║  ❤️   Health   : http://localhost:{settings.PORT}/api/health ║")
    print("  ╠══════════════════════════════════════════════╣")

    if settings.use_mongo:
        print("  ║  🍃  Data Source : MongoDB Atlas             ║")
        print(f"  ║  🗄️   Database   : {settings.MONGO_DB:<28}║")
        print(f"  ║  📦  Collection  : {settings.MONGO_COLLECTION:<28}║")
    else:
        print("  ║  📄  Data Source : CSV File (Local Dev)      ║")
        print(f"  ║  📂  CSV Path    : {settings.CSV_FILE[-28:]:<28}║")

    print("  ╠══════════════════════════════════════════════╣")
    print(f"  ║  🔧  Debug Mode  : {'ON  ✅' if settings.DEBUG else 'OFF ❌'}                       ║")
    print(f"  ║  🌍  CORS Origin : {settings.CORS_ORIGIN:<28}║")
    print("  ╚══════════════════════════════════════════════╝")
    print("\n  📁 Loaded Modules:")
    print("     ✅  app/config/settings.py")
    print("     ✅  app/middleware/cors.py")
    print("     ✅  app/models/analytics_models.py")
    print("     ✅  app/services/analytics_service.py")
    print("     ✅  app/controllers/analytics_controller.py")
    print("     ✅  app/routers/analytics_router.py")
    print("     ✅  app/main.py")
    print("\n  🚀 FreightGenie Analytics is LIVE!\n")

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG,
    )
