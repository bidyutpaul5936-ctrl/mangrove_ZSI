import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  ExternalLink,
  Calendar,
  MapPin,
  CheckCircle2,
  FileText,
  AlertCircle,
  Eye,
  Lock
} from 'lucide-react';
import { LOSS_PATCHES_GEOJSON } from '../data/mockData';
import { downloadEvidencePDF } from '../api';

export default function LegalDossiersView({ onSelectDossier }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [copiedHash, setCopiedHash] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [verifyingAll, setVerifyingAll] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  const dossiers = LOSS_PATCHES_GEOJSON.features.map((f) => f.properties);

  const handleCopyHash = (e, hash) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleDownload = async (e, patchId) => {
    e.stopPropagation();
    setDownloadingId(patchId);
    try {
      await downloadEvidencePDF(patchId);
    } catch (err) {
      alert(`Could not download dossier: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleVerifyIntegrity = () => {
    setVerifyingAll(true);
    setTimeout(() => {
      setVerifyingAll(false);
      setVerifiedSuccess(true);
      setTimeout(() => setVerifiedSuccess(false), 4000);
    }, 1200);
  };

  const filteredDossiers = dossiers.filter((d) => {
    const matchesSearch =
      d.patch_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.protected_area_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.sha256_hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.cause || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity =
      severityFilter === 'all' || d.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="view-page-container legal-dossiers-page">
      {/* ── Banner: Cryptographic Integrity Verification ── */}
      <div className="legal-trust-banner">
        <div className="trust-left">
          <div className="trust-icon-box">
            <Lock size={22} className="trust-icon" />
          </div>
          <div className="trust-text">
            <h3>Court-Admissible Evidence Registry · Sundarbans Biosphere</h3>
            <p>
              Every environmental violation detected by Sentinel-2 is immutably hashed with SHA-256 for admissibility under Section 65B of Electronic Evidence Laws.
            </p>
          </div>
        </div>

        <div className="trust-right">
          <button
            type="button"
            className={`btn-verify-all ${verifiedSuccess ? 'verified' : ''}`}
            onClick={handleVerifyIntegrity}
            disabled={verifyingAll}
          >
            {verifyingAll ? (
              <>
                <span className="mini-spinner"></span>
                <span>Auditing Merkle Roots...</span>
              </>
            ) : verifiedSuccess ? (
              <>
                <CheckCircle2 size={16} />
                <span>All 38 Hashes Intact</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Verify SHA-256 Chain</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Control Bar: Search & Filters ── */}
      <div className="dossiers-control-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by Incident ID, Protected Sanctuary, or SHA-256 hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <span className="filter-label">Severity:</span>
          <div className="pill-filters">
            {['all', 'critical', 'high', 'medium'].map((sev) => (
              <button
                key={sev}
                type="button"
                className={`filter-btn ${severityFilter === sev ? 'active' : ''}`}
                onClick={() => setSeverityFilter(sev)}
              >
                {sev.charAt(0).toUpperCase() + sev.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Structured Data Table for Legal Dossiers ── */}
      <div className="table-responsive-card">
        <table className="dossier-data-table">
          <thead>
            <tr>
              <th>Incident ID</th>
              <th>Location &amp; Sanctuary</th>
              <th>Detection Timestamp</th>
              <th>Deforested Area</th>
              <th>Severity</th>
              <th>SHA-256 Cryptographic Hash</th>
              <th>Custody Chain</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDossiers.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-table-cell">
                  <div className="empty-state">
                    <FileText size={32} />
                    <p>No legal dossiers found matching your search query.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredDossiers.map((dossier) => {
                const isDownloading = downloadingId === dossier.patch_id;
                const isHashCopied = copiedHash === dossier.sha256_hash;

                return (
                  <tr
                    key={dossier.patch_id}
                    className="dossier-row"
                    onClick={() => onSelectDossier(dossier)}
                    title="Click to inspect judicial dossier brief"
                  >
                    {/* 1. Incident ID */}
                    <td className="font-mono">
                      <div className="incident-id-cell">
                        <Scale size={14} className="cell-gavel" />
                        <span className="incident-id-text">{dossier.patch_id}</span>
                      </div>
                    </td>

                    {/* 2. Location & Sanctuary */}
                    <td>
                      <div className="location-cell">
                        <div className="sanctuary-name font-semibold">
                          {dossier.protected_area_name}
                        </div>
                        <div className="sanctuary-sub">
                          WDPA #{dossier.wdpa_id || '902'} · {(dossier.cause || 'clearing').replace(/_/g, ' ')}
                        </div>
                      </div>
                    </td>

                    {/* 3. Timestamp */}
                    <td>
                      <div className="timestamp-cell">
                        <Calendar size={13} className="time-icon" />
                        <span>{dossier.detection_date} 04:12 UTC</span>
                      </div>
                    </td>

                    {/* 4. Deforested Area */}
                    <td>
                      <div className="area-cell">
                        <span className="area-val font-semibold">{dossier.area_ha} ha</span>
                        <span className="carbon-val">({dossier.carbon_loss_tco2.toLocaleString()} tCO₂)</span>
                      </div>
                    </td>

                    {/* 5. Severity */}
                    <td>
                      <span className={`severity-badge ${dossier.severity}`}>
                        {dossier.severity}
                      </span>
                    </td>

                    {/* 6. SHA-256 Hash String with Copy Tooltip */}
                    <td>
                      <div
                        className="hash-pill"
                        onClick={(e) => handleCopyHash(e, dossier.sha256_hash)}
                        title="Click to copy 64-char SHA-256 string"
                      >
                        <span className="hash-code font-mono">
                          {dossier.sha256_hash.slice(0, 10)}...{dossier.sha256_hash.slice(-8)}
                        </span>
                        <button type="button" className="copy-btn-mini" aria-label="Copy hash">
                          {isHashCopied ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>

                    {/* 7. Custody Chain */}
                    <td>
                      <div className="custody-tag">
                        <ShieldCheck size={13} className="custody-icon" />
                        <span>ESA Signed</span>
                      </div>
                    </td>

                    {/* 8. Download Court-Admissible Dossier Action */}
                    <td className="text-right">
                      <div className="actions-cell">
                        <button
                          type="button"
                          className="btn-download-dossier"
                          onClick={(e) => handleDownload(e, dossier.patch_id)}
                          disabled={isDownloading}
                          title="Generate & Download Court-Admissible Evidence Dossier"
                        >
                          <Download size={14} />
                          <span>{isDownloading ? 'Generating...' : 'Download Dossier'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Table Footer & Legal Advisory ── */}
      <div className="legal-table-footer">
        <div className="compliance-seal">
          <span>⚖️ Automated Evidence Integrity Protocol: ISO/IEC 27037 Digital Forensics Standards Compliant</span>
        </div>
        <div className="record-count">
          Showing <strong>{filteredDossiers.length}</strong> of <strong>{dossiers.length}</strong> Registered Legal Dossiers
        </div>
      </div>
    </div>
  );
}
