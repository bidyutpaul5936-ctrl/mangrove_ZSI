import React, { useState, useEffect } from 'react';
import {
  Satellite,
  Layers,
  Calendar,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Scale,
  Download,
  AlertTriangle,
  TreeDeciduous,
  Leaf,
  Compass,
  Eye,
  Maximize2,
  CheckCircle2
} from 'lucide-react';
import MapView from './MapView';
import { LOSS_PATCHES_GEOJSON } from '../data/mockData';
import { downloadEvidencePDF } from '../api';

export default function SatelliteView({ onSelectDossier }) {
  const [selectedBand, setSelectedBand] = useState('rgb'); // 'rgb', 'nir', 'ndvi'
  const [selectedYear, setSelectedYear] = useState(2026);
  const [isPlaying, setIsPlaying] = useState(false);
  const [basemap, setBasemap] = useState('satellite');
  const [activePatch, setActivePatch] = useState(LOSS_PATCHES_GEOJSON.features[0].properties);
  const [flyToCoords, setFlyToCoords] = useState({ lat: 21.71, lng: 89.13 });
  const [downloading, setDownloading] = useState(false);

  // Time-lapse auto-play simulation
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setSelectedYear((prev) => {
          if (prev >= 2026) return 2016;
          return prev + 1;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleSelectPatch = (patch) => {
    setActivePatch(patch);
    // Find coords
    const feature = LOSS_PATCHES_GEOJSON.features.find(
      (f) => f.properties.patch_id === patch.patch_id
    );
    if (feature && feature.geometry && feature.geometry.coordinates) {
      const c = feature.geometry.coordinates[0][0];
      setFlyToCoords({ lat: c[1], lng: c[0] });
    }
  };

  const handleDownloadDossier = async () => {
    setDownloading(true);
    try {
      await downloadEvidencePDF(activePatch.patch_id);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="view-page-container satellite-studio-page">
      {/* ── Studio Top Toolbar ── */}
      <div className="satellite-toolbar-card">
        <div className="toolbar-left">
          <div className="studio-badge">
            <Satellite size={16} />
            <span>SENTINEL-2 MSI STUDIO</span>
          </div>

          {/* Spectral Band Selector */}
          <div className="band-selector-group">
            <span className="selector-label">Spectral Composites:</span>
            <div className="band-pills">
              <button
                type="button"
                className={`band-pill ${selectedBand === 'rgb' ? 'active' : ''}`}
                onClick={() => setSelectedBand('rgb')}
                title="True Color Composite (B04, B03, B02) - Natural visual reflectance"
              >
                🌿 Natural RGB (B4-B3-B2)
              </button>
              <button
                type="button"
                className={`band-pill ${selectedBand === 'nir' ? 'active' : ''}`}
                onClick={() => setSelectedBand('nir')}
                title="Color Infrared / NIR (B08, B04, B03) - Dense canopy reflects bright magenta"
              >
                🍁 False-Color NIR (B8-B4-B3)
              </button>
              <button
                type="button"
                className={`band-pill ${selectedBand === 'ndvi' ? 'active' : ''}`}
                onClick={() => setSelectedBand('ndvi')}
                title="Normalized Difference Vegetation Index heat analysis"
              >
                🔬 NDVI Index Heatmap
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar Right: Basemap Selector */}
        <div className="toolbar-right">
          <div className="basemap-group">
            <button
              type="button"
              className={`tool-base-btn ${basemap === 'satellite' ? 'active' : ''}`}
              onClick={() => setBasemap('satellite')}
            >
              High-Res Imagery
            </button>
            <button
              type="button"
              className={`tool-base-btn ${basemap === 'light' ? 'active' : ''}`}
              onClick={() => setBasemap('light')}
            >
              GIS Carto Light
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Studio Layout: Interactive Map + Spectral Telemetry Inspector ── */}
      <div className="satellite-layout-grid">
        {/* Main Leaflet Map Viewer */}
        <div className="satellite-map-container">
          <MapView
            layers={{
              extent: true,
              lossPatches: true,
              protectedAreas: true,
              citizenReports: false,
              heatmap: selectedBand === 'ndvi',
            }}
            basemap={basemap}
            selectedYear={selectedYear}
            flyToCoords={flyToCoords}
          />

          {/* Bottom Floating Time-Lapse Scrubber */}
          <div className="satellite-timelapse-bar">
            <div className="timelapse-controls">
              <button
                type="button"
                className="play-pause-btn"
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? 'Pause Animation' : 'Play Historical Timelapse'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                type="button"
                className="reset-btn"
                onClick={() => setSelectedYear(2016)}
                title="Reset to 2016 Baseline"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            <div className="timelapse-slider-wrapper">
              <div className="slider-labels">
                <span>2016 (Baseline)</span>
                <span className="current-year-badge">Current Frame: {selectedYear}</span>
                <span>2026 (Live Surveillance)</span>
              </div>
              <input
                type="range"
                min="2016"
                max="2026"
                step="1"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="timelapse-range"
              />
            </div>
          </div>
        </div>

        {/* Right Drawer: Spectral Patch Telemetry Inspector */}
        <aside className="spectral-inspector-card">
          <div className="inspector-header">
            <div className="badge-crypto">
              <Scale size={14} />
              <span>FORENSIC INSPECTOR</span>
            </div>
            <h3>Spectral Degradation Profile</h3>
            <p className="inspector-caption">Target: {activePatch.patch_id}</p>
          </div>

          {/* Patch Selector Dropdown */}
          <div className="patch-select-box">
            <label htmlFor="patch-select">Select Analyzed Incident:</label>
            <select
              id="patch-select"
              value={activePatch.patch_id}
              onChange={(e) => {
                const found = LOSS_PATCHES_GEOJSON.features.find(
                  (f) => f.properties.patch_id === e.target.value
                );
                if (found) handleSelectPatch(found.properties);
              }}
              className="patch-dropdown"
            >
              {LOSS_PATCHES_GEOJSON.features.map((f) => (
                <option key={f.properties.patch_id} value={f.properties.patch_id}>
                  {f.properties.patch_id} · {f.properties.protected_area_name} ({f.properties.area_ha} ha)
                </option>
              ))}
            </select>
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="telemetry-stat-grid">
            <div className="telemetry-stat">
              <span className="stat-label">Canopy Deforested</span>
              <span className="stat-val danger-text">{activePatch.area_ha} ha</span>
            </div>
            <div className="telemetry-stat">
              <span className="stat-label">Carbon Stock Loss</span>
              <span className="stat-val font-mono">
                {activePatch.carbon_loss_tco2.toLocaleString()} tCO₂
              </span>
            </div>
            <div className="telemetry-stat">
              <span className="stat-label">Root Cause Classification</span>
              <span className="stat-val capitalize">
                {(activePatch.cause || 'pond_conversion').replace(/_/g, ' ')}
              </span>
            </div>
            <div className="telemetry-stat">
              <span className="stat-label">Model Confidence</span>
              <span className="stat-val success-text">
                {((activePatch.confidence || 0.94) * 100).toFixed(1)}% (XGBoost)
              </span>
            </div>
          </div>

          {/* Spectral NDVI Curve Visualization */}
          <div className="ndvi-curve-box">
            <div className="ndvi-header">
              <span>NDVI Surface Reflectance Drop</span>
              <span className="ndvi-drop-badge">-85.5% Degradation</span>
            </div>
            <div className="ndvi-bars-comparison">
              <div className="ndvi-bar-col">
                <span className="ndvi-year">Before (Pre-loss)</span>
                <div className="bar-outer">
                  <div
                    className="bar-inner healthy"
                    style={{ height: `${(activePatch.ndvi_before || 0.76) * 100}%` }}
                  ></div>
                </div>
                <span className="ndvi-score">{activePatch.ndvi_before || 0.76}</span>
              </div>

              <div className="ndvi-bar-col">
                <span className="ndvi-year">After (Detected)</span>
                <div className="bar-outer">
                  <div
                    className="bar-inner degraded"
                    style={{ height: `${(activePatch.ndvi_after || 0.11) * 100}%` }}
                  ></div>
                </div>
                <span className="ndvi-score danger">{activePatch.ndvi_after || 0.11}</span>
              </div>
            </div>
          </div>

          {/* Notes & WDPA info */}
          <div className="inspector-info-note">
            <p>
              <strong>Sanctuary Jurisdiction:</strong> {activePatch.protected_area_name}
            </p>
            <p className="subtext">{activePatch.notes}</p>
          </div>

          {/* Action Buttons */}
          <div className="inspector-actions">
            <button
              type="button"
              className="btn btn-primary btn-full"
              onClick={() => onSelectDossier(activePatch)}
            >
              <Scale size={15} />
              <span>Inspect Legal Dossier</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-full"
              onClick={handleDownloadDossier}
              disabled={downloading}
            >
              <Download size={15} />
              <span>{downloading ? 'Compiling PDF...' : 'Download Court Evidence PDF'}</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
