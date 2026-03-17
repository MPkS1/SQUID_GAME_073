"""
Configuration module for QShield AI backend
Loads environment variables and validates them
"""
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Google APIs
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
GOOGLE_SAFE_BROWSING_API_KEY = os.getenv("GOOGLE_SAFE_BROWSING_API_KEY", "")

# Backend Configuration
BACKEND_HOST = os.getenv("BACKEND_HOST", "0.0.0.0")
BACKEND_PORT = int(os.getenv("BACKEND_PORT", 8000))
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

# Rate Limiting
MAX_REQUESTS_PER_MINUTE = int(os.getenv("MAX_REQUESTS_PER_MINUTE", 30))
MAX_REQUESTS_PER_HOUR = int(os.getenv("MAX_REQUESTS_PER_HOUR", 300))

# CORS
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# Validation
MAX_MESSAGE_LENGTH = 5000
MIN_MESSAGE_LENGTH = 10
MAX_URL_LENGTH = 2048

# API Timeouts (seconds)
GEMINI_TIMEOUT = 10
SAFE_BROWSING_TIMEOUT = 5
WHOIS_TIMEOUT = 3

# Demo mode (for testing without real API keys)
DEMO_MODE = GOOGLE_API_KEY == "dummy-key-for-testing"

def validate_config():
    """Validate that critical configuration is set"""
    if not DEMO_MODE:
        if not GOOGLE_API_KEY or GOOGLE_API_KEY == "your-gemini-api-key-here":
            print("⚠️  WARNING: GOOGLE_API_KEY not properly configured")
        if not GOOGLE_SAFE_BROWSING_API_KEY or GOOGLE_SAFE_BROWSING_API_KEY == "your-safe-browsing-key-here":
            print("⚠️  WARNING: GOOGLE_SAFE_BROWSING_API_KEY not properly configured")
    else:
        print("🔧 Running in DEMO MODE (dummy API keys)")

# Run validation on import
validate_config()
