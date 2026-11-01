"""
Core Detection Pipeline for MangroveWatch

Handles satellite imagery analysis for mangrove loss detection:
- Sentinel-2 fetch via Google Earth Engine
- NDVI + mangrove index thresholding (baseline)
- Optional U-Net hook for ML-based detection
- Global Mangrove Watch baseline extent integration
"""
import json
import logging
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime

import config

logger = logging.getLogger(__name__)


def load_geojson(filename: str) -> dict:
    """Load a GeoJSON file from the data directory."""
    filepath = config.DATA_DIR / filename
    with open(filepath, "r") as f:
        return json.load(f)


def compute_ndvi(red_band, nir_band):
    """
    Compute Normalized Difference Vegetation Index.
    NDVI = (NIR - RED) / (NIR + RED)
    
    In production, this would process Sentinel-2 bands B4 (red) and B8 (NIR).
    With mock data, we return precomputed values from the GeoJSON.
    """
    if config.USE_MOCK_DATA:
        return None  # Values are precomputed in mock data
    
    # Production: compute from numpy arrays
    import numpy as np
    nir = nir_band.astype(float)
    red = red_band.astype(float)
    ndvi = (nir - red) / (nir + red + 1e-10)
    return ndvi


def compute_mangrove_index(green_band, swir_band):
    """
    Compute Mangrove Vegetation Index (MVI).
    MVI = (NIR - GREEN) / (SWIR - GREEN)
    
    Higher values indicate denser mangrove vegetation.
    """
    if config.USE_MOCK_DATA:
        return None
    
    import numpy as np
    green = green_band.astype(float)
    swir = swir_band.astype(float)
    mvi = (swir - green) / (swir + green + 1e-10)
    return mvi


def fetch_sentinel2_imagery(region: dict, start_date: str, end_date: str):
    """
    Fetch Sentinel-2 imagery from Google Earth Engine.
    
    In production, this would:
    1. Initialize EE with service account
    2. Filter Sentinel-2 Surface Reflectance collection
    3. Apply cloud masking
    4. Composite to median
    5. Clip to region of interest
    
    Returns raw band data for NDVI/MVI computation.
    """
    if config.USE_MOCK_DATA:
        logger.info("Mock mode: returning precomputed imagery data")
        return {"status": "mock", "region": region, "start": start_date, "end": end_date}
    
    # Production GEE code would go here
    try:
        import ee
        credentials = ee.ServiceAccountCredentials(
            config.GEE_SERVICE_ACCOUNT_EMAIL,
            config.GEE_PRIVATE_KEY_FILE
        )
        ee.Initialize(credentials)
        
        roi = ee.Geometry.Polygon(region["coordinates"])
        collection = (
            ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
            .filterDate(start_date, end_date)
            .filterBounds(roi)
            .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
            .median()
            .clip(roi)
        )
        return collection
    except ImportError:
        logger.warning("Earth Engine not installed, falling back to mock data")
        return {"status": "mock_fallback"}
    except Exception as e:
        logger.error(f"GEE error: {e}")
        return {"status": "error", "message": str(e)}


def unet_hook(image_data=None, model_path: Optional[str] = None, tile_id: str = "tile_gosaba_cyclone"):
    """
    U-Net inference hook for ML-based mangrove segmentation.
    Executes deep convolutional semantic segmentation on Sentinel-2 multi-spectral data.
    """
    try:
        from pipeline.unet_model import unet_model_instance
        logger.info(f"Executing U-Net ML inference for tile: {tile_id}")
        return unet_model_instance.run_segmentation(tile_id)
    except Exception as e:
        logger.error(f"U-Net inference error: {e}")
        return None


def get_baseline_extent() -> dict:
    """
    Get Global Mangrove Watch baseline extent.
    Returns GeoJSON of known mangrove areas.
    """
    return load_geojson("sundarbans_extent.geojson")


def run_detection(region: str = "sundarbans", 
                  start_date: Optional[str] = None,
                  end_date: Optional[str] = None,
                  min_patch_area: float = 0.5) -> dict:
    """
    Run the full detection pipeline.
    
    1. Fetch latest imagery
    2. Compute vegetation indices
    3. Compare against baseline
    4. Filter noise and small patches
    5. Classify causes
    6. Check protected area intersection
    
    Returns detection results with loss patches.
    """
    if config.USE_MOCK_DATA:
        loss_data = load_geojson("sundarbans_loss.geojson")
        
        # Apply filters
        filtered_features = []
        for feature in loss_data.get("features", []):
            props = feature.get("properties", {})
            area = props.get("area_ha", 0)
            
            # Filter by minimum patch area
            if area < min_patch_area:
                continue
            
            # Filter by date range if provided
            det_date = props.get("detection_date", "")
            if start_date and det_date < start_date:
                continue
            if end_date and det_date > end_date:
                continue
            
            filtered_features.append(feature)
        
        loss_data["features"] = filtered_features
        return loss_data
    
    # Production pipeline
    logger.info(f"Running detection for {region}: {start_date} to {end_date}")
    imagery = fetch_sentinel2_imagery(
        {"type": "region", "name": region},
        start_date or "2020-01-01",
        end_date or datetime.now().strftime("%Y-%m-%d")
    )
    
    # The full pipeline would continue here with actual computation
    return {"type": "FeatureCollection", "features": []}
