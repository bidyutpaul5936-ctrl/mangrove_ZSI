import React, { useState, useEffect } from 'react';
import { AuthProvider } from './hooks/useAuth';
import TopNav from './components/TopNav';
import DashboardView from './components/DashboardView';
import SatelliteView from './components/SatelliteView';
import LegalDossiersView from './components/LegalDossiersView';
import CommunityReportsView from './components/CommunityReportsView';
import DossierModal from './components/DossierModal';
import LoginModal from './components/LoginModal';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('MangroveWatch Platform Runtime Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#F2F7F2',
          fontFamily: "'Inter', sans-serif",
          color: '#1A2E1E'
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #D1E2D1',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            boxShadow: '0 8px 30px rgba(30, 77, 43, 0.08)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌿</div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1E4D2B', marginBottom: '8px' }}>
              MangroveWatch Environmental Platform
            </h2>
            <p style={{ fontSize: '14px', color: '#5E7A63', marginBottom: '20px' }}>
              A client-side initialization issue was intercepted. Click below to reload the platform or reset cached state.
            </p>
            {this.state.error && (
              <pre style={{
                textAlign: 'left',
                background: '#F9FAF9',
                border: '1px solid #E5EFE5',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12px',
                color: '#C62828',
                overflowX: 'auto',
                marginBottom: '20px',
                fontFamily: "'JetBrains Mono', monospace"
              }}>
                {this.state.error.toString()}
              </pre>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#1E4D2B',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Reload Platform
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                style={{
                  background: 'transparent',
                  color: '#1E4D2B',
                  border: '1px solid #1E4D2B',
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Clear Cache &amp; Reset
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
