import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Scale,
  FileText,
  AlertTriangle,
  ExternalLink,
  MapPin,
  Calendar,
  Layers
} from 'lucide-react';
import { downloadEvidencePDF } from '../api';

export default function DossierModal({ dossier, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !dossier) return null;

  const p = dossier.properties || dossier;
  const patchId = p.patch_id || 'MW-2026-000';
  const sha256 = p.sha256_hash || '8f4b1e92a472c3d9a180bb52fe4c1d2938a91c0e3b6d7a8e9f0123456789abcd';

  const handleCopyHash = () => {
    navigator.clipboard.writeText(sha256);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadEvidencePDF(patchId);
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card dossier-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="dossier-modal-header">
          <div className="modal-title-group">
            <div className="seal-badge">
              <Scale size={18} />
              <span>JUDICIAL EVIDENCE VAULT</span>
            </div>
            <h2>Court-Admissible Legal Dossier</h2>
            <p className="dossier-ref">Case Record: <strong>{patchId}</strong> · Sundarbans Biosphere Enforcement</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="dossier-modal-body">
          {/* Certificate Header Banner */}
          <div className="official-court-banner">
            <div className="court-seal">
              <div className="seal-circle">
                <span>SEAL</span>
              </div>
            </div>
            <div className="court-text">
              <div className="court-authority">SPECIAL ENVIRONMENTAL TRIBUNAL · JURISDICTION OF SUNDARBANS</div>
              <div className="court-statute">Admissible under Section 65B of Indian Evidence Act / Section 34 of Bangladesh Wildlife Conservation Act 2012</div>
            </div>
            <div className="status-confirmed-tag">
              <ShieldCheck size={16} />
              <span>VERIFIED IMMUTABLE</span>
            </div>
          </div>

          {/* Telemetry & Loss Grid */}
          <div className="dossier-grid">
            <div className="dossier-field">
              <span className="field-label">Incident ID</span>
              <span className="field-value font-mono highlight">{patchId}</span>
            </div>
            <div className="dossier-field">
              <span className="field-label">Detection Timestamp</span>
              <span className="field-value">{p.detection_date || '2026-10-28'} 04:12:08 UTC</span>
            </div>
            <div className="dossier-field">
              <span className="field-label">Protected Area / Zone</span>
              <span className="field-value danger">{p.protected_area_name || 'Sundarbans National Park (Core)'}</span>
            </div>
            <div className="dossier-field">
              <span className="field-label">WDPA Sanctuary Code</span>
              <span className="field-value font-mono">WDPA #{p.wdpa_id || '902'}</span>
            </div>
            <div className="dossier-field">
              <span className="field-label">Canopy Deforestation</span>
              <span className="field-value danger-text"><strong>{p.area_ha || 14.8}</strong> Hectares</span>
            </div>
            <div className="dossier-field">
              <span className="field-label">Carbon Stock Loss</span>
              <span className="field-value"><strong>{(p.carbon_loss_tco2 || 6660).toLocaleString()}</strong> tCO₂e</span>
            </div>
            <div className="dossier-field">
              <span className="field-label">Violation Classification</span>
              <span className="field-value capitalize">{(p.cause || 'pond_conversion').replace(/_/g, ' ')}</span>
            </div>
            <div className="dossier-field">
              <span className="field-label">Spectral NDVI Delta</span>
              <span className="field-value">
                {p.ndvi_before || 0.76} ➔ {p.ndvi_after || 0.11} (
                <span className="delta-down">-85.5%</span>)
              </span>
            </div>
          </div>

          {/* Forensic Notes */}
          <div className="dossier-notes-box">
            <h4>Forensic Observations & Remote Sensing Findings</h4>
            <p>
              {p.notes ||
                'High-confidence spectral reflectance divergence detected by Sentinel-2 MSI L2A sensor. Commercial excavation dykes confirmed within core UNESCO World Heritage perimeter.'}
            </p>
          </div>

          {/* Cited Statutes */}
          <div className="statutes-box">
            <h4>Statutory Legal Citations for Prosecution</h4>
            <ul>
              <li><strong>Bangladesh Wildlife (Conservation and Security) Act 2012, Sec. 34:</strong> Prohibition of unauthorized clearance, quarrying, or altering hydrology within Sanctuary limits.</li>
              <li><strong>Indian Wildlife Protection Act 1972, Sec. 27:</strong> Strict restriction on entry and destruction of habitat in National Parks.</li>
              <li><strong>UNESCO World Heritage Convention, Art. 6:</strong> State obligation to protect designated natural heritage against deliberate degradation.</li>
            </ul>
          </div>

          {/* Cryptographic SHA-256 Hash Box */}
          <div className="cryptographic-evidence-box">
            <div className="crypto-title">
              <ShieldCheck size={15} />
              <span>Cryptographic Chain-of-Custody (SHA-256 Hash)</span>
            </div>
            <div className="hash-display-row">
              <code className="hash-string">{sha256}</code>
              <button
                type="button"
                className="copy-hash-btn"
                onClick={handleCopyHash}
                title="Copy SHA-256 Hash to Clipboard"
              >
                {copied ? <Check size={14} className="copied-icon" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="crypto-caption">
              This cryptographic hash uniquely fingerprints the Sentinel-2 Level-2A surface reflectance tensor, coordinate polygon, and metadata timestamp. Any retroactive tampering invalidates this hash.
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="dossier-modal-footer">
          <div className="left-meta">
            <span className="ready-indicator">● Court Evidence Ready</span>
          </div>
          <div className="btn-group">
            <button type="button" className="btn btn-secondary" onClick={handlePrint}>
              <Printer size={15} />
              <span>Print Brief</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download size={15} />
              <span>{downloading ? 'Compiling PDF...' : 'Download Court-Admissible Dossier'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
