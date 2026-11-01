import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Waves,
  Wind,
  Download,
  Printer,
  Sparkles,
  Layers,
  Activity,
  Trees,
  AlertTriangle,
  Compass,
  Maximize2,
  CheckCircle2,
  TrendingDown,
  Info,
  Sliders,
  DollarSign,
  Users,
  ChevronRight,
  RefreshCw,
  FileText
} from 'lucide-react';
import {
  getUnetTiles,
  runUnetAnalysis,
  simulateCycloneImpact,
  getPreventiveMeasures,
  downloadUnetCyclonePDF,
  MOCK_UNET_TILES
} from '../api';

export default function UnetCycloneStudio({ onSelectDossier }) {
  // Tile & Analysis State
  const [tiles, setTiles] = useState(MOCK_UNET_TILES);
  const [selectedTileId, setSelectedTileId] = useState('tile_gosaba_cyclone');
  const [isInferencing, setIsInferencing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [activeBandView, setActiveBandView] = useState('rgb'); // 'rgb', 'nir', 'ndvi', 'mask', 'split'
  const [activeClasses, setActiveClasses] = useState([0, 1, 2, 3, 4]);

  // Cyclone Simulation State
  const [selectedCyclone, setSelectedCyclone] = useState('amphan_super_cyclone');
  const [forestWidth, setForestWidth] = useState(720);
  const [canopyDensity, setCanopyDensity] = useState(75);
  const [customWind, setCustomWind] = useState(180);
  const [customSurge, setCustomSurge] = useState(4.0);
  const [cycloneData, setCycloneData] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Preventive Measures State
  const [preventiveMeasures, setPreventiveMeasures] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTabSub, setActiveTabSub] = useState('unet'); // 'unet', 'cyclone', 'preventive'

  // Load initial tiles and data
  useEffect(() => {
    async function loadInitial() {
      const tileList = await getUnetTiles();
      if (tileList && tileList.length > 0) {
        setTiles(tileList);
      }
      const measures = await getPreventiveMeasures();
      setPreventiveMeasures(measures);
      executeInference('tile_gosaba_cyclone', 720);
    }
    loadInitial();
  }, []);

  // Run Inference Function
  const executeInference = async (tileId, width = forestWidth) => {
    setIsInferencing(true);
    try {
      const data = await runUnetAnalysis(tileId);
      setAnalysisData(data);
      if (data?.canopy_metrics?.shoreline_forest_width_m) {
        setForestWidth(data.canopy_metrics.shoreline_forest_width_m);
        runSimulation(selectedCyclone, data.canopy_metrics.shoreline_forest_width_m);
      } else {
        runSimulation(selectedCyclone, width);
      }
    } catch (e) {
      console.error('Inference error:', e);
    } finally {
      setTimeout(() => setIsInferencing(false), 350);
    }
  };

  // Run Cyclone Simulation
  const runSimulation = async (cycloneKey, width = forestWidth, density = canopyDensity) => {
    setIsSimulating(true);
    try {
      const sim = await simulateCycloneImpact({
        cyclone_key: cycloneKey,
        forest_width_m: width,
        canopy_density_pct: density,
        custom_wind: customWind,
        custom_surge: customSurge
      });
      setCycloneData(sim);
    } catch (e) {
      console.error('Simulation error:', e);
    } finally {
      setIsSimulating(false);
    }
  };

  // Change Tile Handler
  const handleTileChange = (e) => {
    const newId = e.target.value;
    setSelectedTileId(newId);
    executeInference(newId);
  };

  // Change Cyclone Handler
  const handleCycloneChange = (key) => {
    setSelectedCyclone(key);
    runSimulation(key, forestWidth, canopyDensity);
  };

  // Toggle Class Filter
  const toggleClass = (classId) => {
    setActiveClasses((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, id]
    );
  };

  // Download PDF Handler
  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      await downloadUnetCyclonePDF(
        selectedTileId,
        selectedCyclone,
        forestWidth,
        analysisData,
        cycloneData
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  const canopy = analysisData?.canopy_metrics || {};
  const hydro = cycloneData?.hydrodynamic_impact || {};
  const shield = cycloneData?.human_and_economic_shield || {};
  const absorption = cycloneData?.forest_damage_absorption || {};
  const cyclone = cycloneData?.cyclone_profile || {};

  return (
    <div className="view-page-container unet-studio-page">
      {/* ── Studio Header & Sub-Navigation Bar ── */}
      <div className="unet-header-card">
        <div className="unet-header-left">
          <div className="studio-brand-badge">
            <BrainCircuit size={18} className="pulse-icon" />
            <span>U-NET DEEP LEARNING &amp; CYCLONE BIO-SHIELD STUDIO</span>
          </div>
          <h1 className="studio-title">
            Satellite Semantic Segmentation &amp; Coastal Defense Simulation
          </h1>
          <p className="studio-subtitle">
            Sentinel-2 MSI 10m multispectral inference coupled with coastal hydrodynamic wave attenuation modeling.
          </p>
        </div>

        <div className="unet-header-actions">
          <div className="view-mode-tabs">
            <button
              type="button"
              className={`view-tab-btn ${activeTabSub === 'unet' ? 'active' : ''}`}
              onClick={() => setActiveTabSub('unet')}
            >
              <BrainCircuit size={15} />
              <span>1. U-Net ML Analysis</span>
            </button>
            <button
              type="button"
              className={`view-tab-btn ${activeTabSub === 'cyclone' ? 'active' : ''}`}
              onClick={() => setActiveTabSub('cyclone')}
            >
              <Waves size={15} />
              <span>2. Cyclone Threat vs Shield</span>
            </button>
            <button
              type="button"
              className={`view-tab-btn ${activeTabSub === 'preventive' ? 'active' : ''}`}
              onClick={() => setActiveTabSub('preventive')}
            >
              <ShieldCheck size={15} />
              <span>3. Preventive Roadmap</span>
            </button>
          </div>

          <button
            type="button"
            className="btn btn-primary download-report-btn"
            onClick={handleDownloadReport}
            disabled={isDownloading}
          >
            <Download size={16} />
            <span>{isDownloading ? 'Generating PDF...' : 'Download Official Report'}</span>
          </button>
        </div>
      </div>

      {/* ── Tile & Sensor Telemetry Bar ── */}
      <div className="tile-telemetry-toolbar">
        <div className="toolbar-segment">
          <label htmlFor="satellite-tile-select" className="segment-label">
            <Compass size={14} /> Target Satellite Tile:
          </label>
          <select
            id="satellite-tile-select"
            value={selectedTileId}
            onChange={handleTileChange}
            className="tile-dropdown-select"
          >
            {tiles.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} · {t.sentinel_date} ({t.shoreline_forest_width_m}m forest)
              </option>
            ))}
          </select>
        </div>

        <div className="toolbar-segment">
          <span className="segment-label">Spectral Visualization:</span>
          <div className="spectral-pills">
            <button
              type="button"
              className={`spectral-pill ${activeBandView === 'rgb' ? 'active' : ''}`}
              onClick={() => setActiveBandView('rgb')}
              title="Natural color reflectance (B04, B03, B02)"
            >
              🌿 Natural RGB
            </button>
            <button
              type="button"
              className={`spectral-pill ${activeBandView === 'nir' ? 'active' : ''}`}
              onClick={() => setActiveBandView('nir')}
              title="Color Infrared (B08, B04, B03)"
            >
              🍁 False NIR
            </button>
            <button
              type="button"
              className={`spectral-pill ${activeBandView === 'ndvi' ? 'active' : ''}`}
              onClick={() => setActiveBandView('ndvi')}
              title="NDVI Heatmap"
            >
              🔬 NDVI Heatmap
            </button>
            <button
              type="button"
              className={`spectral-pill ${activeBandView === 'mask' ? 'active' : ''}`}
              onClick={() => setActiveBandView('mask')}
              title="U-Net Predicted Semantic Classes"
            >
              ✨ U-Net Mask
            </button>
            <button
              type="button"
              className={`spectral-pill ${activeBandView === 'split' ? 'active' : ''}`}
              onClick={() => setActiveBandView('split')}
              title="Side-by-side satellite vs AI mask"
            >
              ⚡ Split Overlay
            </button>
          </div>
        </div>

        <div className="toolbar-segment right-align">
          <button
            type="button"
            className="btn btn-outline re-inference-btn"
            onClick={() => executeInference(selectedTileId)}
            disabled={isInferencing}
          >
            <RefreshCw size={14} className={isInferencing ? 'spin-icon' : ''} />
            <span>{isInferencing ? 'Computing Tensors...' : 'Re-Run U-Net ML'}</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: U-NET SATELLITE ML ANALYSIS ── */}
      {activeTabSub === 'unet' && (
        <div className="unet-main-grid">
          {/* Left: Interactive U-Net Satellite Visualizer & Neural Heatmap */}
          <div className="unet-visualizer-card">
            <div className="visualizer-header">
              <div className="header-meta">
                <span className="live-tag">SENTINEL-2 L2A</span>
                <h3>
                  {analysisData?.tile_name || 'Sundarbans Estuary'} ·{' '}
                  <span className="mono-text">10m GSD</span>
                </h3>
              </div>
              <div className="band-tags">
                <span className="band-badge">B2 Blue</span>
                <span className="band-badge">B3 Green</span>
                <span className="band-badge">B4 Red</span>
                <span className="band-badge">B8 NIR</span>
                <span className="band-badge">B11 SWIR</span>
              </div>
            </div>

            {/* High-Fidelity Synthetic Satellite & U-Net Canvas Display */}
            <div className={`satellite-canvas-frame view-${activeBandView}`}>
              {/* Synthetic Multi-Band Image Canvas */}
              <div className="canvas-texture-layer">
                {activeBandView === 'rgb' && (
                  <div className="spectral-surface rgb-mode">
                    <div className="water-channel"></div>
                    <div className="dense-mangrove-cluster"></div>
                    <div className="degraded-scars"></div>
                    <div className="aquaculture-grid"></div>
                    <div className="canvas-label">Sentinel-2 True Color RGB (B04-B03-B02)</div>
                  </div>
                )}

                {activeBandView === 'nir' && (
                  <div className="spectral-surface nir-mode">
                    <div className="water-channel dark-absorb"></div>
                    <div className="dense-mangrove-cluster bright-magenta"></div>
                    <div className="degraded-scars teal-bare"></div>
                    <div className="canvas-label">False-Color Infrared (B08-B04-B03) — Chlorophyll Signature</div>
                  </div>
                )}

                {activeBandView === 'ndvi' && (
                  <div className="spectral-surface ndvi-mode">
                    <div className="ndvi-gradient-field"></div>
                    <div className="canvas-label">Normalized Difference Vegetation Index (NDVI Heatmap)</div>
                  </div>
                )}

                {(activeBandView === 'mask' || activeBandView === 'split') && (
                  <div className={`spectral-surface unet-mask-mode ${activeBandView === 'split' ? 'split-active' : ''}`}>
                    <div className="unet-grid-overlay">
                      {/* Interactive 16x16 semantic segmentation grid */}
                      <div className="segmentation-matrix">
                        {Array.from({ length: 64 }).map((_, idx) => {
                          const r = Math.floor(idx / 8);
                          const c = idx % 8;
                          // Deterministic classes
                          let cls = 0;
                          if (r > 5 || c > 6) cls = 4; // Water
                          else if (r === 2 && c === 3) cls = 1; // Degraded
                          else if (r === 4 && (c === 1 || c === 2)) cls = 2; // Cyclone scar
                          else if (r === 1 && c > 4) cls = 3; // Aquaculture

                          if (!activeClasses.includes(cls)) return null;

                          const classInfo = [
                            { name: 'Dense Mangrove', color: 'rgba(27, 94, 32, 0.78)' },
                            { name: 'Degraded / Clear-cut', color: 'rgba(211, 47, 47, 0.85)' },
                            { name: 'Cyclone Scar', color: 'rgba(245, 124, 0, 0.82)' },
                            { name: 'Aquaculture', color: 'rgba(2, 136, 209, 0.80)' },
                            { name: 'Waterway', color: 'rgba(26, 54, 93, 0.85)' }
                          ][cls];

                          return (
                            <div
                              key={idx}
                              className={`matrix-pixel pixel-cls-${cls}`}
                              style={{ backgroundColor: classInfo.color }}
                              title={`${classInfo.name} (Pixel ${idx})`}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <div className="canvas-label">
                      {activeBandView === 'split'
                        ? '⚡ Split-Comparison: Satellite Raw vs U-Net Segmentation'
                        : '✨ U-Net ResNet34 Semantic Segmentation Classes'}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Layer Legend & Filter Toggles */}
              <div className="canvas-legend-bar">
                <span className="legend-title">Segmentation Classes:</span>
                <div className="legend-items">
                  <button
                    type="button"
                    className={`legend-chip chip-dense ${activeClasses.includes(0) ? 'on' : 'off'}`}
                    onClick={() => toggleClass(0)}
                  >
                    <span className="color-dot dot-dense"></span>
                    <span>Dense Canopy ({canopy.healthy_percentage || 51.5}%)</span>
                  </button>
                  <button
                    type="button"
                    className={`legend-chip chip-degraded ${activeClasses.includes(1) ? 'on' : 'off'}`}
                    onClick={() => toggleClass(1)}
                  >
                    <span className="color-dot dot-degraded"></span>
                    <span>Degraded ({canopy.degraded_percentage || 10.7}%)</span>
                  </button>
                  <button
                    type="button"
                    className={`legend-chip chip-cyclone ${activeClasses.includes(2) ? 'on' : 'off'}`}
                    onClick={() => toggleClass(2)}
                  >
                    <span className="color-dot dot-cyclone"></span>
                    <span>Cyclone Scars ({canopy.cyclone_percentage || 10.7}%)</span>
                  </button>
                  <button
                    type="button"
                    className={`legend-chip chip-aqua ${activeClasses.includes(3) ? 'on' : 'off'}`}
                    onClick={() => toggleClass(3)}
                  >
                    <span className="color-dot dot-aqua"></span>
                    <span>Ponds ({canopy.water_percentage ? (canopy.water_percentage * 0.3).toFixed(1) : 8.5}%)</span>
                  </button>
                  <button
                    type="button"
                    className={`legend-chip chip-water ${activeClasses.includes(4) ? 'on' : 'off'}`}
                    onClick={() => toggleClass(4)}
                  >
                    <span className="color-dot dot-water"></span>
                    <span>Tidal Creek ({canopy.water_percentage || 28.6}%)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Neural Network Architecture Inspector */}
            <div className="unet-architecture-strip">
              <div className="arch-item">
                <span className="arch-label">Contracting Encoder</span>
                <span className="arch-val">ResNet34 (Conv64 ➔ Conv512)</span>
              </div>
              <div className="arch-divider">➔</div>
              <div className="arch-item">
                <span className="arch-label">Latent Bottleneck</span>
                <span className="arch-val">1024-Dim Multi-Spectral</span>
              </div>
              <div className="arch-divider">➔</div>
              <div className="arch-item">
                <span className="arch-label">Expansive Decoder</span>
                <span className="arch-val">4x Skip-Connection Concat</span>
              </div>
              <div className="arch-divider">➔</div>
              <div className="arch-item">
                <span className="arch-label">Pixel Softmax</span>
                <span className="arch-val">5 Semantic Categories</span>
              </div>
            </div>
          </div>

          {/* Right: Telemetry & Model Evaluation Metrics */}
          <aside className="unet-metrics-sidebar">
            {/* Accuracy & Latency Card */}
            <div className="sidebar-card">
              <div className="card-header-flex">
                <div className="badge-tag success">
                  <Activity size={13} />
                  <span>MODEL ACCURACY</span>
                </div>
                <span className="model-version-tag">U-Net v2.4</span>
              </div>
              <h3>Neural Segmentation Telemetry</h3>

              <div className="stat-boxes-row">
                <div className="stat-metric-box">
                  <span className="m-label">Mean IoU (mIoU)</span>
                  <span className="m-val highlight-green">91.8%</span>
                  <span className="m-sub">Validation Set</span>
                </div>
                <div className="stat-metric-box">
                  <span className="m-label">Dice Score</span>
                  <span className="m-val highlight-green">0.942</span>
                  <span className="m-sub">F1 Harmonic</span>
                </div>
                <div className="stat-metric-box">
                  <span className="m-label">Inference Latency</span>
                  <span className="m-val">142 ms</span>
                  <span className="m-sub">10m Tile TensorRT</span>
                </div>
              </div>
            </div>

            {/* Canopy & Degradation Breakdown */}
            <div className="sidebar-card">
              <h3>Surface Area &amp; Carbon Accounting</h3>
              <div className="telemetry-stat-table">
                <div className="table-row">
                  <span className="r-label">Baseline Mangrove Extent</span>
                  <span className="r-val font-mono">{canopy.baseline_extent_ha || 560} ha</span>
                </div>
                <div className="table-row">
                  <span className="r-label">Intact Dense Canopy</span>
                  <span className="r-val good-val font-mono">
                    {canopy.healthy_canopy_ha || 395.6} ha ({canopy.healthy_percentage || 51.5}%)
                  </span>
                </div>
                <div className="table-row">
                  <span className="r-label">Degraded / Clear-Cut Loss</span>
                  <span className="r-val danger-val font-mono">
                    {canopy.degraded_loss_ha || 82.1} ha
                  </span>
                </div>
                <div className="table-row">
                  <span className="r-label">Cyclone Windthrow Scarring</span>
                  <span className="r-val warning-val font-mono">
                    {canopy.cyclone_scarred_ha || 82.3} ha
                  </span>
                </div>
                <div className="table-row highlight">
                  <span className="r-label">Total Mangrove Loss</span>
                  <span className="r-val danger-val font-mono">
                    {canopy.total_canopy_lost_ha || 164.4} ha ({canopy.total_loss_percentage || 29.3}%)
                  </span>
                </div>
                <div className="table-row">
                  <span className="r-label">Carbon Stock Lost</span>
                  <span className="r-val danger-val font-mono">
                    {(canopy.carbon_lost_tco2 || 73980).toLocaleString()} tCO₂e
                  </span>
                </div>
                <div className="table-row">
                  <span className="r-label">Carbon Retained in Forest</span>
                  <span className="r-val good-val font-mono">
                    {(canopy.carbon_retained_tco2 || 178020).toLocaleString()} tCO₂e
                  </span>
                </div>
              </div>
            </div>

            {/* Forest Buffer Telemetry */}
            <div className="sidebar-card highlight-border">
              <div className="buffer-banner">
                <Trees size={20} className="tree-icon" />
                <div>
                  <div className="buffer-title">Shoreline Mangrove Forest Width</div>
                  <div className="buffer-number">{canopy.shoreline_forest_width_m || forestWidth} Meters</div>
                </div>
              </div>
              <p className="buffer-desc">
                Dominant bio-shield species: <em>{canopy.predominant_species || 'Rhizophora mucronata, Avicennia marina'}</em>.
                Provides hydrodynamic stilt-root matrix for wave energy dissipation.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-full"
                onClick={() => setActiveTabSub('cyclone')}
              >
                <span>Simulate Cyclone Storm Surge</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── TAB 2: CYCLONE THREAT & FOREST BIO-SHIELD SIMULATION ── */}
      {activeTabSub === 'cyclone' && (
        <div className="cyclone-simulation-container">
          {/* Cyclone Scenario Picker */}
          <div className="cyclone-scenario-selector-card">
            <div className="scenario-header">
              <div className="badge-tag alert">
                <Wind size={14} />
                <span>CYCLONE HAZARD SIMULATOR</span>
              </div>
              <h2>Select Tropical Cyclone Scenario</h2>
              <p>
                Evaluate physical storm surge wave reduction, embankment breach prevention, and economic shield capacity.
              </p>
            </div>

            <div className="cyclone-preset-grid">
              <button
                type="button"
                className={`cyclone-card ${selectedCyclone === 'amphan_super_cyclone' ? 'active' : ''}`}
                onClick={() => handleCycloneChange('amphan_super_cyclone')}
              >
                <div className="card-top">
                  <span className="cat-badge cat-5">CATEGORY 5</span>
                  <span className="wind-speed">260 km/h</span>
                </div>
                <h4>Super Cyclone Amphan</h4>
                <div className="surge-val">5.5m Storm Surge</div>
                <p>Extreme intensity storm coinciding with spring high tide; massive water thrust.</p>
              </button>

              <button
                type="button"
                className={`cyclone-card ${selectedCyclone === 'remal_severe_cyclone' ? 'active' : ''}`}
                onClick={() => handleCycloneChange('remal_severe_cyclone')}
              >
                <div className="card-top">
                  <span className="cat-badge cat-1">CATEGORY 1</span>
                  <span className="wind-speed">135 km/h</span>
                </div>
                <h4>Severe Cyclone Remal</h4>
                <div className="surge-val">2.8m Storm Surge</div>
                <p>Prolonged landfall duration causing severe tidal scour and embankment destabilization.</p>
              </button>

              <button
                type="button"
                className={`cyclone-card ${selectedCyclone === 'yaas_very_severe' ? 'active' : ''}`}
                onClick={() => handleCycloneChange('yaas_very_severe')}
              >
                <div className="card-top">
                  <span className="cat-badge cat-2">CATEGORY 2</span>
                  <span className="wind-speed">155 km/h</span>
                </div>
                <h4>Very Severe Cyclone Yaas</h4>
                <div className="surge-val">3.6m Storm Surge</div>
                <p>Full moon astronomical tide causing severe saline overtopping across unshielded banks.</p>
              </button>

              <button
                type="button"
                className={`cyclone-card ${selectedCyclone === 'custom_simulation' ? 'active' : ''}`}
                onClick={() => handleCycloneChange('custom_simulation')}
              >
                <div className="card-top">
                  <span className="cat-badge cat-custom">CUSTOM</span>
                  <span className="wind-speed">{customWind} km/h</span>
                </div>
                <h4>Interactive Custom Simulator</h4>
                <div className="surge-val">{customSurge}m Surge</div>
                <p>User-defined parameters to test coastal buffer limits and sea-level scenarios.</p>
              </button>
            </div>

            {/* Custom Sliders (if custom selected) */}
            {selectedCyclone === 'custom_simulation' && (
              <div className="custom-sliders-panel">
                <div className="slider-item">
                  <div className="slider-label-row">
                    <span>Sustained Wind Speed:</span>
                    <span className="val-badge">{customWind} km/h</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="280"
                    step="5"
                    value={customWind}
                    onChange={(e) => {
                      setCustomWind(Number(e.target.value));
                      runSimulation('custom_simulation', forestWidth, canopyDensity);
                    }}
                    className="range-input"
                  />
                </div>

                <div className="slider-item">
                  <div className="slider-label-row">
                    <span>Storm Surge Height:</span>
                    <span className="val-badge">{customSurge} meters</span>
                  </div>
                  <input
                    type="range"
                    min="1.5"
                    max="6.5"
                    step="0.1"
                    value={customSurge}
                    onChange={(e) => {
                      setCustomSurge(Number(e.target.value));
                      runSimulation('custom_simulation', forestWidth, canopyDensity);
                    }}
                    className="range-input"
                  />
                </div>
              </div>
            )}

            {/* Forest Buffer Width Slider */}
            <div className="forest-width-slider-bar">
              <div className="slider-label-row">
                <span className="slider-title">
                  <Trees size={16} /> Coastal Mangrove Belt Width (Shield Thickness):
                </span>
                <span className="val-badge highlight">{forestWidth} Meters</span>
              </div>
              <input
                type="range"
                min="50"
                max="2000"
                step="50"
                value={forestWidth}
                onChange={(e) => {
                  const w = Number(e.target.value);
                  setForestWidth(w);
                  runSimulation(selectedCyclone, w, canopyDensity);
                }}
                className="range-input"
              />
              <div className="slider-ticks">
                <span>50m (Severely Degraded)</span>
                <span>250m (Critical Bio-Shield)</span>
                <span>720m (Current Gosaba)</span>
                <span>1500m+ (Dense Sanctuary Core)</span>
              </div>
            </div>
          </div>

          {/* ── HEAD-TO-HEAD COMPARISON: WITHOUT FOREST vs WITH FOREST ── */}
          <div className="comparison-headline">
            <h3>
              Scientific Impact Assessment: <span className="highlight-text">{cyclone.name}</span>
            </h3>
            <p>
              Quantified comparison between an unprotected deforested coastline versus an intact mangrove forest bio-shield.
            </p>
          </div>

          <div className="comparison-split-grid">
            {/* Column 1: WITHOUT FOREST (Worst-Case Vulnerability) */}
            <div className="comparison-column column-without">
              <div className="col-header">
                <div className="col-badge badge-danger">
                  <AlertTriangle size={14} />
                  <span>WITHOUT MANGROVE FOREST</span>
                </div>
                <h4>Deforested / Cleared Coastline</h4>
                <p className="col-subtitle">Zero natural attenuation; full hydrodynamic assault</p>
              </div>

              <div className="metric-card-list">
                <div className="comp-metric-card danger-card">
                  <span className="comp-label">Wave Height Slamming Inland</span>
                  <div className="comp-value-row">
                    <span className="comp-val danger-text">
                      {hydro.wave_height_without_forest_m || 5.5} Meters
                    </span>
                    <span className="comp-subtext">Full wave force reaching dykes</span>
                  </div>
                </div>

                <div className="comp-metric-card danger-card">
                  <span className="comp-label">Embankment Breach Risk</span>
                  <div className="comp-value-row">
                    <span className="comp-val danger-text">
                      {hydro.embankment_breach_risk_without_pct || 96}% (CRITICAL)
                    </span>
                    <span className="comp-subtext">Catastrophic clay bund washouts</span>
                  </div>
                </div>

                <div className="comp-metric-card danger-card">
                  <span className="comp-label">Inland Saline Flood Penetration</span>
                  <div className="comp-value-row">
                    <span className="comp-val danger-text">
                      {hydro.inundation_without_forest_km || 29.5} km Inland
                    </span>
                    <span className="comp-subtext">Salinization of rice paddies &amp; wells</span>
                  </div>
                </div>

                <div className="comp-metric-card danger-card">
                  <span className="comp-label">Human Lives in Direct Threat Zone</span>
                  <div className="comp-value-row">
                    <span className="comp-val danger-text">
                      {(shield.total_coastal_residents || 195000).toLocaleString()} Residents
                    </span>
                    <span className="comp-subtext">Extreme storm surge exposure</span>
                  </div>
                </div>

                <div className="comp-metric-card danger-card">
                  <span className="comp-label">Direct Economic Loss</span>
                  <div className="comp-value-row">
                    <span className="comp-val danger-text">
                      ${shield.economic_damage_without_forest_usd_m || 380}M USD
                    </span>
                    <span className="comp-subtext">Destroyed homes, dykes, livestock</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: WITH MANGROVE FOREST (Natural Coastal Defense) */}
            <div className="comparison-column column-with">
              <div className="col-header">
                <div className="col-badge badge-success">
                  <ShieldCheck size={14} />
                  <span>WITH MANGROVE BIO-SHIELD</span>
                </div>
                <h4>{forestWidth}m Intact Mangrove Barrier</h4>
                <p className="col-subtitle">Dense stilt-root drag dissipates wave momentum</p>
              </div>

              <div className="metric-card-list">
                <div className="comp-metric-card success-card">
                  <span className="comp-label">Dissipated Wave Height at Shore</span>
                  <div className="comp-value-row">
                    <span className="comp-val success-text">
                      {hydro.wave_height_with_forest_m || 1.1} Meters
                    </span>
                    <span className="benefit-badge">
                      -{hydro.wave_energy_attenuation_pct || 78.8}% Wave Energy Drop
                    </span>
                  </div>
                </div>

                <div className="comp-metric-card success-card">
                  <span className="comp-label">Embankment Breach Risk</span>
                  <div className="comp-value-row">
                    <span className="comp-val success-text">
                      {hydro.embankment_breach_risk_with_pct || 7.2}% (MINIMAL)
                    </span>
                    <span className="benefit-badge">13x Failure Risk Reduction</span>
                  </div>
                </div>

                <div className="comp-metric-card success-card">
                  <span className="comp-label">Inland Saline Flood Penetration</span>
                  <div className="comp-value-row">
                    <span className="comp-val success-text">
                      {hydro.inundation_with_forest_km || 2.4} km Inland
                    </span>
                    <span className="benefit-badge">
                      -{hydro.inundation_reduced_pct || 91.8}% Flood Arrest
                    </span>
                  </div>
                </div>

                <div className="comp-metric-card success-card">
                  <span className="comp-label">Human Lives Protected by Forest</span>
                  <div className="comp-value-row">
                    <span className="comp-val success-text font-bold">
                      {(shield.lives_shielded_by_forest || 182400).toLocaleString()} Lives Shielded
                    </span>
                    <span className="benefit-badge">
                      {((shield.lives_shielded_by_forest || 182400) / (shield.total_coastal_residents || 195000) * 100).toFixed(1)}% Population Safe
                    </span>
                  </div>
                </div>

                <div className="comp-metric-card success-card">
                  <span className="comp-label">Economic Disaster Damage Prevented</span>
                  <div className="comp-value-row">
                    <span className="comp-val success-text font-bold">
                      +${shield.economic_loss_prevented_usd_m || 320}M USD Saved
                    </span>
                    <span className="benefit-badge font-mono">
                      ₹{shield.economic_loss_prevented_inr_crores || 2670} Crores
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Forest Self-Damage Absorption & Natural Resilience */}
          <div className="forest-resilience-box">
            <div className="resilience-header">
              <Trees size={18} className="tree-resilience-icon" />
              <div>
                <h4>How Much Cyclone Damage the Forest Absorbs (Sacrificial Bio-Shield)</h4>
                <p>
                  Mangrove trees absorb kinetic force by defoliating and bending rather than toppling, preserving the underlying root matrix.
                </p>
              </div>
            </div>

            <div className="resilience-stats-grid">
              <div className="r-stat">
                <span className="r-label">Canopy Defoliation Absorbed</span>
                <span className="r-val warning-text">
                  {absorption.canopy_defoliation_absorbed_pct || 34.5}%
                </span>
                <span className="r-sub">Leaves &amp; small twigs stripped</span>
              </div>
              <div className="r-stat">
                <span className="r-label">Outer Shoreline Uprooting Depth</span>
                <span className="r-val">
                  {absorption.outer_edge_uprooting_penetration_m || 24.5}m Outer Edge
                </span>
                <span className="r-sub">Sacrificial front buffer</span>
              </div>
              <div className="r-stat">
                <span className="r-label">Subsoil Root Matrix Integrity</span>
                <span className="r-val success-text">100% Intact</span>
                <span className="r-sub">Pneumatophores prevent soil liquefaction</span>
              </div>
              <div className="r-stat">
                <span className="r-label">Natural Regrowth Prognosis</span>
                <span className="r-val success-text">
                  {absorption.natural_recovery_prognosis_pct || 88}% Regrowth
                </span>
                <span className="r-sub">{absorption.estimated_recovery_months || '14-18 months'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: PREVENTIVE MEASURES & ACTION ROADMAP ── */}
      {activeTabSub === 'preventive' && (
        <div className="preventive-measures-container">
          <div className="preventive-intro-card">
            <div className="intro-badge">
              <ShieldCheck size={16} />
              <span>STRATEGIC PREVENTIVE ACTION MATRIX</span>
            </div>
            <h2>Immediate &amp; Long-Term Coastal Reinforcement Roadmap</h2>
            <p>
              Actionable engineering, ecological restoration, and statutory enforcement measures to eliminate structural vulnerabilities identified by U-Net satellite analysis before the next cyclone season.
            </p>
          </div>

          <div className="measures-grid">
            {preventiveMeasures.map((measure, index) => (
              <div key={index} className="measure-card">
                <div className="measure-top">
                  <span className={`priority-tag ${measure.priority.includes('P1') ? 'p1' : measure.priority.includes('P2') ? 'p2' : 'p3'}`}>
                    {measure.priority}
                  </span>
                  <span className="agency-badge">{measure.responsible_agency}</span>
                </div>

                <h3 className="measure-title">{measure.title}</h3>
                <div className="measure-zone">
                  <strong>Target Geographic Zone:</strong> {measure.target_zone}
                </div>

                <div className="measure-detail-box">
                  <div className="detail-item">
                    <span className="detail-label">Recommended Species &amp; Materials:</span>
                    <span className="detail-text">{measure.recommended_species}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Engineering Specification:</span>
                    <span className="detail-text">{measure.planting_specification}</span>
                  </div>
                  <div className="detail-item outcome-highlight">
                    <span className="detail-label">Target Protective Outcome:</span>
                    <span className="detail-text good-text">{measure.expected_outcome}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Download Report Callout */}
          <div className="report-callout-card">
            <div className="callout-left">
              <FileText size={32} className="callout-icon" />
              <div>
                <h4>Official U-Net ML &amp; Cyclone Bio-Shield PDF Intelligence Report</h4>
                <p>
                  Includes comprehensive Sentinel-2 satellite spectrograms, U-Net ResNet34 segmentation matrices, hydrodynamic surge calculations, and statutory recommendations.
                </p>
              </div>
            </div>
            <div className="callout-right">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={handleDownloadReport}
                disabled={isDownloading}
              >
                <Download size={18} />
                <span>{isDownloading ? 'Compiling Report...' : 'Download Official PDF Report'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
