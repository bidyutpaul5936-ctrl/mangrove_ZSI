"""
Evidence Report Generator Service

Generates downloadable PDF evidence reports for detected loss patches.
Each report contains:
- Title, patch ID, coordinates, detection date
- Area lost (ha), cause classification, protected area status
- Before/after NDVI values
- Carbon loss estimate
- SHA-256 hash of the detection record for integrity verification
- Generation timestamp
"""
import io
import json
import hashlib
import logging
from datetime import datetime
from typing import Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, Image as RLImage
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

import config
from services.carbon import estimate_carbon_loss

logger = logging.getLogger(__name__)

# Brand colors
DARK_GREEN = colors.HexColor("#0B3D2E")
FOREST_GREEN = colors.HexColor("#1B5E3B")
LIGHT_GREEN = colors.HexColor("#E8F5E9")
ALERT_RED = colors.HexColor("#D32F2F")
ACCENT_GOLD = colors.HexColor("#F9A825")
DARK_GRAY = colors.HexColor("#333333")
LIGHT_GRAY = colors.HexColor("#F5F5F5")


def compute_record_hash(patch_data: dict) -> str:
    """Compute SHA-256 hash of the detection record for integrity verification."""
    record_str = json.dumps(patch_data, sort_keys=True, default=str)
    return hashlib.sha256(record_str.encode()).hexdigest()


