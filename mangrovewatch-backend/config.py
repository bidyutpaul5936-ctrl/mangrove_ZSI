"""MangroveWatch Backend Configuration"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Paths
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", str(BASE_DIR / "uploads")))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Server
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# CORS
ALLOWED_ORIGINS = [
    o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
]

# Mock data
USE_MOCK_DATA = os.getenv("USE_MOCK_DATA", "true").lower() == "true"

# Google Earth Engine
GEE_SERVICE_ACCOUNT_EMAIL = os.getenv("GEE_SERVICE_ACCOUNT_EMAIL", "")
GEE_PRIVATE_KEY_FILE = os.getenv("GEE_PRIVATE_KEY_FILE", "")

# Twilio
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER", "")
ALERT_PHONE_NUMBERS = [
    p.strip() for p in os.getenv("ALERT_PHONE_NUMBERS", "").split(",") if p.strip()
]

# SMTP
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
ALERT_EMAIL_RECIPIENTS = [
    e.strip() for e in os.getenv("ALERT_EMAIL_RECIPIENTS", "").split(",") if e.strip()
]

# Auth
OFFICER_TOKEN = os.getenv("OFFICER_TOKEN", "mangrovewatch-officer-secret-2024")

# Carbon estimation
# Default: 450 tCO2/ha is a conservative estimate for mangrove forests
# (literature range: 300-1000 tCO2/ha depending on species, age, soil carbon)
CARBON_EMISSION_FACTOR = float(os.getenv("CARBON_EMISSION_FACTOR", "450.0"))
CARBON_CREDIT_PRICE_USD = float(os.getenv("CARBON_CREDIT_PRICE_USD", "25.0"))
