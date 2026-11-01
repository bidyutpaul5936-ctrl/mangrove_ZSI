"""Detection API Router"""
from fastapi import APIRouter, Query
from typing import Optional

from pipeline.detection import run_detection, get_baseline_extent, load_geojson
from pipeline.protected_areas import get_all_protected_areas
from services.carbon import estimate_carbon_loss, aggregate_carbon_loss

router = APIRouter(prefix="/api/detection", tags=["Detection"])


@router.get("/loss-patches")
async def get_loss_patches(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    min_area: float = Query(0.5, description="Minimum patch area in hectares"),
    year: Optional[int] = Query(None, description="Filter by specific year"),
    cause: Optional[str] = Query(None, description="Filter by cause type"),
    severity: Optional[str] = Query(None, description="Filter by severity level"),
):
    """Get detected mangrove loss patches with optional filters."""
    data = run_detection(
        region="sundarbans",
        start_date=start_date,
        end_date=end_date,
        min_patch_area=min_area
    )
    
    features = data.get("features", [])
    
    # Apply additional filters
    if year:
        features = [f for f in features if f["properties"].get("year") == year]
    if cause:
        features = [f for f in features if f["properties"].get("cause") == cause]
    if severity:
        features = [f for f in features if f["properties"].get("severity") == severity]
    
    data["features"] = features
    return data


@router.get("/extent")
async def get_mangrove_extent():
    """Get Global Mangrove Watch baseline extent for the Sundarbans."""
    return get_baseline_extent()


@router.get("/protected-areas")
async def get_protected_areas():
    """Get WDPA protected area boundaries."""
    return get_all_protected_areas()


@router.get("/carbon/{patch_id}")
async def get_carbon_estimate(patch_id: str):
    """Get carbon loss estimate for a specific patch."""
    loss_data = load_geojson("sundarbans_loss.geojson")
    
    for feature in loss_data.get("features", []):
        if feature["properties"].get("patch_id") == patch_id:
            area = feature["properties"].get("area_ha", 0)
            return estimate_carbon_loss(area)
    
    return {"error": "Patch not found"}


@router.get("/carbon")
async def get_aggregate_carbon():
    """Get aggregate carbon loss statistics."""
    loss_data = load_geojson("sundarbans_loss.geojson")
    return aggregate_carbon_loss(loss_data.get("features", []))


@router.get("/stats")
async def get_dashboard_stats():
    """Get comprehensive dashboard statistics."""
    import json
    from pathlib import Path
    import config
    from services.alerts import get_open_alerts
    
    loss_data = load_geojson("sundarbans_loss.geojson")
    features = loss_data.get("features", [])
    
    # Load citizen reports
    reports_path = config.DATA_DIR / "sample_reports.json"
    with open(reports_path, "r") as f:
        reports = json.load(f)
    
    # Compute stats
    total_ha = sum(f["properties"].get("area_ha", 0) for f in features)
    total_carbon = sum(f["properties"].get("carbon_loss_tco2", 0) for f in features)
    
    # Cause breakdown
    cause_breakdown = {}
    for f in features:
        cause = f["properties"].get("cause", "unknown")
        cause_breakdown[cause] = cause_breakdown.get(cause, 0) + f["properties"].get("area_ha", 0)
    
    # Yearly loss
    yearly_loss = {}
    for f in features:
        year = str(f["properties"].get("year", "unknown"))
        yearly_loss[year] = yearly_loss.get(year, 0) + f["properties"].get("area_ha", 0)
    
    # Severity breakdown
    severity_breakdown = {}
    for f in features:
        sev = f["properties"].get("severity", "unknown")
        severity_breakdown[sev] = severity_breakdown.get(sev, 0) + 1
    
    # Round values
    cause_breakdown = {k: round(v, 1) for k, v in cause_breakdown.items()}
    yearly_loss = {k: round(v, 1) for k, v in sorted(yearly_loss.items())}
    
    open_alerts = get_open_alerts()
    
    return {
        "total_hectares_lost": round(total_ha, 1),
        "total_carbon_loss_tco2": round(total_carbon, 1),
        "total_carbon_value_usd": round(total_carbon * config.CARBON_CREDIT_PRICE_USD, 2),
        "total_patches": len(features),
        "open_alerts": len(open_alerts),
        "citizen_reports": len(reports),
        "cause_breakdown": cause_breakdown,
        "yearly_loss": yearly_loss,
        "severity_breakdown": severity_breakdown
    }


@router.get("/timelapse")
async def get_timelapse_data():
    """Get loss patches organized by year for time-lapse animation."""
    loss_data = load_geojson("sundarbans_loss.geojson")
    features = loss_data.get("features", [])
    
    # Organize by year
    by_year = {}
    cumulative_ha = 0
    
    for year in range(2016, 2027):
        year_patches = [f for f in features if f["properties"].get("year") == year]
        year_ha = sum(f["properties"].get("area_ha", 0) for f in year_patches)
        cumulative_ha += year_ha
        
        by_year[str(year)] = {
            "year": year,
            "patches": year_patches,
            "hectares_lost": round(year_ha, 1),
            "cumulative_hectares": round(cumulative_ha, 1),
            "patch_count": len(year_patches)
        }
    
    return {
        "years": by_year,
        "total_hectares": round(cumulative_ha, 1),
        "year_range": [2016, 2026]
    }
