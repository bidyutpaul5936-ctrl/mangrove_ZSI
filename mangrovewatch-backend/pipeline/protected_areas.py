"""
Protected Area Intersection Module

Checks detected loss patches against WDPA/OSM protected area boundaries.
Flags patches within protected areas for higher enforcement priority.
"""
import json
import logging
from typing import List, Dict, Optional, Tuple
from pathlib import Path

from shapely.geometry import shape, Point
from shapely.ops import unary_union

import config

logger = logging.getLogger(__name__)

# Cache for loaded protected areas
_protected_areas_cache = None


def load_protected_areas() -> List[dict]:
    """Load protected area boundaries from GeoJSON."""
    global _protected_areas_cache
    
    if _protected_areas_cache is not None:
        return _protected_areas_cache
    
    filepath = config.DATA_DIR / "sundarbans_protected.geojson"
    with open(filepath, "r") as f:
        data = json.load(f)
    
    _protected_areas_cache = data.get("features", [])
    return _protected_areas_cache


def check_intersection(patch_geometry: dict) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Check if a loss patch intersects any protected area.
    
    Args:
        patch_geometry: GeoJSON geometry of the loss patch
    
    Returns:
        Tuple of (is_in_protected_area, area_name, wdpa_id)
    """
    protected_areas = load_protected_areas()
    patch_shape = shape(patch_geometry)
    
    for pa in protected_areas:
        pa_shape = shape(pa["geometry"])
        
        if patch_shape.intersects(pa_shape):
            props = pa.get("properties", {})
            return True, props.get("name"), props.get("wdpa_id")
    
    return False, None, None


def check_point_in_protected_area(lat: float, lng: float) -> Tuple[bool, Optional[str]]:
    """
    Check if a point (e.g., citizen report location) is within a protected area.
    """
    protected_areas = load_protected_areas()
    point = Point(lng, lat)  # Note: Shapely uses (x, y) = (lng, lat)
    
    for pa in protected_areas:
        pa_shape = shape(pa["geometry"])
        if pa_shape.contains(point):
            return True, pa.get("properties", {}).get("name")
    
    return False, None


def get_all_protected_areas() -> dict:
    """Return all protected areas as GeoJSON FeatureCollection."""
    filepath = config.DATA_DIR / "sundarbans_protected.geojson"
    with open(filepath, "r") as f:
        return json.load(f)


def compute_overlap_area(patch_geometry: dict, pa_geometry: dict) -> float:
    """
    Compute the overlap area between a patch and a protected area in hectares.
    Note: This is an approximation using planar geometry.
    """
    patch_shape = shape(patch_geometry)
    pa_shape = shape(pa_geometry)
    
    intersection = patch_shape.intersection(pa_shape)
    
    # Approximate conversion from degrees² to hectares at Sundarbans latitude (~21.5°N)
    # 1 degree ≈ 111 km at equator, adjust for latitude
    import math
    lat_rad = math.radians(21.5)
    deg_to_km_lat = 111.0
    deg_to_km_lng = 111.0 * math.cos(lat_rad)
    
    # Area in km² then convert to hectares
    area_km2 = intersection.area * deg_to_km_lat * deg_to_km_lng
    return area_km2 * 100  # 1 km² = 100 ha


def apply_rule_engine(patch: dict) -> dict:
    """
    Apply the protected area rule engine to a loss patch.
    Enriches the patch with protected area information and legal flags.
    """
    props = patch.get("properties", {})
    geometry = patch.get("geometry", {})
    
    in_pa, pa_name, wdpa_id = check_intersection(geometry)
    
    props["in_protected_area"] = in_pa
    props["protected_area_name"] = pa_name
    props["wdpa_id"] = wdpa_id
    
    if in_pa:
        props["legal_flags"] = [
            f"Loss detected within {pa_name} (WDPA: {wdpa_id})",
            "Potential violation of Wildlife Protection Act / Forest Conservation Act",
            "Automatic escalation to enforcement priority queue"
        ]
    else:
        props["legal_flags"] = []
    
    patch["properties"] = props
    return patch
