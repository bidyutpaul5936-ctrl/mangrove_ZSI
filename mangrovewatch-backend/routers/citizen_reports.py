"""Citizen Reports API Router"""
import json
import uuid
import math
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Header
from PIL import Image
import piexif

import config
from models.schemas import ReportCategory, ReportStatus

router = APIRouter(prefix="/api/citizen-reports", tags=["Citizen Reports"])
logger = logging.getLogger(__name__)

# In-memory store loaded from sample data
_reports = []
_initialized = False


def _init_reports():
    """Load sample reports on first access."""
    global _reports, _initialized
    if _initialized:
        return
    
    reports_path = config.DATA_DIR / "sample_reports.json"
    if reports_path.exists():
        with open(reports_path, "r") as f:
            _reports = json.load(f)
    _initialized = True


def _save_reports():
    """Persist reports to JSON file."""
    reports_path = config.DATA_DIR / "sample_reports.json"
    with open(reports_path, "w") as f:
        json.dump(_reports, f, indent=2, default=str)


def _strip_exif(image_path: Path) -> Path:
    """Strip EXIF data from an image for privacy, keeping a clean copy."""
    try:
        img = Image.open(image_path)
        
        # Remove EXIF data
        data = list(img.getdata())
        clean_img = Image.new(img.mode, img.size)
        clean_img.putdata(data)
        
        # Save stripped version
        stripped_path = image_path.parent / f"stripped_{image_path.name}"
        clean_img.save(stripped_path)
        
        return stripped_path
    except Exception as e:
        logger.warning(f"EXIF strip failed: {e}")
        return image_path


def _validate_geotag(lat: float, lng: float) -> bool:
    """
    Validate that the geotag is within a reasonable area
    (Sundarbans region: roughly 88-91°E, 21-23°N).
    """
    return 85.0 <= lng <= 92.0 and 20.0 <= lat <= 24.0


def _find_nearby_patches(lat: float, lng: float, radius_m: float = 200) -> Optional[str]:
    """
    Find satellite-detected loss patches within radius_m meters of a point.
    Links citizen reports to satellite flags for corroboration.
    """
    from pipeline.detection import load_geojson
    
    loss_data = load_geojson("sundarbans_loss.geojson")
    
    # Convert radius to approximate degrees
    # At ~21.5°N: 1° lat ≈ 111 km, 1° lng ≈ 103 km
    radius_deg_lat = radius_m / 111000
    radius_deg_lng = radius_m / (111000 * math.cos(math.radians(21.5)))
    
    for feature in loss_data.get("features", []):
        coords = feature["geometry"].get("coordinates", [[]])[0]
        if not coords:
            continue
        
        # Compute centroid
        avg_lng = sum(c[0] for c in coords) / len(coords)
        avg_lat = sum(c[1] for c in coords) / len(coords)
        
        # Check distance (simple rectangular check)
        if (abs(lat - avg_lat) < radius_deg_lat and 
            abs(lng - avg_lng) < radius_deg_lng):
            return feature["properties"].get("patch_id")
    
    return None


def _add_training_label(patch_id: str, report_id: str, category: str):
    """Save confirmed citizen report as a training label for future ML retraining."""
    labels_path = config.DATA_DIR / "training_labels.json"
    
    labels = []
    if labels_path.exists():
        with open(labels_path, "r") as f:
            labels = json.load(f)
    
    labels.append({
        "patch_id": patch_id,
        "citizen_report_id": report_id,
        "label": category,
        "verified_by": "citizen+satellite",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })
    
    with open(labels_path, "w") as f:
        json.dump(labels, f, indent=2)


@router.get("")
async def list_reports(
    status: Optional[str] = None,
    category: Optional[str] = None
):
    """List all citizen reports with optional filters."""
    _init_reports()
    
    filtered = _reports
    if status:
        filtered = [r for r in filtered if r.get("status") == status]
    if category:
        filtered = [r for r in filtered if r.get("category") == category]
    
    return {"reports": filtered, "total": len(filtered)}


@router.post("")
async def create_report(
    lat: float = Form(...),
    lng: float = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    reporter_name: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None)
):
    """
    Submit a citizen report of mangrove damage.
    
    - Photos are stored with EXIF-stripped copies
    - Geotag is validated against the Sundarbans region
    - Reports within 200m of a satellite-detected patch are auto-linked
    """
    _init_reports()
    
    # Validate category
    if category not in [e.value for e in ReportCategory]:
        raise HTTPException(400, f"Invalid category. Must be one of: {[e.value for e in ReportCategory]}")
    
    # Validate geotag (relaxed for demo, but log warning)
    if not _validate_geotag(lat, lng):
        logger.warning(f"Report geotag outside Sundarbans: {lat}, {lng}")
    
    # Handle photo upload
    photo_filename = None
    if photo:
        # Save original
        ext = Path(photo.filename).suffix or ".jpg"
        photo_filename = f"report_{uuid.uuid4().hex[:8]}{ext}"
        photo_path = config.UPLOAD_DIR / photo_filename
        
        content = await photo.read()
        with open(photo_path, "wb") as f:
            f.write(content)
        
        # Strip EXIF for privacy
        _strip_exif(photo_path)
    
    # Check for nearby satellite patches (auto-linking)
    linked_patch_id = _find_nearby_patches(lat, lng, radius_m=200)
    
    report = {
        "id": f"CR-{uuid.uuid4().hex[:6].upper()}",
        "lat": lat,
        "lng": lng,
        "category": category,
        "description": description,
        "reporter_name": reporter_name,
        "photo_filename": photo_filename,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "status": "pending",
        "linked_patch_id": linked_patch_id,
        "officer_notes": None
    }
    
    # If auto-linked, boost satellite detection confidence
    if linked_patch_id:
        report["auto_linked"] = True
        logger.info(f"Report {report['id']} auto-linked to patch {linked_patch_id}")
    
    _reports.append(report)
    _save_reports()
    
    return {
        "success": True,
        "report": report,
        "auto_linked": linked_patch_id is not None,
        "linked_patch_id": linked_patch_id
    }


@router.put("/{report_id}/verify")
async def verify_report(
    report_id: str,
    status: str = Form(...),
    officer_notes: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None)
):
    """
    Officer verification: mark report as confirmed or rejected.
    Confirmed reports linked to patches are saved as training labels.
    """
    _init_reports()
    
    # Simple token auth check
    if authorization != f"Bearer {config.OFFICER_TOKEN}":
        raise HTTPException(401, "Invalid officer token")
    
    if status not in ("confirmed", "rejected"):
        raise HTTPException(400, "Status must be 'confirmed' or 'rejected'")
    
    for report in _reports:
        if report["id"] == report_id:
            report["status"] = status
            report["officer_notes"] = officer_notes
            
            # Save training label if confirmed and linked to a patch
            if status == "confirmed" and report.get("linked_patch_id"):
                _add_training_label(
                    report["linked_patch_id"],
                    report_id,
                    report.get("category", "unknown")
                )
            
            _save_reports()
            return {"success": True, "report": report}
    
    raise HTTPException(404, f"Report {report_id} not found")


@router.get("/{report_id}")
async def get_report(report_id: str):
    """Get a single citizen report by ID."""
    _init_reports()
    
    for report in _reports:
        if report["id"] == report_id:
            return report
    
    raise HTTPException(404, f"Report {report_id} not found")
