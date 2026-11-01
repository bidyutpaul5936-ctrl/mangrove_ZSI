"""Alerts API Router"""
from fastapi import APIRouter, HTTPException, Header
from typing import Optional

import config
from services.alerts import (
    get_all_alerts, get_open_alerts, acknowledge_alert,
    init_alerts_from_mock_data, generate_alerts_from_patches,
    compute_priority_score
)
from services.notifications import send_alert_notification
from models.schemas import AlertTestRequest

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("")
async def list_alerts(
    open_only: bool = False,
    severity: Optional[str] = None
):
    """Get all alerts, optionally filtered by status and severity."""
    alerts = get_open_alerts() if open_only else get_all_alerts()
    
    if severity:
        alerts = [a for a in alerts if a.get("severity") == severity]
    
    return {
        "alerts": alerts,
        "total": len(alerts),
        "open_count": len([a for a in alerts if not a.get("acknowledged")])
    }


@router.put("/{alert_id}/acknowledge")
async def ack_alert(
    alert_id: str,
    authorization: Optional[str] = Header(None)
):
    """Mark an alert as acknowledged (officer action)."""
    if authorization != f"Bearer {config.OFFICER_TOKEN}":
        raise HTTPException(401, "Invalid officer token")
    
    alert = acknowledge_alert(alert_id)
    if not alert:
        raise HTTPException(404, f"Alert {alert_id} not found")
    
    return {"success": True, "alert": alert}


@router.post("/{alert_id}/notify")
async def send_notification(
    alert_id: str,
    authorization: Optional[str] = Header(None)
):
    """Send SMS/email notification for a specific alert."""
    if authorization != f"Bearer {config.OFFICER_TOKEN}":
        raise HTTPException(401, "Invalid officer token")
    
    alerts = get_all_alerts()
    target = None
    for a in alerts:
        if a["id"] == alert_id:
            target = a
            break
    
    if not target:
        raise HTTPException(404, f"Alert {alert_id} not found")
    
    result = send_alert_notification(target)
    return {"success": True, "notification": result}


@router.post("/test")
async def test_alert(request: AlertTestRequest = AlertTestRequest()):
    """
    Send a test alert notification.
    Useful for verifying SMS/email configuration.
    """
    test_alert_data = {
        "id": "ALT-TEST",
        "severity": request.severity,
        "message": request.message,
        "coordinates": {"lat": 21.65, "lng": 89.30},
        "patch_id": "TEST-001"
    }
    
    result = send_alert_notification(test_alert_data)
    return {
        "success": True,
        "test_alert": test_alert_data,
        "notification_result": result
    }
