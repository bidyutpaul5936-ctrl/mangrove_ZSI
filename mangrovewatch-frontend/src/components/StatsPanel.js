import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../api';
import {
  TrendingDown,
  CloudRain,
  DollarSign,
  Bell,
  Users,
  Grid,
  RefreshCw,
  Activity,
  ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';

export default function StatsPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      setError('Could not connect to MangroveWatch API. Check backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
        <RefreshCw size={28} className="animate-spin" style={{ animation: 'spin 1s linear infinite', marginBottom: '12px', color: 'var(--primary-400)' }} />
        <span style={{ fontSize: '13px' }}>Aggregating Sentinel-2 forest loss telemetry...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="card" style={{ borderColor: 'rgba(255, 23, 68, 0.3)', background: 'rgba(255, 23, 68, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)', marginBottom: '8px' }}>
          <ShieldAlert size={18} />
          <span style={{ fontWeight: 600, fontSize: '14px' }}>Telemetry Offline</span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          {error || 'Unable to load statistics.'}
        </p>
        <button onClick={fetchStats} className="btn btn-ghost btn-sm">
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  const causeColors = {
    'Aquaculture / Pond': '#29B6F6',
    'Erosion / Cyclone': '#FF8A65',
    'Illegal Clearing': '#EF5350',
    'pond_conversion': '#29B6F6',
    'erosion_cyclone': '#FF8A65',
    'clearing': '#EF5350',
  };

  const causeChartData = Object.entries(stats.by_cause || {}).map(([cause, val]) => ({
    name: cause.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    hectares: typeof val === 'object' ? val.hectares : val,
    count: typeof val === 'object' ? val.count : 0,
    color: causeColors[cause] || '#81C784'
  }));

  const timelineChartData = stats.yearly_timeline || [
    { year: 2018, hectares: 18.2 },
    { year: 2019, hectares: 24.5 },
    { year: 2020, hectares: 32.1 },
    { year: 2021, hectares: 29.4 },
    { year: 2022, hectares: 38.6 },
    { year: 2023, hectares: 42.1 },
    { year: 2024, hectares: 35.8 },
    { year: 2025, hectares: 27.2 },
  ];

  return (
    <div>
      {/* Header with Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Ecosystem Impact Telemetry
          </h2>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Sundarbans Biosphere Monitoring Node
          </div>
        </div>
        <button
          onClick={fetchStats}
          className="btn btn-ghost btn-sm"
          title="Refresh data"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* 6-Card Stats Grid */}
      <div className="stats-grid">
        {/* Total Hectares Lost */}
        <div className="stat-card">
          <div className="stat-value loss">
            {Number(stats.total_loss_hectares || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </div>
          <div className="stat-label">Hectares Lost</div>
        </div>

        {/* Carbon Loss in tCO2 */}
        <div className="stat-card">
          <div className="stat-value carbon">
            {Number(stats.carbon_loss_tco2 || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="stat-label">tCO2 Emitted</div>
        </div>

        {/* Carbon Value in USD */}
        <div className="stat-card">
          <div className="stat-value money">
            ${(Number(stats.carbon_value_usd || 0) / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k
          </div>
          <div className="stat-label">Carbon Credit Value</div>
        </div>

        {/* Open Critical Alerts */}
        <div className="stat-card">
          <div className="stat-value alerts">
            {stats.open_alerts || 0}
          </div>
          <div className="stat-label">Active Alerts</div>
        </div>

        {/* Citizen Reports */}
        <div className="stat-card">
          <div className="stat-value reports">
            {stats.total_citizen_reports || 0}
          </div>
          <div className="stat-label">Ground Reports</div>
        </div>

        {/* Detected Patches */}
        <div className="stat-card">
          <div className="stat-value patches">
            {stats.total_loss_patches || 0}
          </div>
          <div className="stat-label">Loss Patches</div>
        </div>
      </div>

      {/* Cause Breakdown Chart */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Loss Drivers (Hectares)</span>
          <span className="card-subtitle">Classification Breakdown</span>
        </div>
        <div style={{ height: '180px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={causeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#66886E" fontSize={10} tickLine={false} />
              <YAxis stroke="#66886E" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0F1A15', border: '1px solid rgba(76,175,80,0.3)', borderRadius: '8px', fontSize: '11px', color: '#E8F5E9' }}
              />
              <Bar dataKey="hectares" radius={[4, 4, 0, 0]}>
                {causeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Yearly Timeline Chart */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Annual Canopy Loss Trend</span>
          <span className="card-subtitle">2016 – Present</span>
        </div>
        <div style={{ height: '180px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF5252" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#FF5252" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" stroke="#66886E" fontSize={10} tickLine={false} />
              <YAxis stroke="#66886E" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0F1A15', border: '1px solid rgba(76,175,80,0.3)', borderRadius: '8px', fontSize: '11px', color: '#E8F5E9' }}
              />
              <Area type="monotone" dataKey="hectares" stroke="#FF5252" strokeWidth={2} fillOpacity={1} fill="url(#lossGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
