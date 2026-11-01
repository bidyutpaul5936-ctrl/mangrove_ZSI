import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, Key, X, AlertCircle } from 'lucide-react';

export default function LoginModal({ isOpen, onClose }) {
  const { login, isOfficer, logout } = useAuth();
  const [tokenInput, setTokenInput] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!tokenInput.trim()) {
      setError('Please enter your officer secret token');
      return;
    }

    setIsSubmitting(true);
    const result = await login(tokenInput.trim());
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.message || 'Invalid officer token. Check your environment configuration.');
    }
  };

  const handleUseDefault = () => {
    setTokenInput('mangrovewatch-officer-secret-2024');
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div className="card" onClick={(e) => e.stopPropagation()} style={{
        width: '100%',
        maxWidth: '440px',
        margin: '20px',
        background: 'var(--surface-1)',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(76, 175, 80, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-400)'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                {isOfficer ? 'Officer Mode Active' : 'Forest Officer Authentication'}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                {isOfficer ? 'Verified environmental law officer session' : 'Verify credentials for legal enforcement actions'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        {isOfficer ? (
          <div>
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              background: 'rgba(0, 230, 118, 0.1)',
              border: '1px solid rgba(0, 230, 118, 0.2)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <ShieldCheck size={24} style={{ color: 'var(--severity-low)' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--severity-low)' }}>
                  Authorized Officer Privileges Enabled
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  You have full rights to acknowledge alerts, dispatch field units, and verify ground community evidence.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={onClose} className="btn btn-ghost">
                Close
              </button>
              <button 
                onClick={() => { logout(); onClose(); }} 
                className="btn btn-danger"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 23, 68, 0.12)',
                border: '1px solid rgba(255, 23, 68, 0.3)',
                color: 'var(--accent-red)',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={14} /> Officer Bearer Token
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter secret officer access token..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                autoFocus
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                For demo evaluation, you can use the default preset:
                <button
                  type="button"
                  onClick={handleUseDefault}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-400)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    marginLeft: '4px',
                    fontFamily: 'inherit',
                    fontSize: '11px',
                    padding: 0
                  }}
                >
                  Use Demo Token
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button type="button" onClick={onClose} className="btn btn-ghost">
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verifying...' : 'Authorize Officer Mode'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
