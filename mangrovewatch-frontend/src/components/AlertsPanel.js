import React, { useState, useEffect } from 'react';
import {
  getAlerts,
  acknowledgeAlert,
  sendAlertNotification,
  sendTestAlert
} from '../api';
import { useAuth } from '../hooks/useAuth';
import {
  Bell,
  AlertTriangle,
  Send,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  Shield,
  MapPin,
  ExternalLink
} from 'lucide-react';

export default function AlertsPanel({ onSelectAlert, onRequestLogin }) {
  const { isOfficer } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [openOnly, setOpenOnly] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(null);

  const fetchAlertsList = async () => {
    setLoading(true);
    try {
      const params = {};
      if (openOnly) params.openOnly = true;
      if (filterSeverity !== 'all') params.severity = filterSeverity;
      const data = await getAlerts(params);
      setAlerts(data || []);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsList();
  }, [filterSeverity, openOnly]);

  const handleAcknowledge = async (e, alertId) => {
    e.stopPropagation();
    if (!isOfficer) {
      onRequestLogin();
      return;
    }

    setActionLoading((prev) => ({ ...prev, [alertId]: true }));
    try {
      await acknowledgeAlert(alertId);
      // update state locally
      setAlerts((prev) =>
        prev.map((a) => (a.alert_id === alertId ? { ...a, status: 'acknowledged' } : a))
      );
    } catch (err) {
      alert(`Acknowledge failed: ${err.message}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [alertId]: false }));
    }
  };

  const handleNotify = async (e, alertId) => {
    e.stopPropagation();
    if (!isOfficer) {
      onRequestLogin();
      return;
    }

    setActionLoading((prev) => ({ ...prev, [`notify_${alertId}`]: true }));
    try {
      const res = await sendAlertNotification(alertId);
      setNotificationStatus({
        alertId,
        message: `Notification sent to forest patrol units! (SMS: ${res.sms_sent ? 'Delivered' : 'Simulated'}, Email: ${res.email_sent ? 'Sent' : 'Simulated'})`,
      });
      setTimeout(() => setNotificationStatus(null), 6000);
    } catch (err) {
      alert(`Notification failed: ${err.message}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [`notify_${alertId}`]: false }));
    }
  };

  const handleCreateTestAlert = async () => {
    setActionLoading((prev) => ({ ...prev, testAlert: true }));
    try {
      await sendTestAlert({
        patch_id: 'MW-TEST-' + Math.floor(100 + Math.random() * 900),
        message: 'High canopy NDVI drop detected in core tiger sanctuary zone',
        severity: 'critical',
      });
      fetchAlertsList();
    } catch (err) {
      alert(`Test alert creation failed: ${err.message}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, testAlert: false }));
    }
  };

  return (
    <div>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Real-time Threat Queue
          </h2>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Ranked by priority score &amp; sanctuary sensitivity
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={handleCreateTestAlert}
            className="btn btn-ghost btn-sm"
            disabled={actionLoading.testAlert}
            title="Inject simulated satellite loss alert"
          >
            <PlusCircle size={12} /> Test Alert
          </button>
          <button onClick={fetchAlertsList} className="btn btn-ghost btn-sm">
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* Global Status Message */}
      {notificationStatus && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '8px',
          background: 'rgba(0, 230, 118, 0.15)',
          border: '1px solid rgba(0, 230, 118, 0.3)',
          color: 'var(--severity-low)',
          fontSize: '12px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          <span>{notificationStatus.message}</span>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', alignItems: 'center' }}>
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="form-select"
          style={{ padding: '6px 10px', fontSize: '12px' }}
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical Only</option>
          <option value="high">High Only</option>
          <option value="medium">Medium Only</option>
          <option value="low">Low Only</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={openOnly}
            onChange={(e) => setOpenOnly(e.target.checked)}
          />
          <span>Open Only</span>
        </label>
      </div>

      {/* Officer Mode Banner if logged out */}
      {!isOfficer && (
        <div style={{
          padding: '10px 12px',
          borderRadius: '8px',
          background: 'rgba(249, 168, 37, 0.1)',
          border: '1px solid rgba(249, 168, 37, 0.25)',
          marginBottom: '14px',
          fontSize: '11px',
          color: 'var(--accent-gold)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Officer token required for dispatch &amp; acknowledgment.</span>
          <button
            onClick={onRequestLogin}
            className="btn btn-sm"
            style={{ background: 'var(--accent-gold)', color: '#0A0F0D', fontSize: '10px', padding: '3px 8px' }}
          >
            Officer Login
          </button>
        </div>
      )}

      {/* Alerts List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
          <RefreshCw size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
          <div>Scanning active threat queue...</div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
          <Bell size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
          <div style={{ fontSize: '13px', fontWeight: 600 }}>No matching alerts found</div>
          <div style={{ fontSize: '11px' }}>All monitored sectors are currently within normal baseline thresholds.</div>
        </div>
      ) : (
        <div>
          {alerts.map((alertItem) => {
            const isCrit = alertItem.severity === 'critical';
            const isHigh = alertItem.severity === 'high';
            const isMed = alertItem.severity === 'medium';
            const sevClass = isCrit ? 'critical' : isHigh ? 'high' : isMed ? 'medium' : '';

            return (
              <div
                key={alertItem.alert_id}
                className={`alert-item ${sevClass}`}
                onClick={() => onSelectAlert && onSelectAlert(alertItem)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={`severity-badge ${alertItem.severity}`}>
                      {alertItem.severity}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {alertItem.patch_id}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Score:</span>
                    <span className="priority-score">{alertItem.priority_score || '85'}</span>
                  </div>
                </div>

                <div className="alert-message">
                  {alertItem.message}
                </div>

                <div className="alert-meta" style={{ justifyContent: 'space-between', marginTop: '10px' }}>
                  <div>
                    Status: <strong style={{ color: alertItem.status === 'acknowledged' ? 'var(--severity-low)' : 'var(--accent-amber)' }}>
                      {alertItem.status}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {alertItem.status !== 'acknowledged' && (
                      <button
                        onClick={(e) => handleAcknowledge(e, alertItem.alert_id)}
                        className="btn btn-ghost btn-sm"
                        disabled={actionLoading[alertItem.alert_id]}
                        title="Mark alert as acknowledged"
                        style={{ fontSize: '10px', padding: '3px 8px' }}
                      >
                        <CheckCircle2 size={12} /> Ack
                      </button>
                    )}
                    <button
                      onClick={(e) => handleNotify(e, alertItem.alert_id)}
                      className="btn btn-primary btn-sm"
                      disabled={actionLoading[`notify_${alertItem.alert_id}`]}
                      title="Dispatch automated SMS/Email field patrol notification"
                      style={{ fontSize: '10px', padding: '3px 8px' }}
                    >
                      <Send size={12} /> Dispatch
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
