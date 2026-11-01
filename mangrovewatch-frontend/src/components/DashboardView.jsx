import React, { useState, useEffect } from 'react';
import {
  TreeDeciduous,
  Leaf,
  AlertTriangle,
  Scale,
  TrendingUp,
  Compass,
  Layers,
  Shield,
  ArrowUpRight,
  ExternalLink,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  Eye,
  BrainCircuit,
  Waves
} from 'lucide-react';
import MapView from './MapView';
import { getDashboardStats, getAlerts, acknowledgeAlert, downloadEvidencePDF } from '../api';

export default function DashboardView({
  onNavigateToSatellite,
  onNavigateToUnet,
  onNavigateToLegal,
  onNavigateToCommunity,
  onSelectDossier
}) {
  const [stats, setStats] = useState({
    total_loss_ha: 1428.5,
    total_carbon_loss_tco2: 642825.0,
    active_violations: 14,
    verified_dossiers: 38,
  });

  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [alertFilter, setAlertFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [flyToCoords, setFlyToCoords] = useState(null);
  const [mapLayers, setMapLayers] = useState({
    extent: true,
    lossPatches: true,
    protectedAreas: true,
    citizenReports: true,
    heatmap: false,
  });
  const [basemap, setBasemap] = useState('light');

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, alertsData] = await Promise.all([
          getDashboardStats().catch(() => null),
          getAlerts().catch(() => []),
        ]);
        if (statsData) setStats(statsData);
        if (alertsData) setAlerts(alertsData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoadingAlerts(false);
      }
    }
    loadData();
  }, []);

  const handleAcknowledge = async (e, alertId) => {
    e.stopPropagation();
    try {
      await acknowledgeAlert(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'acknowledged' } : a))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleAlertClick = (alertItem) => {
    setSelectedAlert(alertItem);
    // Approximate coordinates based on patch
    if (alertItem.patch_id === 'MW-2026-089A') {
      setFlyToCoords({ lat: 21.71, lng: 89.13 });
    } else if (alertItem.patch_id === 'MW-2026-074C') {
      setFlyToCoords({ lat: 21.63, lng: 89.40 });
    } else {
      setFlyToCoords({ lat: 21.62, lng: 89.70 });
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (alertFilter === 'all') return true;
    return a.severity === alertFilter;
  });

  return (
    <div className="view-page-container">
      {/* ── 1. Top KPI Metric Cards ── */}
      <section className="metric-cards-grid" aria-label="System Metrics">
        {/* Metric 1: Total Hectares Deforested */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Total Deforested Area</span>
            <div className="metric-icon-box danger-light">
              <TreeDeciduous size={18} className="icon-danger" />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-number">{stats.total_loss_ha.toLocaleString()}</span>
            <span className="metric-unit">ha</span>
          </div>
          <div className="metric-footer">
            <span className="metric-delta negative">
              <TrendingUp size={13} /> +42.3 ha
            </span>
            <span className="metric-caption">Sentinel-2 canopy delta Q3</span>
          </div>
        </div>

        {/* Metric 2: Estimated CO2 Loss */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Estimated CO₂ Loss</span>
            <div className="metric-icon-box warning-light">
              <Leaf size={18} className="icon-warning" />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-number">
              {(stats.total_carbon_loss_tco2 / 1000).toFixed(1)}k
            </span>
            <span className="metric-unit">tCO₂e</span>
          </div>
          <div className="metric-footer">
            <span className="metric-delta neutral">~450 tCO₂/ha</span>
            <span className="metric-caption">Blue carbon biomass benchmark</span>
          </div>
        </div>

        {/* Metric 3: Active Sanctuary Violations */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Sanctuary Violations</span>
            <div className="metric-icon-box critical-light">
              <AlertTriangle size={18} className="icon-critical" />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-number">{stats.active_violations}</span>
            <span className="metric-unit">Active</span>
          </div>
          <div className="metric-footer">
            <span className="metric-delta critical-tag">100% UNESCO/WDPA</span>
            <span className="metric-caption">Requires urgent ranger dispatch</span>
          </div>
        </div>

        {/* Metric 4: Verified Legal Dossiers */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Court-Ready Dossiers</span>
            <div className="metric-icon-box success-light">
              <Scale size={18} className="icon-success" />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-number">{stats.verified_dossiers}</span>
            <span className="metric-unit">Verified</span>
          </div>
          <div className="metric-footer">
            <span className="metric-delta positive">
              <CheckCircle2 size={13} /> 100% SHA-256
            </span>
            <span className="metric-caption">Court-admissible custody chain</span>
          </div>
        </div>
      </section>

      {/* ── ✨ U-Net Deep Learning & Cyclone Bio-Shield Launcher Banner ── */}
      {onNavigateToUnet && (
        <section className="unet-feature-callout-banner">
          <div className="banner-content-left">
            <div className="banner-pill">
              <BrainCircuit size={14} className="pulse-icon" />
              <span>AI ML DEEP LEARNING MODEL</span>
            </div>
            <h3>U-Net Satellite Image Analysis &amp; Cyclone Bio-Shield Simulator</h3>
            <p>
              Perform pixel-level multi-spectral canopy loss segmentation (Sentinel-2 10m) and simulate how much storm surge wave force an intact mangrove forest prevents during tropical cyclones.
            </p>
          </div>
          <div className="banner-content-right">
            <button
              type="button"
              className="btn btn-primary btn-lg banner-launch-btn"
              onClick={onNavigateToUnet}
            >
              <Waves size={16} />
              <span>Launch U-Net &amp; Cyclone Simulator</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </section>
      )}

      {/* ── 2. Responsive Split Grid: Map Telemetry + Enforcement Alerts ── */}
      <div className="dashboard-split-layout">
        {/* Left Column: GIS Map Telemetry Studio */}
        <section className="dashboard-map-section">
          <div className="gis-container-card">
            {/* GIS Card Header */}
            <div className="gis-card-header">
              <div className="gis-title-group">
                <div className="gis-badge">
                  <Compass size={14} />
                  <span>GIS TELEMETRY</span>
                </div>
                <h3>Sundarbans Biosphere Surveillance Grid</h3>
              </div>

              {/* Layer & Basemap Quick Controls */}
              <div className="gis-quick-controls">
                <button
                  type="button"
                  className={`gis-toggle-btn ${mapLayers.lossPatches ? 'active' : ''}`}
                  onClick={() =>
                    setMapLayers((prev) => ({ ...prev, lossPatches: !prev.lossPatches }))
                  }
                  title="Toggle Satellite Loss Patches"
                >
                  <span className="toggle-dot dot-loss"></span>
                  <span>Loss Patches</span>
                </button>

                <button
                  type="button"
                  className={`gis-toggle-btn ${mapLayers.protectedAreas ? 'active' : ''}`}
                  onClick={() =>
                    setMapLayers((prev) => ({ ...prev, protectedAreas: !prev.protectedAreas }))
                  }
                  title="Toggle Protected Sanctuaries"
                >
                  <span className="toggle-dot dot-pa"></span>
                  <span>Sanctuaries</span>
                </button>

                <button
                  type="button"
                  className={`gis-toggle-btn ${mapLayers.citizenReports ? 'active' : ''}`}
                  onClick={() =>
                    setMapLayers((prev) => ({ ...prev, citizenReports: !prev.citizenReports }))
                  }
                  title="Toggle Eyewitness Ground Pins"
                >
                  <span className="toggle-dot dot-pins"></span>
                  <span>Eyewitness</span>
                </button>

                <div className="basemap-pill-toggle">
                  <button
                    type="button"
                    className={`base-pill ${basemap === 'light' ? 'active' : ''}`}
                    onClick={() => setBasemap('light')}
                  >
                    Terrain
                  </button>
                  <button
                    type="button"
                    className={`base-pill ${basemap === 'satellite' ? 'active' : ''}`}
                    onClick={() => setBasemap('satellite')}
                  >
                    Satellite
                  </button>
                </div>
              </div>
            </div>

            {/* GIS Interactive Leaflet Canvas */}
            <div className="gis-map-viewport">
              <MapView
                layers={mapLayers}
                basemap={basemap}
                selectedYear={2026}
                flyToCoords={flyToCoords}
              />

              {/* Coordinate HUD Telemetry Overlay (Bottom Left of Map) */}
              <div className="gis-hud-telemetry">
                <div className="hud-item">
                  <span className="hud-label">SURVEILLANCE SECTOR:</span>
                  <span className="hud-val font-mono">21.4°N — 22.2°N · 88.8°E — 89.9°E</span>
                </div>
                <div className="hud-divider"></div>
                <div className="hud-item">
                  <span className="hud-label">SENSOR:</span>
                  <span className="hud-val">Sentinel-2B MSI (10m L2A)</span>
                </div>
                <div className="hud-divider"></div>
                <div className="hud-item">
                  <span className="hud-label">LAST ORBIT:</span>
                  <span className="hud-val">Today, 04:12 UTC (Cloud: 1.2%)</span>
                </div>
              </div>
            </div>

            {/* Card Footer Bar */}
            <div className="gis-card-footer">
              <span className="footer-note">
                💡 Tip: Click any detected loss polygon or marker to view instant spectral indices and download court-admissible dossiers.
              </span>
              <button
                type="button"
                className="gis-launch-studio-btn"
                onClick={onNavigateToSatellite}
              >
                <span>Launch Full Satellite Studio</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: Alerts & Violation Stream */}
        <section className="dashboard-alerts-section">
          {/* Card: Real-Time Violation Stream */}
          <div className="alerts-card">
            <div className="alerts-card-header">
              <div className="alerts-title-box">
                <div className="pulse-danger-beacon"></div>
                <h3>Active Sentinel-2 Alerts</h3>
              </div>

              {/* Severity Filter Pills */}
              <div className="filter-pill-group">
                <button
                  type="button"
                  className={`filter-pill ${alertFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setAlertFilter('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`filter-pill ${alertFilter === 'critical' ? 'active' : ''}`}
                  onClick={() => setAlertFilter('critical')}
                >
                  Critical
                </button>
                <button
                  type="button"
                  className={`filter-pill ${alertFilter === 'high' ? 'active' : ''}`}
                  onClick={() => setAlertFilter('high')}
                >
                  High
                </button>
              </div>
            </div>

            {/* Alerts Scrollable Stream */}
            <div className="alerts-stream-body">
              {loadingAlerts ? (
                <div className="skeleton-container">
                  <div className="skeleton-line" style={{ height: '70px' }}></div>
                  <div className="skeleton-line" style={{ height: '70px' }}></div>
                  <div className="skeleton-line" style={{ height: '70px' }}></div>
                </div>
              ) : filteredAlerts.length === 0 ? (
                <div className="empty-state">
                  <Shield size={28} className="empty-icon" />
                  <p>No active alerts matching filter criteria.</p>
                </div>
              ) : (
                filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`alert-item-card ${alert.severity} ${
                      selectedAlert?.id === alert.id ? 'selected' : ''
                    }`}
                    onClick={() => handleAlertClick(alert)}
                  >
                    <div className="alert-item-top">
                      <div className="alert-meta-left">
                        <span className={`severity-tag ${alert.severity}`}>
                          {alert.severity}
                        </span>
                        <span className="alert-patch-code font-mono">{alert.patch_id}</span>
                      </div>
                      <span className="alert-date">
                        {alert.created_at ? new Date(alert.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <div className="alert-zone-title">
                      <MapPin size={13} className="zone-icon" />
                      <span>{alert.protected_area_name}</span>
                    </div>

                    <p className="alert-description">{alert.message}</p>

                    <div className="alert-item-actions">
                      <div className="alert-stat-tags">
                        <span className="stat-tag">📐 {alert.area_ha || 12.5} ha</span>
                        <span className="stat-tag">
                          🔬 {(alert.cause || 'illegal_clearing').replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="action-buttons-row">
                        <button
                          type="button"
                          className="btn-action-ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDossier({ patch_id: alert.patch_id });
                          }}
                          title="Open Verified Legal Dossier"
                        >
                          <Scale size={13} />
                          <span>Dossier</span>
                        </button>
                        {alert.status !== 'acknowledged' ? (
                          <button
                            type="button"
                            className="btn-action-primary"
                            onClick={(e) => handleAcknowledge(e, alert.id)}
                            title="Acknowledge & Record Incident"
                          >
                            <CheckCircle2 size={13} />
                            <span>Ack</span>
                          </button>
                        ) : (
                          <span className="acknowledged-tag">
                            <CheckCircle2 size={12} /> Logged
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Cause Breakdown Analytics Widget */}
          <div className="cause-breakdown-card">
            <h4>Canopy Degradation By Root Cause</h4>
            <div className="cause-progress-list">
              <div className="cause-item">
                <div className="cause-header">
                  <span>🦐 Aquaculture &amp; Shrimp Dykes</span>
                  <strong>52% (742.8 ha)</strong>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill fill-blue" style={{ width: '52%' }}></div>
                </div>
              </div>

              <div className="cause-item">
                <div className="cause-header">
                  <span>🌊 Tidal Erosion &amp; Cyclone Surges</span>
                  <strong>28% (399.9 ha)</strong>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill fill-amber" style={{ width: '28%' }}></div>
                </div>
              </div>

              <div className="cause-item">
                <div className="cause-header">
                  <span>🪓 Illegal Timber Extraction</span>
                  <strong>20% (285.8 ha)</strong>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill fill-red" style={{ width: '20%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