def generate_evidence_pdf(patch: dict) -> io.BytesIO:
    """
    Generate a PDF evidence report for a detected loss patch.
    
    Args:
        patch: GeoJSON feature dict with properties and geometry
    
    Returns:
        BytesIO buffer containing the PDF
    """
    props = patch.get("properties", {})
    geometry = patch.get("geometry", {})
    
    # Compute hash before any modifications
    record_hash = compute_record_hash(patch)
    generation_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    
    # Carbon estimate
    carbon = estimate_carbon_loss(props.get("area_ha", 0))
    
    # Get coordinates centroid
    coords = geometry.get("coordinates", [[]])[0]
    if coords:
        avg_lng = sum(c[0] for c in coords) / len(coords)
        avg_lat = sum(c[1] for c in coords) / len(coords)
    else:
        avg_lng, avg_lat = 0, 0
    
    # Create PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'EvidenceTitle',
        parent=styles['Title'],
        fontSize=22,
        textColor=DARK_GREEN,
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'EvidenceSubtitle',
        parent=styles['Normal'],
        fontSize=11,
        textColor=DARK_GRAY,
        alignment=TA_CENTER,
        spaceAfter=20
    )
    
    section_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=FOREST_GREEN,
        spaceBefore=16,
        spaceAfter=8,
        fontName='Helvetica-Bold'
    )
    
    body_style = ParagraphStyle(
        'EvidenceBody',
        parent=styles['Normal'],
        fontSize=10,
        textColor=DARK_GRAY,
        spaceAfter=6
    )
    
    elements = []
    
    # ── Header ──
    elements.append(Paragraph("🌿 MANGROVEWATCH", title_style))
    elements.append(Paragraph("EVIDENCE REPORT — SATELLITE-BASED DETECTION", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=2, color=FOREST_GREEN))
    elements.append(Spacer(1, 12))
    
    # ── Alert Banner (if in protected area) ──
    if props.get("in_protected_area"):
        alert_style = ParagraphStyle(
            'Alert', parent=styles['Normal'],
            fontSize=11, textColor=colors.white, backColor=ALERT_RED,
            alignment=TA_CENTER, spaceBefore=4, spaceAfter=12,
            fontName='Helvetica-Bold'
        )
        elements.append(Paragraph(
            f"⚠️ DETECTED WITHIN PROTECTED AREA: {props.get('protected_area_name', 'Unknown')}",
            alert_style
        ))
    
    # ── Patch Summary Table ──
    elements.append(Paragraph("Detection Summary", section_style))
    
    severity_color = {
        "critical": ALERT_RED,
        "high": colors.HexColor("#E65100"),
        "medium": ACCENT_GOLD,
        "low": colors.HexColor("#4CAF50")
    }
    sev = props.get("severity", "medium")
    
    summary_data = [
        ["Patch ID", props.get("patch_id", "N/A")],
        ["Detection Date", props.get("detection_date", "N/A")],
        ["Coordinates", f"{avg_lat:.4f}°N, {avg_lng:.4f}°E"],
        ["Area Lost", f"{props.get('area_ha', 0):.1f} hectares"],
        ["Cause Classification", props.get("cause", "unknown").replace("_", " ").title()],
        ["Severity", sev.upper()],
        ["Confidence", f"{props.get('confidence', 0) * 100:.0f}%"],
        ["NDVI Before", f"{props.get('ndvi_before', 0):.2f}"],
        ["NDVI After", f"{props.get('ndvi_after', 0):.2f}"],
        ["NDVI Change", f"{props.get('ndvi_after', 0) - props.get('ndvi_before', 0):.2f}"],
    ]
    
    summary_table = Table(summary_data, colWidths=[5*cm, 12*cm])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GREEN),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (-1, -1), DARK_GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#C8E6C9")),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 16))
    
    # ── Protected Area Status ──
    elements.append(Paragraph("Protected Area Status", section_style))
    if props.get("in_protected_area"):
        pa_data = [
            ["Protected Area", props.get("protected_area_name", "N/A")],
            ["WDPA ID", props.get("wdpa_id", "N/A")],
            ["Legal Status", "POTENTIAL VIOLATION — Investigation Required"],
        ]
    else:
        pa_data = [
            ["Protected Area", "Not within designated protected area"],
            ["Legal Status", "Outside WDPA boundaries"],
        ]
    
    pa_table = Table(pa_data, colWidths=[5*cm, 12*cm])
    pa_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GREEN),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (-1, -1), DARK_GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#C8E6C9")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(pa_table)
    elements.append(Spacer(1, 16))
    
    # ── Carbon Impact ──
    elements.append(Paragraph("Carbon Impact Assessment", section_style))
    carbon_data = [
        ["Carbon Loss", f"{carbon.carbon_loss_tco2:,.1f} tonnes CO₂"],
        ["Emission Factor", f"{carbon.emission_factor_tco2_per_ha} tCO₂/ha"],
        ["Estimated Value", f"${carbon.carbon_value_usd:,.2f} USD"],
        ["Credit Price", f"${carbon.credit_price_usd}/tCO₂"],
    ]
    
    carbon_table = Table(carbon_data, colWidths=[5*cm, 12*cm])
    carbon_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GREEN),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (-1, -1), DARK_GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#C8E6C9")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(carbon_table)
    elements.append(Spacer(1, 16))
    
    # ── Notes ──
    if props.get("notes"):
        elements.append(Paragraph("Analysis Notes", section_style))
        elements.append(Paragraph(props["notes"], body_style))
        elements.append(Spacer(1, 16))
    
    # ── Integrity Verification ──
    elements.append(HRFlowable(width="100%", thickness=1, color=FOREST_GREEN))
    elements.append(Spacer(1, 8))
    elements.append(Paragraph("Document Integrity", section_style))
    
    hash_style = ParagraphStyle(
        'Hash', parent=styles['Normal'],
        fontSize=8, textColor=DARK_GRAY,
        fontName='Courier', spaceAfter=4
    )
    
    elements.append(Paragraph(f"SHA-256 Hash: {record_hash}", hash_style))
    elements.append(Paragraph(f"Generated: {generation_time}", hash_style))
    elements.append(Paragraph(
        "This report was auto-generated by MangroveWatch satellite detection system. "
        "The SHA-256 hash can be used to verify the integrity of the detection record.",
        body_style
    ))
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer
