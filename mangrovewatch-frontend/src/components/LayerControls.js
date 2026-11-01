import React from 'react';
import { Layers, TreeDeciduous, AlertTriangle, Shield, MapPin, Eye, Flame } from 'lucide-react';

export default function LayerControls({ layers, setLayers, basemap, setBasemap }) {
  const toggle = (key) => {
    setLayers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
      <div className="card-header" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} style={{ color: 'var(--primary-400)' }} />
          <span className="card-title" style={{ fontSize: '13px' }}>Map Layer Visibility</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Mangrove Extent Layer */}
        <button
          type="button"
          onClick={() => toggle('extent')}
          className={`layer-toggle ${layers.extent ? 'active' : ''}`}
        >
          <div className="layer-dot" style={{ backgroundColor: '#4CAF50' }} />
          <TreeDeciduous size={14} style={{ color: '#81C784', marginRight: '4px' }} />
          <span>Mangrove Forest Extent</span>
          <div className="toggle-switch" />
        </button>

        {/* Satellite Loss Patches Layer */}
        <button
          type="button"
          onClick={() => toggle('lossPatches')}
          className={`layer-toggle ${layers.lossPatches ? 'active' : ''}`}
        >
          <div className="layer-dot" style={{ backgroundColor: '#FF1744' }} />
          <AlertTriangle size={14} style={{ color: '#FF5252', marginRight: '4px' }} />
          <span>Satellite Loss Patches</span>
          <div className="toggle-switch" />
        </button>

        {/* WDPA Protected Areas */}
        <button
          type="button"
          onClick={() => toggle('protectedAreas')}
          className={`layer-toggle ${layers.protectedAreas ? 'active' : ''}`}
        >
          <div className="layer-dot" style={{ backgroundColor: '#F9A825' }} />
          <Shield size={14} style={{ color: '#F9A825', marginRight: '4px' }} />
          <span>WDPA Protected Sanctuaries</span>
          <div className="toggle-switch" />
        </button>

        {/* Citizen Ground Reports */}
        <button
          type="button"
          onClick={() => toggle('citizenReports')}
          className={`layer-toggle ${layers.citizenReports ? 'active' : ''}`}
        >
          <div className="layer-dot" style={{ backgroundColor: '#00E5FF' }} />
          <MapPin size={14} style={{ color: '#00E5FF', marginRight: '4px' }} />
          <span>Community Ground Reports</span>
          <div className="toggle-switch" />
        </button>

        {/* Heatmap Layer */}
        <button
          type="button"
          onClick={() => toggle('heatmap')}
          className={`layer-toggle ${layers.heatmap ? 'active' : ''}`}
        >
          <div className="layer-dot" style={{ backgroundColor: '#FF6D00' }} />
          <Flame size={14} style={{ color: '#FF6D00', marginRight: '4px' }} />
          <span>Loss Concentration Rings</span>
          <div className="toggle-switch" />
        </button>
      </div>

      {/* Basemap Selection */}
      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px', fontWeight: 600 }}>
          Base Imagery
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <button
            type="button"
            className={`btn btn-sm ${basemap === 'dark' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setBasemap('dark')}
          >
            Light Voyager
          </button>
          <button
            type="button"
            className={`btn btn-sm ${basemap === 'satellite' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setBasemap('satellite')}
          >
            Satellite ESRI
          </button>
        </div>
      </div>
    </div>
  );
}
