"""Pydantic schemas for MangroveWatch API"""
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum


class CauseType(str, Enum):
    pond_conversion = "pond_conversion"
    erosion_cyclone = "erosion_cyclone"
    clearing = "clearing"
    unknown = "unknown"


class SeverityLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class ReportCategory(str, Enum):
    clearing = "clearing"
    dumping = "dumping"
    dead_trees = "dead_trees"


class ReportStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    rejected = "rejected"


# ── Loss Patch ──
class LossPatch(BaseModel):
    patch_id: str
    detection_date: str
    area_ha: float
    cause: CauseType
    confidence: float
    severity: SeverityLevel
    ndvi_before: float
    ndvi_after: float
    in_protected_area: bool
    protected_area_name: Optional[str] = None
    wdpa_id: Optional[str] = None
    status: str = "open"
    carbon_loss_tco2: float
    year: int
    shape_index: float
    notes: Optional[str] = None
    coordinates: Optional[list] = None


# ── Citizen Report ──
class CitizenReportCreate(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    category: ReportCategory
    description: str = Field(..., min_length=10, max_length=2000)
    reporter_name: Optional[str] = None


class CitizenReport(BaseModel):
    id: str
    lat: float
    lng: float
    category: ReportCategory
    description: str
    reporter_name: Optional[str] = None
    photo_filename: Optional[str] = None
    created_at: str
    status: ReportStatus = ReportStatus.pending
    linked_patch_id: Optional[str] = None
    officer_notes: Optional[str] = None


class CitizenReportVerify(BaseModel):
    status: Literal["confirmed", "rejected"]
    officer_notes: Optional[str] = None


# ── Alert ──
class AlertCreate(BaseModel):
    patch_id: str
    severity: SeverityLevel
    message: str
    priority_score: float = 0.0


class Alert(BaseModel):
    id: str
    patch_id: str
    severity: SeverityLevel
    message: str
    priority_score: float
    created_at: str
    acknowledged: bool = False
    notification_sent: bool = False


class AlertTestRequest(BaseModel):
    message: str = "This is a test alert from MangroveWatch"
    severity: SeverityLevel = SeverityLevel.medium


# ── Evidence Report ──
class EvidenceReportMeta(BaseModel):
    patch_id: str
    title: str
    detection_date: str
    area_ha: float
    cause: str
    coordinates: list
    protected_area: Optional[str] = None
    carbon_loss_tco2: float
    sha256_hash: str
    generated_at: str


# ── Stats ──
class DashboardStats(BaseModel):
    total_hectares_lost: float
    total_carbon_loss_tco2: float
    total_carbon_value_usd: float
    total_patches: int
    open_alerts: int
    citizen_reports: int
    cause_breakdown: dict
    yearly_loss: dict
    severity_breakdown: dict


# ── Carbon ──
class CarbonEstimate(BaseModel):
    area_ha: float
    emission_factor_tco2_per_ha: float
    carbon_loss_tco2: float
    carbon_value_usd: float
    credit_price_usd: float


# ── Detection request ──
class DetectionRequest(BaseModel):
    region: str = "sundarbans"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    min_patch_area: float = 0.5  # hectares


# ── Auth ──
class TokenAuth(BaseModel):
    token: str


class LoginResponse(BaseModel):
    success: bool
    message: str
    role: str = "officer"
