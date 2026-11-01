"""
MangroveWatch Backend — FastAPI Application

Detects mangrove loss from satellite imagery, flags illegal clearing,
generates legal evidence, and lets communities report on the ground.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import config
from routers import detection, reports, citizen_reports, alerts, auth, unet_analysis
from services.alerts import init_alerts_from_mock_data

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    logger.info("🌿 MangroveWatch Backend starting up...")
    logger.info(f"  Mock data mode: {config.USE_MOCK_DATA}")
    logger.info(f"  CORS origins: {config.ALLOWED_ORIGINS}")
    
    # Initialize alerts from mock data
    if config.USE_MOCK_DATA:
        init_alerts_from_mock_data()
    
    # Ensure upload directory exists
    config.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    
    yield
    
    logger.info("MangroveWatch Backend shutting down...")


# Create FastAPI app
app = FastAPI(
    title="MangroveWatch API",
    description=(
        "API for satellite-based mangrove loss detection, evidence generation, "
        "citizen reporting, and environmental enforcement support."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
app.mount("/uploads", StaticFiles(directory=str(config.UPLOAD_DIR)), name="uploads")

# Include routers
app.include_router(detection.router)
app.include_router(reports.router)
app.include_router(citizen_reports.router)
app.include_router(alerts.router)
app.include_router(auth.router)
app.include_router(unet_analysis.router)


@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "MangroveWatch API",
        "version": "1.0.0",
        "mock_mode": config.USE_MOCK_DATA
    }


@app.get("/", tags=["System"])
async def root():
    """Root endpoint with API info."""
    return {
        "name": "MangroveWatch API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "description": "Satellite-based mangrove loss detection and evidence platform"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=config.HOST,
        port=config.PORT,
        reload=True
    )
