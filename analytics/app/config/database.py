"""
app/config/database.py
MongoDB connection — bilkul backend/config/db.js jaisa!
"""

from pymongo import MongoClient
from app.config.settings import settings

_client = None
_db = None


def connect_db():
    global _client, _db
    if not settings.MONGO_URI:
        print("  ⚠️  MONGO_URI not set — using CSV fallback")
        return None
    try:
        _client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)
        _db = _client[settings.MONGO_DB]
        # Test connection
        _client.server_info()
        print(f"  ✅  MongoDB Connected: {settings.MONGO_DB}")
        return _db
    except Exception as e:
        print(f"  ❌  MongoDB connection failed: {e}")
        return None


def get_db():
    global _db
    if _db is None:
        return connect_db()
    return _db


def close_db():
    global _client
    if _client:
        _client.close()
        print("  🔌  MongoDB Disconnected")
