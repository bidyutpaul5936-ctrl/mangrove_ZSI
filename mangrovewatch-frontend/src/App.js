import React, { useState, useEffect } from 'react';
import { AuthProvider } from './hooks/useAuth';
import TopNav from './components/TopNav';
import DashboardView from './components/DashboardView';
import SatelliteView from './components/SatelliteView';
import LegalDossiersView from './components/LegalDossiersView';
import CommunityReportsView from './components/CommunityReportsView';
import DossierModal from './components/DossierModal';
import LoginModal from './components/LoginModal';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Persist dark mode preference
    return localStorage.getItem('mw-dark-mode') === 'true';
  });

  // Apply or remove dark mode class on document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('mw-dark-mode', darkMode);
  }, [darkMode]);

  const handleOpenDossier = (dossierData) => {
    setSelectedDossier(dossierData);
    setIsDossierModalOpen(true);
  };

  return (
    <div className={`mangrovewatch-saas-root${darkMode ? ' dark-mode' : ''}`}>
      {/* 🧭 1. Full-Width Sticky Top Header Navigation */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRequestLogin={() => setIsLoginModalOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
      />

      {/* 📐 2. Main Page Views */}
      <main className="saas-main-viewport">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigateToSatellite={() => setActiveTab('satellite')}
            onNavigateToLegal={() => setActiveTab('legal')}
            onNavigateToCommunity={() => setActiveTab('community')}
            onSelectDossier={handleOpenDossier}
          />
        )}

        {activeTab === 'satellite' && (
          <SatelliteView onSelectDossier={handleOpenDossier} />
        )}

        {activeTab === 'legal' && (
          <LegalDossiersView onSelectDossier={handleOpenDossier} />
        )}

        {activeTab === 'community' && (
          <CommunityReportsView
            onSelectReportLocation={(coords) => {
              setActiveTab('satellite');
            }}
          />
        )}
      </main>

      {/* ⚖️ 3. Interactive Court-Admissible Dossier Modal */}
      <DossierModal
        dossier={selectedDossier}
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
      />

      {/* 🛡️ 4. Officer Authentication Modal */}
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
