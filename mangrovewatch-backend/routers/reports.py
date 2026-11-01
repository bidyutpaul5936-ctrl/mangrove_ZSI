"""Evidence Report API Router"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from pipeline.detection import load_geojson
from services.evidence import generate_evidence_pdf

router = APIRouter(prefix="/api/reports", tags=["Evidence Reports"])


@router.post("/evidence/{patch_id}")
async def generate_evidence_report(patch_id: str):
    """
    Generate a downloadable PDF evidence report for a detected loss patch.
    
    The report includes:
    - Title, patch ID, coordinates, detection date
    - Area lost (ha), cause, protected area status
    - Before/after NDVI values
    - Carbon loss estimate
    - SHA-256 hash of the detection record
    - Generation timestamp
    """
    loss_data = load_geojson("sundarbans_loss.geojson")
    
    target_patch = None
    for feature in loss_data.get("features", []):
        if feature["properties"].get("patch_id") == patch_id:
            target_patch = feature
            break
    
    if not target_patch:
        raise HTTPException(status_code=404, detail=f"Patch {patch_id} not found")
    
    pdf_buffer = generate_evidence_pdf(target_patch)
    
    filename = f"MangroveWatch_Evidence_{patch_id}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Patch-ID": patch_id
        }
    )


@router.get("/evidence/{patch_id}/meta")
async def get_evidence_metadata(patch_id: str):
    """Get metadata for an evidence report without generating the PDF."""
    import hashlib
    import json
    from datetime import datetime
    from services.carbon import estimate_carbon_loss
    
    loss_data = load_geojson("sundarbans_loss.geojson")
    
    for feature in loss_data.get("features", []):
        if feature["properties"].get("patch_id") == patch_id:
            props = feature["properties"]
            geometry = feature["geometry"]
            
            record_hash = hashlib.sha256(
                json.dumps(feature, sort_keys=True, default=str).encode()
            ).hexdigest()
            
            coords = geometry.get("coordinates", [[]])[0]
            carbon = estimate_carbon_loss(props.get("area_ha", 0))
            
            return {
                "patch_id": patch_id,
                "title": f"Evidence Report: {patch_id}",
                "detection_date": props.get("detection_date"),
                "area_ha": props.get("area_ha"),
                "cause": props.get("cause"),
                "coordinates": coords,
                "protected_area": props.get("protected_area_name"),
                "carbon_loss_tco2": carbon.carbon_loss_tco2,
                "sha256_hash": record_hash,
                "generated_at": datetime.utcnow().isoformat() + "Z"
            }
    
    raise HTTPException(status_code=404, detail=f"Patch {patch_id} not found")
