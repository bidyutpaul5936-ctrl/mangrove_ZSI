import React from 'react';
import {
  BarChart3,
  Bell,
  MapPin,
  Send,
  Layers,
  ShieldCheck,
  ShieldAlert,
  TreeDeciduous,
  Leaf
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import StatsPanel from './StatsPanel';
import AlertsPanel from './AlertsPanel';
import CitizenReportsList from './CitizenReportsList';
import CitizenReportForm from './CitizenReportForm';
import LayerControls from './LayerControls';

export default function Sidebar({
  activeTab,
  setActiveTab,
  layers,
  setLayers,
  basemap,
  setBasemap,
  droppedPin,
  onClearPin,
  onSelectAlert,
  onSelectReport,
  onReportSubmitted,
  onRequestLogin
}) {
  const { isOfficer } = useAuth();

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="logo">
            <div className="logo-icon">
              🌿
            </div>
            <div className="logo-text">
              <span className="logo-title">MangroveWatch</span>
              <span className="logo-subtitle">Sentinel-2 Forest Sentinel</span>
            </div>
          </div>

          <button
            onClick={onRequestLogin}
            className={`btn btn-sm ${isOfficer ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              border: isOfficer ? 'none' : '1px solid rgba(255,255,255,0.15)'
            }}
            title={isOfficer ? 'Officer Mode Authenticated' : 'Forest Officer Login'}
          >
            {isOfficer ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={13} /> Officer
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldAlert size={13} /> Auth
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="sidebar-nav">
        <button
          type="button"
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <BarChart3 size={16} />
          <span>Metrics</span>
        </button>

        <button
          type="button"
          className={`nav-btn ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          <Bell size={16} />
          <span>Alerts</span>
        </button>

        <button
          type="button"
          className={`nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <MapPin size={16} />
          <span>Ground</span>
        </button>

        <button
          type="button"
          className={`nav-btn ${activeTab === 'submit' ? 'active' : ''}`}
          onClick={() => setActiveTab('submit')}
        >
          <Send size={16} />
          <span>Report</span>
        </button>

        <button
          type="button"
          className={`nav-btn ${activeTab === 'layers' ? 'active' : ''}`}
          onClick={() => setActiveTab('layers')}
        >
          <Layers size={16} />
          <span>Layers</span>
        </button>
      </nav>

      {/* Dynamic Tab Body */}
      <div className="sidebar-content">
        {activeTab === 'dashboard' && <StatsPanel />}

        {activeTab === 'alerts' && (
          <AlertsPanel
            onSelectAlert={onSelectAlert}
            onRequestLogin={onRequestLogin}
          />
        )}

        {activeTab === 'reports' && (
          <CitizenReportsList
            onSelectReport={onSelectReport}
            onRequestLogin={onRequestLogin}
          />
        )}

        {activeTab === 'submit' && (
          <CitizenReportForm
            selectedLocation={droppedPin}
            onClearLocation={onClearPin}
            onReportSubmitted={onReportSubmitted}
          />
        )}

        {activeTab === 'layers' && (
          <LayerControls
            layers={layers}
            setLayers={setLayers}
            basemap={basemap}
            setBasemap={setBasemap}
          />
        )}
      </div>
    </aside>
  );
}
