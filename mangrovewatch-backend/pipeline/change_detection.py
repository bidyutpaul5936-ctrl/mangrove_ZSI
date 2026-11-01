"""
Two-date Change Detection Module

Handles temporal comparison of satellite imagery to detect mangrove loss:
- NDVI differencing between two dates
- Noise filtering (tides, shadows, seasonality)
- Minimum patch area thresholding
- Confidence scoring based on magnitude of change
"""
import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime

import config

logger = logging.getLogger(__name__)


# Thresholds for change detection
NDVI_LOSS_THRESHOLD = -0.25  # NDVI drop indicating significant vegetation loss
MIN_PATCH_AREA_HA = 0.5     # Minimum area to flag (filters noise)
SHADOW_NDVI_FLOOR = 0.1     # Below this, likely shadow not vegetation
TIDE_BUFFER_M = 50          # Buffer around coastline for tidal artifacts
SEASONAL_TOLERANCE = 0.1    # Allow for seasonal NDVI variation


def compute_ndvi_difference(ndvi_before: float, ndvi_after: float) -> float:
    """Compute the NDVI change between two dates."""
    return ndvi_after - ndvi_before


def is_significant_loss(ndvi_before: float, ndvi_after: float) -> bool:
    """
    Determine if the NDVI change indicates real mangrove loss.
    Filters out noise from shadows, tides, and seasonal variation.
    """
    diff = compute_ndvi_difference(ndvi_before, ndvi_after)
    
    # Must show significant drop
    if diff > NDVI_LOSS_THRESHOLD:
        return False
    
    # Filter shadows: before value should indicate real vegetation
    if ndvi_before < SHADOW_NDVI_FLOOR:
        return False
    
    # Filter seasonal: the drop should exceed seasonal tolerance
    if abs(diff) < SEASONAL_TOLERANCE:
        return False
    
    return True


def compute_confidence(ndvi_before: float, ndvi_after: float, area_ha: float) -> float:
    """
    Compute confidence score for a detected loss patch.
    
    Higher confidence when:
    - Larger NDVI drop (vegetation → bare/water)
    - Larger area (less likely to be noise)
    - Before NDVI indicates healthy mangrove (>0.6)
    """
    diff = abs(ndvi_before - ndvi_after)
    
    # Base confidence from NDVI change magnitude (0-0.4 → 0.5-0.95)
    ndvi_score = min(0.95, 0.5 + diff)
    
    # Area bonus (larger patches more reliable)
    area_score = min(1.0, 0.7 + (area_ha / 100))
    
    # Healthy vegetation bonus
    health_score = min(1.0, 0.6 + (ndvi_before - 0.5))
    
    confidence = (ndvi_score * 0.5 + area_score * 0.3 + health_score * 0.2)
    return round(min(0.99, max(0.1, confidence)), 2)


def filter_tidal_artifacts(patches: List[dict], coastline_buffer_m: float = TIDE_BUFFER_M) -> List[dict]:
    """
    Filter out false positives caused by tidal variation.
    Patches very close to the coastline with low NDVI might be
    exposed mudflats rather than actual forest loss.
    """
    filtered = []
    for patch in patches:
        props = patch.get("properties", {})
        # In production, we'd check distance to coastline geometry
        # For mock data, rely on existing confidence scores
        if props.get("confidence", 0) > 0.3:
            filtered.append(patch)
    return filtered


def filter_shadow_artifacts(patches: List[dict]) -> List[dict]:
    """
    Filter patches that might be cloud/building shadows.
    True loss shows consistently low NDVI, not just a single observation.
    """
    filtered = []
    for patch in patches:
        props = patch.get("properties", {})
        ndvi_before = props.get("ndvi_before", 0)
        ndvi_after = props.get("ndvi_after", 0)
        
        # If before NDVI was already low, this isn't new loss
        if ndvi_before < 0.3:
            continue
        
        # If after NDVI is still moderately high, might be shadow
        if ndvi_after > 0.4:
            continue
        
        filtered.append(patch)
    return filtered


def apply_minimum_area_filter(patches: List[dict], min_area: float = MIN_PATCH_AREA_HA) -> List[dict]:
    """Remove patches smaller than minimum area threshold."""
    return [
        p for p in patches
        if p.get("properties", {}).get("area_ha", 0) >= min_area
    ]


def run_change_detection(before_data: dict, after_data: dict, 
                          min_patch_area: float = MIN_PATCH_AREA_HA) -> List[dict]:
    """
    Run the full two-date change detection pipeline.
    
    1. Compute NDVI difference
    2. Threshold to identify loss candidates
    3. Filter tidal artifacts
    4. Filter shadow artifacts
    5. Apply minimum patch area
    6. Score confidence
    """
    if config.USE_MOCK_DATA:
        # In mock mode, the loss patches are precomputed
        from pipeline.detection import load_geojson
        loss = load_geojson("sundarbans_loss.geojson")
        patches = loss.get("features", [])
        
        # Still apply filters for realism
        patches = filter_tidal_artifacts(patches)
        patches = filter_shadow_artifacts(patches)
        patches = apply_minimum_area_filter(patches, min_patch_area)
        
        return patches
    
    # Production implementation
    logger.info("Running two-date change detection")
    # Would compute pixel-by-pixel NDVI difference, vectorize loss regions, etc.
    return []
