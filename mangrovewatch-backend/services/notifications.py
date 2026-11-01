"""
Notification Service

Handles SMS (Twilio) and email (SMTP) notifications for alerts.
Gracefully mocks when credentials are not configured.
"""
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

import config

logger = logging.getLogger(__name__)


def _is_twilio_configured() -> bool:
    return bool(config.TWILIO_ACCOUNT_SID and config.TWILIO_AUTH_TOKEN)


def _is_smtp_configured() -> bool:
    return bool(config.SMTP_HOST and config.SMTP_USER)


def send_sms(message: str, to_numbers: Optional[list] = None) -> dict:
    """
    Send SMS alert via Twilio. Mocked when credentials are not set.
    """
    numbers = to_numbers or config.ALERT_PHONE_NUMBERS
    
    if not _is_twilio_configured():
        logger.info(f"[MOCK SMS] Would send to {numbers}: {message[:100]}...")
        return {
            "status": "mocked",
            "message": message[:100],
            "recipients": numbers,
            "note": "Twilio not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER."
        }
    
    try:
        from twilio.rest import Client
        client = Client(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN)
        
        results = []
        for number in numbers:
            msg = client.messages.create(
                body=message,
                from_=config.TWILIO_FROM_NUMBER,
                to=number
            )
            results.append({"to": number, "sid": msg.sid, "status": msg.status})
        
        return {"status": "sent", "results": results}
    except Exception as e:
        logger.error(f"SMS send failed: {e}")
        return {"status": "error", "error": str(e)}


def send_email(subject: str, body: str, to_emails: Optional[list] = None) -> dict:
    """
    Send email alert via SMTP. Mocked when credentials are not set.
    """
    recipients = to_emails or config.ALERT_EMAIL_RECIPIENTS
    
    if not _is_smtp_configured():
        logger.info(f"[MOCK EMAIL] Would send to {recipients}: {subject}")
        return {
            "status": "mocked",
            "subject": subject,
            "recipients": recipients,
            "note": "SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD."
        }
    
    try:
        msg = MIMEMultipart()
        msg["From"] = config.SMTP_USER
        msg["To"] = ", ".join(recipients)
        msg["Subject"] = f"[MangroveWatch Alert] {subject}"
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="background: #0B3D2E; color: white; padding: 16px; border-radius: 8px 8px 0 0;">
                <h2>🌿 MangroveWatch Alert</h2>
            </div>
            <div style="padding: 16px; border: 1px solid #E8F5E9; border-radius: 0 0 8px 8px;">
                <h3>{subject}</h3>
                <p>{body}</p>
                <hr>
                <p style="font-size: 12px; color: #666;">
                    This is an automated alert from MangroveWatch detection system.
                </p>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(html_body, "html"))
        
        with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT) as server:
            server.starttls()
            server.login(config.SMTP_USER, config.SMTP_PASSWORD)
            server.send_message(msg)
        
        return {"status": "sent", "recipients": recipients}
    except Exception as e:
        logger.error(f"Email send failed: {e}")
        return {"status": "error", "error": str(e)}


def send_alert_notification(alert: dict) -> dict:
    """
    Send both SMS and email notifications for an alert.
    """
    severity = alert.get("severity", "medium")
    message = alert.get("message", "")
    coords = alert.get("coordinates", {})
    
    notification_text = (
        f"MangroveWatch Alert [{severity.upper()}]\n"
        f"{message}\n"
        f"Location: {coords.get('lat', 0):.4f}°N, {coords.get('lng', 0):.4f}°E\n"
        f"View: https://mangrovewatch.vercel.app/map?alert={alert.get('id', '')}"
    )
    
    sms_result = send_sms(notification_text)
    email_result = send_email(
        f"{severity.upper()}: {message[:80]}",
        notification_text
    )
    
    return {
        "sms": sms_result,
        "email": email_result
    }
