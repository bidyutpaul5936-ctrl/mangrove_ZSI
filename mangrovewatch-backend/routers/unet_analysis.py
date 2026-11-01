"""
U-Net Satellite Image Analysis & Cyclone Bio-Shield API Router
"""
from fastapi import APIRouter, HTTPException, Query, Body
from fastapi.responses import StreamingResponse
from typing import Optional, Dict, Any

from pipeline.unet_model import unet_model_instance, SATELLITE_TILES
from services.cyclone_report import (
    simulate_cyclone_and_shield,
    get_preventive_measures_roadmap,
    generate_unet_cyclone_pdf,
    CYCLONE_PROFILES
)

router = APIRouter(prefix="/api/unet", tags=["U-Net Satellite & Cyclone Analysis"])


@router.get("/tiles")
async def get_satellite_tiles():
    """Get all pre-calibrated Sentinel-2 satellite tiles for U-Net ML analysis."""
    return unet_model_instance.get_available_tiles()


@router.post("/analyze")
async def analyze_satellite_tile(
    payload: Dict[str, Any] = Body(
        ...,
        example={"tile_id": "tile_gosaba_cyclone", "spectral_mode": "rgb"}
    )
):
    """
    Run U-Net deep learning semantic segmentation on the selected satellite tile.
    Returns pixel-level class distribution, canopy loss, and telemetry metrics.
    """
    tile_id = payload.get("tile_id", "tile_gosaba_cyclone")
    result = unet_model_instance.run_segmentation(tile_id)
    return result


@router.post("/cyclone-simulation")
async def run_cyclone_simulation(
    payload: Dict[str, Any] = Body(
        ...,
        example={
            "cyclone_key": "amphan_super_cyclone",
            "forest_width_m": 720,
            "canopy_density_pct": 75.0,
            "coastal_population": 195000,
            "coastal_assets_usd_m": 420.0
        }
    )
):
    """
    Simulate cyclone storm surge and compute how much the mangrove forest prevents
    in wave height, water surge, lives protected, and economic losses averted.
    """
    cyclone_key = payload.get("cyclone_key", "amphan_super_cyclone")
    forest_width_m = float(payload.get("forest_width_m", 720))
    canopy_density_pct = float(payload.get("canopy_density_pct", 75.0))
    population = int(payload.get("coastal_population", 195000))
    assets_m = float(payload.get("coastal_assets_usd_m", 420.0))

    sim_result = simulate_cyclone_and_shield(
        cyclone_key=cyclone_key,
        forest_width_m=forest_width_m,
        canopy_density_pct=canopy_density_pct,
        coastal_village_population=population,
        asset_base_millions_usd=assets_m
    )
    return sim_result


@router.get("/preventive-measures")
async def get_preventive_measures():
    """Retrieve prioritized preventive measures and bio-shield reinforcement roadmap."""
    return get_preventive_measures_roadmap()


@router.get("/cyclone-profiles")
async def get_cyclone_profiles():
    """Retrieve standard historical and calibrated cyclone hazard profiles."""
    return CYCLONE_PROFILES


@router.post("/generate-pdf")
async def generate_report_pdf(payload: Dict[str, Any] = Body(...)):
    """
    Generate and stream an official publication-grade PDF report containing
    U-Net segmentation metrics, cyclone hydrodynamic comparison, and preventive measures.
    """
    tile_id = payload.get("tile_id", "tile_gosaba_cyclone")
    cyclone_key = payload.get("cyclone_key", "amphan_super_cyclone")
    forest_width_m = float(payload.get("forest_width_m", 720))

    # Run analysis
    segmentation_data = unet_model_instance.run_segmentation(tile_id)
    cyclone_data = simulate_cyclone_and_shield(
        cyclone_key=cyclone_key,
        forest_width_m=forest_width_m
    )

    pdf_buffer = generate_unet_cyclone_pdf(segmentation_data, cyclone_data)
    filename = f"MangroveWatch_UNet_Cyclone_Report_{tile_id}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Report-Type": "UNet-Cyclone-BioShield"
        }
    )
