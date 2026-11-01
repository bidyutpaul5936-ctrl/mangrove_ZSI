"""
Carbon Loss Estimation Service

Converts mangrove area lost into estimated CO2 emissions using
configurable emission factors based on published literature.

Default factor: 450 tCO2/ha (conservative, literature range: 300-1000 tCO2/ha)
Accounts for above-ground biomass, below-ground biomass, and soil carbon.
"""
import config
from models.schemas import CarbonEstimate


def estimate_carbon_loss(area_ha: float) -> CarbonEstimate:
    """
    Estimate carbon loss for a given area of mangrove loss.
    
    Args:
        area_ha: Area of mangrove lost in hectares
    
    Returns:
        CarbonEstimate with tonnes CO2 and monetary value
    """
    carbon_loss = area_ha * config.CARBON_EMISSION_FACTOR
    carbon_value = carbon_loss * config.CARBON_CREDIT_PRICE_USD
    
    return CarbonEstimate(
        area_ha=area_ha,
        emission_factor_tco2_per_ha=config.CARBON_EMISSION_FACTOR,
        carbon_loss_tco2=round(carbon_loss, 1),
        carbon_value_usd=round(carbon_value, 2),
        credit_price_usd=config.CARBON_CREDIT_PRICE_USD
    )


def aggregate_carbon_loss(patches: list) -> dict:
    """
    Compute aggregate carbon statistics across all loss patches.
    """
    total_area = sum(
        p.get("properties", {}).get("area_ha", 0) for p in patches
    )
    total_carbon = sum(
        p.get("properties", {}).get("carbon_loss_tco2", 0) for p in patches
    )
    total_value = total_carbon * config.CARBON_CREDIT_PRICE_USD
    
    return {
        "total_area_ha": round(total_area, 1),
        "total_carbon_loss_tco2": round(total_carbon, 1),
        "total_carbon_value_usd": round(total_value, 2),
        "emission_factor_tco2_per_ha": config.CARBON_EMISSION_FACTOR,
        "credit_price_usd": config.CARBON_CREDIT_PRICE_USD,
        "patch_count": len(patches)
    }
