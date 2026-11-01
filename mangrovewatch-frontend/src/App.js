import React, { useState } from 'react';
import { AuthProvider } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import TimeLapse from './components/TimeLapse';
import LoginModal from './components/LoginModal';
import { Layers, MapPin, Shield, Plus, Compass } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [layers, setLayers] = useState({
    extent: true,
    lossPatches: true,
    protectedAreas: true,
    citizenReports: true,
    heatmap: false,
  });
  const [basemap, setBasemap] = useState('dark');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [flyToCoords, setFlyToCoords] = useState(null);
  const [droppedPin, setDroppedPin] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Handle map click
  const handleMapClick = (coords) => {
    setDroppedPin(coords);
    setActiveTab('submit');
  };

  const handleSelectAlert = (alertItem) => {
    // If alert item has patch coordinates or we approximate from patch
    if (alertItem.latitude && alertItem.longitude) {
      setFlyToCoords({ lat: alertItem.latitude, lng: alertItem.longitude });
    } else {
      // Default to Sundarbans center
      setFlyToCoords({ lat: 21.60, lng: 89.30 });
    }
  };

  const handleSelectReport = (report) => {
    if (report.latitude && report.longitude) {
      setFlyToCoords({ lat: parseFloat(report.latitude), lng: parseFloat(report.longitude) });
    }
  };

  const handleReportSubmitted = (result) => {
    setDroppedPin(null);
    // Optionally switch to reports tab to view
  };

  return (
    <div className="app-layout">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        layers={layers}
        setLayers={setLayers}
        basemap={basemap}
        setBasemap={setBasemap}
        droppedPin={droppedPin}
        onClearPin={() => setDroppedPin(null)}
        onSelectAlert={handleSelectAlert}
        onSelectReport={handleSelectReport}
        onReportSubmitted={handleReportSubmitted}
        onRequestLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Main Map Canvas Area */}
      <main className="app-main">
        <MapView
          layers={layers}
          basemap={basemap}
          selectedYear={selectedYear}
          flyToCoords={flyToCoords}
          onMapClick={handleMapClick}
          droppedPin={droppedPin}
        />

        {/* Floating Quick Action Map Controls (Top Right) */}
        <div className="map-overlay-controls">
          <button
            type="button"
            className={`map-control-btn ${activeTab === 'submit' ? 'active' : ''}`}
            onClick={() => setActiveTab('submit')}
            title="File Eyewitness Ground Report"
          >
            <Compass size={18} />
          </button>
          <button
            type="button"
            className={`map-control-btn ${activeTab === 'layers' ? 'active' : ''}`}
            onClick={() => setActiveTab('layers')}
            title="Toggle Map Data Layers"
          >
            <Layers size={18} />
          </button>
          <button
            type="button"
            className="map-control-btn"
            onClick={() => setIsLoginModalOpen(true)}
            title="Forest Officer Authentication"
          >
            <Shield size={18} />
          </button>
        </div>

        {/* TimeLapse Bottom Bar */}
        <TimeLapse
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          minYear={2016}
          maxYear={2026}
        />
      </main>

      {/* Officer Auth Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
