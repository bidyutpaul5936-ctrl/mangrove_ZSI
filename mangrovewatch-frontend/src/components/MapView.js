import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
  useMap,
  useMapEvents,
  CircleMarker
} from 'react-leaflet';
import L from 'leaflet';
import {
  getLossPatches,
  getMangroveExtent,
  getProtectedAreas,
  getCitizenReports,
  downloadEvidencePDF
} from '../api';
import {
  FileText,
  AlertTriangle,
  Shield,
  Download,
  Calendar,
  Layers,
  MapPin,
  ExternalLink,
  Flame,
  CheckCircle2,
  TreeDeciduous
} from 'lucide-react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';

// Helper component to handle map flying & pin dropping
function MapController({ flyToCoords, onMapClick }) {
  const map = useMap();

  useEffect(() => {
    if (flyToCoords) {
      map.flyTo([flyToCoords.lat, flyToCoords.lng], 13, {
        duration: 1.5,
      });
    }
  }, [flyToCoords, map]);

  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });

  return null;
}

// Custom modern SVG Pin Icons
const createCitizenIcon = (status) => {
  const color = status === 'confirmed' ? '#00E676' : status === 'rejected' ? '#FF1744' : '#FFD600';
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background: #0F1A15;
        border: 2px solid ${color};
        color: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 12px ${color}66;
        cursor: pointer;
        font-size: 13px;
      ">
        📍
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

export default function MapView({
  layers,
  basemap,
  selectedYear,
  flyToCoords,
  onMapClick,
  droppedPin
}) {
  const [extentData, setExtentData] = useState(null);
  const [lossData, setLossData] = useState(null);
  const [protectedData, setProtectedData] = useState(null);
  const [citizenReports, setCitizenReports] = useState([]);
  const [downloadingPdf, setDownloadingPdf] = useState({});
  const [selectedPatch, setSelectedPatch] = useState(null);

  useEffect(() => {
    async function loadMapData() {
      try {
        const [extentRes, lossRes, paRes, crRes] = await Promise.all([
          getMangroveExtent().catch(() => null),
          getLossPatches().catch(() => null),
          getProtectedAreas().catch(() => null),
          getCitizenReports().catch(() => []),
        ]);

        if (extentRes) setExtentData(extentRes);
        if (lossRes) setLossData(lossRes);
        if (paRes) setProtectedData(paRes);
        if (crRes) setCitizenReports(crRes);
      } catch (err) {
        console.error('Error fetching map layers:', err);
      }
    }

    loadMapData();
  }, []);

  // Filter loss patches based on selected timelapse year
  const filteredLossFeatures = React.useMemo(() => {
    if (!lossData || !lossData.features) return [];
    if (!selectedYear) return lossData.features;
    return lossData.features.filter((f) => {
      const year = f.properties?.year || (f.properties?.date ? parseInt(f.properties.date.slice(0, 4)) : 2024);
      return year <= selectedYear;
    });
  }, [lossData, selectedYear]);

  // Color coding styles
  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'critical': return '#FF1744';
      case 'high': return '#FF6D00';
      case 'medium': return '#FFD600';
      default: return '#00E676';
    }
  };

  const lossStyle = (feature) => {
    const sev = feature.properties?.severity || 'medium';
    const color = getSeverityColor(sev);
    return {
      fillColor: color,
      weight: 1.5,
      opacity: 1,
      color: color,
      fillOpacity: 0.65,
    };
  };

  const extentStyle = {
    fillColor: '#2E7D32',
    weight: 1,
    opacity: 0.8,
    color: '#81C784',
    fillOpacity: 0.25,
  };

  const protectedStyle = {
    fillColor: '#F9A825',
    weight: 2,
    opacity: 0.9,
    color: '#F9A825',
    dashArray: '6, 6',
    fillOpacity: 0.12,
  };

  const handleDownloadPDF = async (patchId) => {
    setDownloadingPdf((prev) => ({ ...prev, [patchId]: true }));
    try {
      await downloadEvidencePDF(patchId);
    } catch (err) {
      alert(`Could not generate PDF: ${err.message}`);
    } finally {
      setDownloadingPdf((prev) => ({ ...prev, [patchId]: false }));
    }
  };

  const onEachLossFeature = (feature, layer) => {
    const props = feature.properties || {};
    const patchId = props.patch_id || 'MW-000';
    const area = props.area_ha || props.loss_ha || 0;
    const date = props.date || 'Recent';
    const cause = (props.cause || 'illegal_clearing').replace(/_/g, ' ');
    const severity = props.severity || 'medium';
    const pa = props.protected_area_name;
    const carbon = props.carbon_loss_tco2 || (area * 450).toFixed(0);

    const popupContent = `
      <div style="font-family: 'Inter', sans-serif; min-width: 260px; color: #0A0F0D;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <strong style="font-size: 14px; font-weight: 700; color: #1B5E20;">Patch ${patchId}</strong>
          <span style="
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            padding: 2px 8px;
            border-radius: 9999px;
            background: ${getSeverityColor(severity)}22;
            color: ${getSeverityColor(severity)};
            border: 1px solid ${getSeverityColor(severity)};
          ">${severity}</span>
        </div>
        <div style="font-size: 12px; margin-bottom: 4px;">📅 Detected: <strong>${date}</strong></div>
        <div style="font-size: 12px; margin-bottom: 4px;">📐 Canopy Loss: <strong>${area} ha</strong></div>
        <div style="font-size: 12px; margin-bottom: 4px;">🔬 Cause: <strong style="text-transform: capitalize;">${cause}</strong></div>
        <div style="font-size: 12px; margin-bottom: 4px;">🌿 Carbon Loss: <strong>${carbon} tCO2</strong></div>
        ${pa ? `<div style="font-size: 11px; color: #D50000; font-weight: 600; margin-top: 6px; padding: 4px 6px; background: #FFEBEE; border-radius: 4px;">⚠️ Violation: Inside ${pa}</div>` : ''}
        <button id="btn-pdf-${patchId}" style="
          width: 100%;
          margin-top: 10px;
          padding: 8px;
          background: #1B5E20;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        ">
          ⚖️ Download Evidence PDF
        </button>
      </div>
    `;

    layer.bindPopup(popupContent);
    layer.on('popupopen', () => {
      const btn = document.getElementById(`btn-pdf-${patchId}`);
      if (btn) {
        btn.onclick = () => handleDownloadPDF(patchId);
      }
    });
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={[21.60, 89.30]}
        zoom={9}
        minZoom={6}
        maxZoom={17}
        style={{ height: '100%', width: '100%', background: '#EBF7EE' }}
        zoomControl={false}
      >
        <MapController flyToCoords={flyToCoords} onMapClick={onMapClick} />

        {/* Dynamic Basemap */}
        {basemap === 'satellite' ? (
          <TileLayer
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        ) : (
          <TileLayer
            attribution="&copy; <a href='https://carto.com/attributions'>CARTO</a>"
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
        )}

        {/* 1. Mangrove Extent Layer */}
        {layers.extent && extentData && (
          <GeoJSON
            key="mangrove-extent"
            data={extentData}
            style={extentStyle}
          />
        )}

        {/* 2. WDPA Protected Areas Layer */}
        {layers.protectedAreas && protectedData && (
          <GeoJSON
            key="protected-areas"
            data={protectedData}
            style={protectedStyle}
            onEachFeature={(feature, layer) => {
              const name = feature.properties?.name || 'Protected Sanctuary';
              const desig = feature.properties?.designation || 'Wildlife Sanctuary';
              layer.bindPopup(`
                <div style="font-family: 'Inter', sans-serif; color: #0A0F0D;">
                  <strong style="font-size: 13px; color: #F57F17;">🛡️ ${name}</strong>
                  <div style="font-size: 11px; color: #666; margin-top: 2px;">Designation: ${desig}</div>
                  <div style="font-size: 11px; color: #444; margin-top: 4px;">Protected under Bangladesh Wildlife Preservation Act &amp; UNESCO World Heritage</div>
                </div>
              `);
            }}
          />
        )}

        {/* 3. Heatmap / Concentration Rings */}
        {layers.heatmap && filteredLossFeatures.map((f, i) => {
          if (!f.geometry || !f.geometry.coordinates) return null;
          // Approximate centroid
          let center = [21.60, 89.30];
          try {
            const coords = f.geometry.coordinates[0][0];
            center = [coords[1], coords[0]];
          } catch (e) {}

          const isCrit = f.properties?.severity === 'critical';
          return (
            <CircleMarker
              key={`heat-${i}`}
              center={center}
              radius={isCrit ? 35 : 20}
              pathOptions={{
                fillColor: isCrit ? '#FF1744' : '#FF6D00',
                fillOpacity: 0.18,
                stroke: false,
              }}
            />
          );
        })}

        {/* 4. Satellite Loss Patches Layer */}
        {layers.lossPatches && (
          <GeoJSON
            key={`loss-patches-${selectedYear}-${filteredLossFeatures.length}`}
            data={{ type: 'FeatureCollection', features: filteredLossFeatures }}
            style={lossStyle}
            onEachFeature={onEachLossFeature}
          />
        )}

        {/* 5. Citizen Reports Markers */}
        {layers.citizenReports && citizenReports.map((report) => (
          <Marker
            key={report.report_id}
            position={[report.latitude, report.longitude]}
            icon={createCitizenIcon(report.status)}
          >
            <Popup>
              <div style="font-family: 'Inter', sans-serif; min-width: 220px; color: #0A0F0D;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <strong style="font-size: 13px;">Ground Report</strong>
                  <span style="font-size: 10px; font-weight: 700; text-transform: uppercase;">${report.status}</span>
                </div>
                <div style="font-size: 11px; color: #555; margin-bottom: 4px;">
                  Category: <strong>${(report.category || '').replace(/_/g, ' ')}</strong>
                </div>
                <div style="font-size: 12px; margin-bottom: 6px;">
                  ${report.description}
                </div>
                ${report.linked_patch_id ? `
                  <div style="font-size: 11px; color: #00796B; font-weight: 600; padding: 4px; background: #E0F2F1; border-radius: 4px; margin-bottom: 6px;">
                    🔗 Auto-linked to Satellite Patch: ${report.linked_patch_id}
                  </div>
                ` : ''}
                ${report.photo_url ? `
                  <img src="${report.photo_url}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 4px; margin-top: 4px;" />
                ` : ''}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 6. Dropped Pin for New Report Submission */}
        {droppedPin && (
          <Marker
            position={[droppedPin.lat, droppedPin.lng]}
            icon={L.divIcon({
              className: 'dropped-pin',
              html: `
                <div style="
                  background: #FF1744;
                  color: white;
                  width: 32px;
                  height: 32px;
                  border-radius: 50% 50% 50% 0;
                  transform: rotate(-45deg);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-shadow: 0 4px 12px rgba(255, 23, 68, 0.6);
                  animation: bounce 0.6s ease-in-out infinite alternate;
                ">
                  <div style="transform: rotate(45deg); font-size: 14px;">📍</div>
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
            })}
          >
            <Popup>
              <div style={{ color: '#0A0F0D', fontSize: '12px' }}>
                <strong>Field Target Selected</strong><br />
                Lat: {droppedPin.lat.toFixed(5)}<br />
                Lng: {droppedPin.lng.toFixed(5)}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
