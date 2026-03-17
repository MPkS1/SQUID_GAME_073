"""
Vercel Serverless API - QShield AI Backend
Runs FastAPI as serverless functions on Vercel
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

# Import the main FastAPI app
try:
    from main import app
except ImportError:
    # Fallback: create a simple app if main.py is not found
    app = FastAPI(title="QShield AI API")
    
    @app.get("/health")
    async def health():
        return {"status": "healthy", "service": "qshield-ai"}

# Add CORS middleware for Vercel cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in production, restrict as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Export the handler for Vercel
handler = Mangum(app, lifespan="off")

