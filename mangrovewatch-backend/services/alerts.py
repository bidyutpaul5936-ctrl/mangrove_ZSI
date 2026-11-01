"""
Alert Service

Manages detection alerts with rule-based severity scoring,
prioritization, and notification dispatch.
"""
import json
import logging
from datetime import datetime
from typing import List, Optional
from pathlib import Path

import config
from models.schemas import Alert, SeverityLevel

logger = logging.getLogger(__name__)

# In-memory alert store (would be a database in production)
_alerts: List[dict] = []
_alert_counter = 0


def compute_priority_score(patch: dict) -> float:
    """
    Compute alert prioritization score (0-100).
    
    Factors:
    - Severity level (critical=40, high=30, medium=20, low=10)
    - Area lost (up to 20 points)
    - Protected area (20 points)
    - Repeat location proximity (10 points)
    - Recency (10 points)
    """
    props = patch.get("properties", {})
    score = 0.0
    
    # Severity base score
    severity_scores = {
        "critical": 40,
        "high": 30,
        "medium": 20,
        "low": 10
    }
    score += severity_scores.get(props.get("severity", "low"), 10)
    
    # Area score (up to 20 points, maxes at 50 ha)
    area = props.get("area_ha", 0)
    score += min(20, (area / 50) * 20)
    
    # Protected area bonus
    if props.get("in_protected_area"):
        score += 20
    
    # Recency bonus (within last year)
    try:
        det_date = datetime.strptime(props.get("detection_date", "2020-01-01"), "%Y-%m-%d")
        days_ago = (datetime.now() - det_date).days
        if days_ago < 365:
            score += max(0, 10 - (days_ago / 365) * 10)
    except (ValueError, TypeError):
        pass
    
    return round(min(100, score), 1)


def generate_alerts_from_patches(patches: list) -> List[dict]:
    """
    Generate alerts for loss patches that meet alert criteria.
    Only creates alerts for patches with severity >= medium.
    """
    global _alert_counter
    alerts = []
    
    for patch in patches:
        props = patch.get("properties", {})
        severity = props.get("severity", "low")
        
        if severity in ("low",):
            continue
        
        # Check if alert already exists for this patch
        existing = [a for a in _alerts if a.get("patch_id") == props.get("patch_id")]
        if existing:
            continue
        
        _alert_counter += 1
        priority = compute_priority_score(patch)
        
        cause = props.get("cause", "unknown").replace("_", " ").title()
        area = props.get("area_ha", 0)
        pa_name = props.get("protected_area_name", "")
        
        message = f"{cause} detected: {area:.1f} ha lost"
        if pa_name:
            message += f" in {pa_name}"
        message += f" (Confidence: {props.get('confidence', 0)*100:.0f}%)"
        
        alert = {
            "id": f"ALT-{_alert_counter:04d}",
            "patch_id": props.get("patch_id", ""),
            "severity": severity,
            "message": message,
            "priority_score": priority,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "acknowledged": False,
            "notification_sent": False,
            "coordinates": _get_centroid(patch.get("geometry", {}))
        }
        
        _alerts.append(alert)
        alerts.append(alert)
    
    # Sort by priority
    _alerts.sort(key=lambda a: a.get("priority_score", 0), reverse=True)
    
    return alerts


def _get_centroid(geometry: dict) -> dict:
    """Get approximate centroid of a geometry."""
    coords = geometry.get("coordinates", [[]])[0]
    if not coords:
        return {"lat": 0, "lng": 0}
    lngs = [c[0] for c in coords]
    lats = [c[1] for c in coords]
    return {
        "lat": round(sum(lats) / len(lats), 4),
        "lng": round(sum(lngs) / len(lngs), 4)
    }


def get_all_alerts() -> List[dict]:
    """Get all alerts sorted by priority score."""
    return sorted(_alerts, key=lambda a: a.get("priority_score", 0), reverse=True)


def get_open_alerts() -> List[dict]:
    """Get unacknowledged alerts."""
    return [a for a in get_all_alerts() if not a.get("acknowledged")]


def acknowledge_alert(alert_id: str) -> Optional[dict]:
    """Mark an alert as acknowledged."""
    for alert in _alerts:
        if alert["id"] == alert_id:
            alert["acknowledged"] = True
            return alert
    return None


def init_alerts_from_mock_data():
    """Initialize alerts from mock loss data on startup."""
    from pipeline.detection import load_geojson
    loss_data = load_geojson("sundarbans_loss.geojson")
    patches = loss_data.get("features", [])
    generate_alerts_from_patches(patches)
    logger.info(f"Initialized {len(_alerts)} alerts from mock data")
