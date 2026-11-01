# 🌿 MangroveWatch

**Sentinel-2 Satellite Mangrove Loss Detection, Legal Evidence Generation & Ground-Truthing Platform**

MangroveWatch is a full-stack environmental monitoring platform built to protect mangrove ecosystems — starting with the UNESCO World Heritage Sundarbans Biosphere Reserve. It automatically identifies deforestation from Sentinel-2 optical imagery, flags violations in protected sanctuaries, quantifies carbon loss in metric tonnes of CO2, generates court-admissible legal evidence dossiers with SHA-256 integrity verification, and connects community eyewitness reports directly to satellite observations.

---

## 🏛️ Strict Decoupled Architecture

The system is strictly partitioned into two independent applications:

```
mangrove/
├── mangrovewatch-backend/      # FastAPI REST API (Python)
│   ├── data/                   # Sundarbans GeoJSON polygons & mock data
│   ├── models/                 # Pydantic schemas & response contracts
│   ├── pipeline/               # NDVI, change detection, U-Net classification
│   ├── routers/                # Detection, Reports, Alerts, Auth, Citizen
│   ├── services/               # Carbon estimation, Evidence PDF, Notifications
│   ├── config.py               # Pydantic Settings
│   ├── main.py                 # FastAPI application & CORS config
│   ├── Procfile & render.yaml  # Render deployment configs
│   └── requirements.txt
│
└── mangrovewatch-frontend/     # React + Vite + Leaflet Web Platform
    ├── public/                 # Static assets & favicon
    ├── src/
    │   ├── api.js              # Centralized fetch module (VITE_API_URL)
    │   ├── App.jsx             # Shell & tab routing
    │   ├── index.css           # Premium Dark Forest design system
    │   ├── components/         # MapView, TimeLapse, StatsPanel, AlertsPanel...
    │   └── hooks/              # useAuth context & token storage
    ├── index.html              # Leaflet & font dependencies
    ├── vercel.json             # Vercel SPA rewrite rules
    └── package.json
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup (`FastAPI`)

```bash
cd mangrovewatch-backend

# 1. Create and activate a virtual environment (optional)
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate # Linux/macOS

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
copy .env.example .env

# 4. Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- API Base URL: `http://localhost:8000`
- Interactive OpenAPI / Swagger UI: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 2. Frontend Setup (`React + Vite`)

```bash
cd mangrovewatch-frontend

# 1. Install dependencies
npm install

# 2. Configure environment
copy .env.example .env
# Ensure VITE_API_URL=http://localhost:8000

# 3. Start development server
npm run dev
```

- Frontend URL: `http://localhost:5173`

---

## 🌿 Key Features

| Feature | Description |
| :--- | :--- |
| **Sentinel-2 Remote Sensing** | Evaluates dual-date NDVI indices and detects rapid canopy cover loss, filtering out tidal fluctuations, water turbidities, and cloud shadows. |
| **Protected Sanctuaries** | Shapely polygon intersection identifies encroachments into the Sundarbans East, West, and South Wildlife Sanctuaries (WDPA status). |
| **Blue Carbon Accounting** | Computes committed CO2 emissions using the standard IPCC factor of **450 tCO2 / hectare**, plus voluntary carbon market valuation. |
| **Tamper-Proof Evidence PDF** | Generates a 2-page court-ready ReportLab dossier with Sentinel-2 coordinate stamps, violation notices, and a SHA-256 integrity hash. |
| **Real-time Threat Queue** | Automatic alert ranking based on severity, loss velocity, and sanctuary sensitivity with simulated or Twilio/SMTP dispatch. |
| **Community Ground-Truthing** | Ranger/citizen reporting with automatic EXIF metadata scrubbing for whistleblower safety and automated coordinate cross-matching against satellite patches. |
| **Decadal Timelapse Player** | Smooth slider and playback control traversing forest loss and cumulative canopy destruction from 2016 through present. |

---

## 🔐 Authentication & Officer Privileges

- Officer Secret Token (default preset for evaluation): `mangrovewatch-officer-secret-2024`
- Unauthenticated visitors can view public metrics, inspect map layers, play timelapses, download PDF evidence packages, and submit citizen eyewitness reports.
- Authenticated officers gain the ability to **acknowledge active alerts**, **dispatch patrol notifications**, and **confirm/reject community reports**.

---

## ☁️ Production Deployment

### Backend (Render)
- Deploy as a Web Service using the provided `render.yaml` or `Procfile`.
- Set Environment Variables:
  - `ALLOWED_ORIGINS`: `https://mangrovewatch.vercel.app`
  - `USE_MOCK_DATA`: `true` (or supply Google Earth Engine credentials)
  - `OFFICER_TOKEN`: Strong random token

### Frontend (Vercel)
- Deploy using the provided `vercel.json` (for SPA rewrites).
- Set Environment Variable:
  - `VITE_API_URL`: `https://mangrovewatch-api.onrender.com`
