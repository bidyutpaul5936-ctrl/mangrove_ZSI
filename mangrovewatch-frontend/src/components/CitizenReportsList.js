import React, { useState, useEffect } from 'react';
import { getCitizenReports, verifyCitizenReport } from '../api';
import { useAuth } from '../hooks/useAuth';
import {
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
} from 'lucide-react';

export default function CitizenReportsList({ onSelectReport, onRequestLogin }) {
  const { isOfficer } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [verifyNotes, setVerifyNotes] = useState({});

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      const data = await getCitizenReports(params);
      setReports(data || []);
    } catch (err) {
      console.error('Failed to load citizen reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filterStatus]);

  const handleVerify = async (reportId, newStatus) => {
    if (!isOfficer) {
      onRequestLogin();
      return;
    }

    setActionLoading((prev) => ({ ...prev, [reportId]: true }));
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      if (verifyNotes[reportId]) {
        formData.append('verification_notes', verifyNotes[reportId]);
      }

      const res = await verifyCitizenReport(reportId, formData);
      setReports((prev) =>
        prev.map((r) => (r.report_id === reportId ? { ...r, status: newStatus, verification_notes: verifyNotes[reportId] } : r))
      );
    } catch (err) {
      alert(`Verification failed: ${err.message}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [reportId]: false }));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Ground Eyewitness Logs
          </h2>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Community ranger observations &amp; field ground-truthing
          </div>
        </div>
        <button onClick={fetchReports} className="btn btn-ghost btn-sm">
          <RefreshCw size={12} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
        {['all', 'pending', 'confirmed', 'rejected'].map((st) => (
          <button
            key={st}
            type="button"
            className={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterStatus(st)}
            style={{ textTransform: 'capitalize', fontSize: '11px', padding: '4px 10px' }}
          >
            {st}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
          <RefreshCw size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
          <div>Retrieving community logs...</div>
        </div>
      ) : reports.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
          <MapPin size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
          <div style={{ fontSize: '13px', fontWeight: 600 }}>No reports in this category</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {reports.map((report) => {
            const isExpanded = expandedId === report.report_id;
            return (
              <div
                key={report.report_id}
                className="card"
                style={{ padding: '12px 14px', marginBottom: 0, transition: 'var(--transition-fast)' }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }}
                  onClick={() => setExpandedId(isExpanded ? null : report.report_id)}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span className={`status-badge ${report.status}`}>
                        {report.status}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {report.report_id}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {(report.category || 'General Incident').replace(/_/g, ' ').toUpperCase()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectReport) onSelectReport(report);
                      }}
                      title="Fly to coordinates on map"
                      style={{ padding: '4px 8px' }}
                    >
                      <MapPin size={12} /> Map
                    </button>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
                  {report.description}
                </div>

                {/* Auto Linked Badge */}
                {report.linked_patch_id && (
                  <div style={{
                    marginTop: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(0, 229, 255, 0.1)',
                    border: '1px solid rgba(0, 229, 255, 0.25)',
                    color: 'var(--accent-cyan)',
                    fontSize: '11px'
                  }}>
                    <span>🔗 Linked to Patch:</span>
                    <strong>{report.linked_patch_id}</strong>
                  </div>
                )}

                {/* Expanded Details & Verification controls */}
                {isExpanded && (
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      <div>Lat: <strong>{Number(report.latitude).toFixed(4)}</strong></div>
                      <div>Lng: <strong>{Number(report.longitude).toFixed(4)}</strong></div>
                      <div>Reporter: <strong>{report.reporter_name || 'Anonymous'}</strong></div>
                      <div>Date: <strong>{new Date(report.timestamp || Date.now()).toLocaleDateString()}</strong></div>
                    </div>

                    {report.photo_url && (
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ImageIcon size={12} /> Field Photographic Evidence:
                        </div>
                        <img
                          src={report.photo_url}
                          alt="Field Evidence"
                          style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--glass-border)' }}
                        />
                      </div>
                    )}

                    {/* Officer Verification Form */}
                    <div style={{
                      marginTop: '8px',
                      padding: '10px',
                      borderRadius: '6px',
                      background: 'var(--surface-3)',
                      border: '1px solid var(--glass-border)'
                    }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={13} style={{ color: 'var(--primary-400)' }} /> Officer Determination
                      </div>

                      {isOfficer ? (
                        <>
                          <input
                            type="text"
                            placeholder="Add field inspection notes..."
                            className="form-input"
                            value={verifyNotes[report.report_id] || ''}
                            onChange={(e) =>
                              setVerifyNotes({ ...verifyNotes, [report.report_id]: e.target.value })
                            }
                            style={{ fontSize: '11px', padding: '4px 8px', marginBottom: '8px' }}
                          />
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => handleVerify(report.report_id, 'confirmed')}
                              className="btn btn-sm"
                              style={{ background: 'var(--severity-low)', color: '#0A0F0D', flex: 1, fontSize: '11px' }}
                              disabled={actionLoading[report.report_id]}
                            >
                              <CheckCircle size={12} /> Confirm Eyewitness
                            </button>
                            <button
                              onClick={() => handleVerify(report.report_id, 'rejected')}
                              className="btn btn-sm btn-danger"
                              style={{ flex: 1, fontSize: '11px' }}
                              disabled={actionLoading[report.report_id]}
                            >
                              <XCircle size={12} /> Reject False Alarm
                            </button>
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Sign in with officer token to verify report.</span>
                          <button
                            onClick={onRequestLogin}
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: '10px', padding: '2px 6px' }}
                          >
                            Authenticate
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
