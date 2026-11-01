import React from 'react';
import {
  BarChart3,
  Satellite,
  Scale,
  Users,
  ShieldCheck,
  ShieldAlert,
  TreeDeciduous,
  Leaf,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function TopNav({ activeTab, setActiveTab, onRequestLogin, darkMode, onToggleDarkMode }) {
  const { isOfficer, officerName, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      badge: 'Live',
    },
    {
      id: 'satellite',
      label: 'Satellite Analysis',
      icon: Satellite,
      badge: null,
    },
    {
      id: 'legal',
      label: 'Legal Dossiers',
      icon: Scale,
      badge: 'SHA-256',
    },
    {
      id: 'community',
      label: 'Community Reports',
      icon: Users,
      badge: '5 New',
    },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="topnav-glass">
      <div className="topnav-container">
        {/* Left: Brand Identity */}
        <div className="topnav-brand" onClick={() => setActiveTab('dashboard')}>
          <div className="brand-icon-wrapper">
            <TreeDeciduous size={22} className="brand-icon" />
          </div>
          <div className="brand-text">
            <div className="brand-title">
              Mangrove<span>Watch</span>
            </div>
            <div className="brand-subtitle">Sundarbans Biosphere Reserve</div>
          </div>
        </div>

        {/* Center: Pill-Shaped Page Switcher Tabs (Desktop) */}
        <nav className="topnav-nav-pill-container" aria-label="Main Navigation">
          <div className="pill-group">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  id={`nav-tab-${item.id}`}
                  className={`pill-tab ${isActive ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <Icon size={16} className="pill-icon" />
                  <span className="pill-label">{item.label}</span>
                  {item.badge && (
                    <span className={`pill-badge ${isActive ? 'active-badge' : ''}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Right: Telemetry Status, Carbon Badge, Dark Mode & Officer Profile */}
        <div className="topnav-meta">
          {/* Sentinel-2 Live Feed Status */}
          <div className="sentinel-feed-status" title="Sentinel-2B Multi-Spectral Instrument (MSI) Level-2A Real-time Link">
            <span className="live-beacon">
              <span className="beacon-ping"></span>
              <span className="beacon-dot"></span>
            </span>
            <div className="feed-info">
              <span className="feed-title">Sentinel-2 Feed</span>
              <span className="feed-status-text">Live 10m L2A</span>
            </div>
          </div>

          {/* Carbon Offset Metric Badge */}
          <div className="carbon-offset-pill" title="Estimated Mangrove Biomass Carbon Loss (tCO₂e) Detected">
            <Leaf size={14} className="carbon-icon" />
            <span className="carbon-text">
              <strong>642.8k</strong> tCO₂ Risk
            </span>
          </div>

          {/* 🌙 Dark Mode Toggle */}
          <button
            type="button"
            id="dark-mode-toggle"
            className="dark-mode-toggle"
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? (
              <Sun size={16} className="dm-icon" />
            ) : (
              <Moon size={16} className="dm-icon" />
            )}
          </button>

          {/* Forest Officer Auth Badge / Modal Trigger */}
          {isOfficer ? (
            <div className="officer-profile-card">
              <div className="officer-avatar" title={`Authenticated: ${officerName || 'Forest Beat Officer'}`}>
                <ShieldCheck size={16} />
              </div>
              <div className="officer-details">
                <span className="officer-role">Forest Officer</span>
                <button
                  type="button"
                  className="officer-logout-btn"
                  onClick={logout}
                  title="Logout Officer Session"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="officer-login-trigger"
              onClick={onRequestLogin}
              title="Authenticate as West Bengal / Forest Department Officer"
            >
              <ShieldAlert size={15} />
              <span>Officer Auth</span>
            </button>
          )}

          {/* Mobile Hamburger */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen((p) => !p)}
            aria-label="Toggle mobile navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Nav Menu */}
      {mobileMenuOpen && (
        <nav className="mobile-nav-menu" aria-label="Mobile Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && <span className="pill-badge">{item.badge}</span>}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
}
