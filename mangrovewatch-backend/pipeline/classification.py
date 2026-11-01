"""
Cause Classification Module

Classifies the cause of detected mangrove loss:
- pond_conversion: Rectangular shape test for aquaculture ponds
- erosion_cyclone: Irregular patterns along coastline, storm timing correlation
- clearing: Human-made clearing patterns not matching pond geometry
"""
import logging
import math
from typing import Optional

logger = logging.getLogger(__name__)


# Shape index thresholds for cause classification
# Shape index = perimeter / (2 * sqrt(pi * area))
# Rectangle: ~1.1-1.5, Circle: 1.0, Irregular: >2.5
RECTANGULAR_THRESHOLD = 1.6
IRREGULAR_THRESHOLD = 2.5


def compute_shape_index(area: float, perimeter: float) -> float:
    """
    Compute the shape index of a patch.
    Lower values indicate more compact/regular shapes.
    SI = P / (2 * sqrt(pi * A))
    """
    if area <= 0:
        return 0
    return perimeter / (2 * math.sqrt(math.pi * area))


def is_rectangular(shape_index: float) -> bool:
    """Check if shape index suggests a rectangular (man-made) shape."""
    return shape_index <= RECTANGULAR_THRESHOLD


def is_irregular(shape_index: float) -> bool:
    """Check if shape index suggests an irregular (natural) shape."""
    return shape_index >= IRREGULAR_THRESHOLD


def classify_cause(shape_index: float, 
                   ndvi_drop: float,
                   near_coastline: bool = False,
                   storm_period: bool = False,
                   area_ha: float = 0) -> str:
    """
    Classify the likely cause of mangrove loss.
    
    Rules:
    1. Rectangular shape + low NDVI after → pond_conversion
    2. Irregular shape + near coast + during storm season → erosion_cyclone
    3. Everything else → clearing
    
    Args:
        shape_index: Compactness metric (1=circle, >2=irregular)
        ndvi_drop: Magnitude of NDVI decrease
        near_coastline: Whether patch is close to coastline
        storm_period: Whether detection falls in cyclone season (Oct-Dec)
        area_ha: Patch area in hectares
    """
    # Rule 1: Pond conversion (rectangular shapes with complete clearing)
    if is_rectangular(shape_index) and ndvi_drop > 0.5:
        return "pond_conversion"
    
    # Rule 2: Erosion/Cyclone (irregular, coastal, storm timing)
    if is_irregular(shape_index) and (near_coastline or storm_period):
        return "erosion_cyclone"
    
    # Rule 2b: Large irregular patches during storm season
    if shape_index > 2.0 and storm_period and area_ha > 10:
        return "erosion_cyclone"
    
    # Rule 3: Default to human clearing
    return "clearing"


def assign_severity(area_ha: float, 
                    in_protected_area: bool,
                    cause: str,
                    confidence: float) -> str:
    """
    Assign severity level based on multiple factors.
    
    Critical: Large area in protected zone, or any pond conversion in protected area
    High: In protected area OR large area (>10ha)
    Medium: Moderate area (2-10ha) outside protected areas
    Low: Small area (<2ha) outside protected areas with natural cause
    """
    if in_protected_area and (area_ha > 10 or cause == "pond_conversion"):
        return "critical"
    
    if in_protected_area or area_ha > 10:
        return "high"
    
    if area_ha > 2 or cause == "clearing":
        return "medium"
    
    return "low"
