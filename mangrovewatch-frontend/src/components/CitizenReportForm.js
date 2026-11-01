import React, { useState, useEffect } from 'react';
import { submitCitizenReport } from '../api';
import {
  MapPin,
  Camera,
  Upload,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Send,
  X,
  Compass
} from 'lucide-react';

export default function CitizenReportForm({ selectedLocation, onClearLocation, onReportSubmitted }) {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [category, setCategory] = useState('illegal_clearing');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [error, setError] = useState(null);

  // Sync with pin-drop from map if user clicked on map
  useEffect(() => {
    if (selectedLocation) {
      setLatitude(selectedLocation.lat.toFixed(5));
      setLongitude(selectedLocation.lng.toFixed(5));
    }
  }, [selectedLocation]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSundarbansLocation = () => {
    setLatitude('21.84210');
    setLongitude('89.28150');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitResult(null);

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lngNum)) {
      setError('Please provide valid latitude and longitude coordinates.');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a brief description of the ground observation.');
      return;
    }

    const formData = new FormData();
    formData.append('latitude', latNum);
    formData.append('longitude', lngNum);
    formData.append('category', category);
    formData.append('description', description.trim());
    if (reporterName.trim()) {
      formData.append('reporter_name', reporterName.trim());
    }
    if (photo) {
      formData.append('photo', photo);
    }

    setIsSubmitting(true);
    try {
      const res = await submitCitizenReport(formData);
      setSubmitResult(res);
      // Reset form fields
      setDescription('');
      setPhoto(null);
      setPhotoPreview(null);
      if (onReportSubmitted) {
        onReportSubmitted(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please check network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitResult(null);
    setError(null);
    if (onClearLocation) onClearLocation();
  };

  return (
    <div className="card" style={{ padding: '18px' }}>
      <div className="card-header" style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={18} style={{ color: 'var(--accent-cyan)' }} />
          <div>
            <h3 className="card-title" style={{ fontSize: '14px' }}>Ground Verification Report</h3>
            <p className="card-subtitle">Community eyewitness field submission</p>
          </div>
        </div>
      </div>

      {submitResult ? (
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          background: 'rgba(0, 230, 118, 0.12)',
          border: '1px solid rgba(0, 230, 118, 0.3)',
          marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--severity-low)', marginBottom: '8px' }}>
            <CheckCircle size={20} />
            <span style={{ fontWeight: 700, fontSize: '13px' }}>Report Successfully Logged</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '10px', lineHeight: 1.4 }}>
            Report reference ID: <strong>{submitResult.report_id}</strong>.
            {submitResult.linked_patch_id ? (
              <div style={{
                marginTop: '8px',
                padding: '8px 10px',
                borderRadius: '6px',
                background: 'rgba(249, 168, 37, 0.15)',
                border: '1px solid rgba(249, 168, 37, 0.3)',
                color: 'var(--accent-gold)',
                fontSize: '11px',
                fontWeight: 600
              }}>
                🎯 Automated Satellite Cross-Match! Successfully linked with detected Sentinel-2 patch <strong>{submitResult.linked_patch_id}</strong>.
              </div>
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Queued for forest patrol ground inspection &amp; validation.
              </div>
            )}
          </div>
          <button onClick={handleReset} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
            Submit Another Ground Report
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: '8px 12px',
              borderRadius: '6px',
              background: 'rgba(255, 23, 68, 0.15)',
              border: '1px solid rgba(255, 23, 68, 0.3)',
              color: 'var(--accent-red)',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '12px'
            }}>
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Location Picker / Inputs */}
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} /> Geographic Coordinates
              </label>
              <button
                type="button"
                onClick={handleUseSundarbansLocation}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-400)',
                  cursor: 'pointer',
                  fontSize: '10px',
                  textDecoration: 'underline'
                }}
              >
                Preset Sundarbans
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Latitude (e.g. 21.842)"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                style={{ fontSize: '12px', padding: '6px 8px' }}
                required
              />
              <input
                type="text"
                className="form-input"
                placeholder="Longitude (e.g. 89.281)"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                style={{ fontSize: '12px', padding: '6px 8px' }}
                required
              />
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
              💡 Tip: Click anywhere on the map to pin-drop exact GPS coordinates.
            </div>
          </div>

          {/* Incident Category */}
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Observation Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ fontSize: '12px', padding: '6px 8px' }}
            >
              <option value="illegal_clearing">Illegal Logging / Clear-felling</option>
              <option value="aquaculture_encroachment">Shrimp Farm / Aquaculture Encroachment</option>
              <option value="waste_dumping">Toxic Chemical / Waste Dumping</option>
              <option value="bund_breach">Embankment Breach / Canal Cutting</option>
              <option value="dead_trees">Unexplained Tree Die-off / Desiccation</option>
            </select>
          </div>

          {/* Ground Narrative */}
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Field Evidence Description</label>
            <textarea
              className="form-textarea"
              placeholder="Describe equipment observed, boat activity, felled stumps, water discoloration..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ fontSize: '12px' }}
              required
            />
          </div>

          {/* Photo Evidence Upload */}
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Camera size={12} /> Photographic Evidence (EXIF Protected)
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <label
                className="btn btn-ghost btn-sm"
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Upload size={12} />
                <span>{photo ? 'Replace Photo' : 'Upload Camera Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
              </label>
              {photo && (
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {photo.name}
                </span>
              )}
            </div>

            {photoPreview && (
              <div style={{ marginTop: '8px', position: 'relative', width: '100%', height: '110px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                <img
                  src={photoPreview}
                  alt="Field Evidence Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: 'rgba(0,0,0,0.7)',
                    border: 'none',
                    borderRadius: '50%',
                    color: 'white',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            )}
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
              🔒 Metadata sanitization: EXIF coordinates and device signatures are automatically scrubbed for whistleblower safety.
            </div>
          </div>

          {/* Reporter Identification (Optional) */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Reporter / Ranger Patrol (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Anonymous Community Monitor"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              style={{ fontSize: '12px', padding: '6px 8px' }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%' }}
          >
            {isSubmitting ? 'Transmitting Field Data...' : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Send size={14} /> Submit Ground Incident
              </span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
