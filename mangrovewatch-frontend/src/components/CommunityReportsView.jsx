import React, { useState, useEffect } from 'react';
import {
  Users,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UploadCloud,
  Send,
  Eye,
  Camera,
  ShieldCheck,
  Search,
  Filter,
  ExternalLink,
  Link as LinkIcon
} from 'lucide-react';
import { getCitizenReports, submitCitizenReport } from '../api';
import { useAuth } from '../hooks/useAuth';

export default function CommunityReportsView({ onSelectReportLocation }) {
  const { isOfficer } = useAuth();
  const [reports, setReports] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // New report form state
  const [formData, setFormData] = useState({
    latitude: '21.724',
    longitude: '89.135',
    category: 'clearing',
    description: '',
    reporter_name: '',
    photo_file: null,
  });

  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await getCitizenReports();
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo_file: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const postData = new FormData();
      postData.append('latitude', formData.latitude);
      postData.append('longitude', formData.longitude);
      postData.append('category', formData.category);
      postData.append('description', formData.description);
      postData.append('reporter_name', formData.reporter_name || 'Anonymous Eco-Patrol');
      if (formData.photo_file) {
        postData.append('photo', formData.photo_file);
      }

      const res = await submitCitizenReport(postData);
      setSubmitSuccess(true);
      setFormData({
        latitude: '21.724',
        longitude: '89.135',
        category: 'clearing',
        description: '',
        reporter_name: '',
        photo_file: null,
      });
      setPreviewImage(null);
      await loadReports();
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="view-page-container community-reports-page">
      {/* ── Top Header & Stats ── */}
      <div className="community-header-card">
        <div className="header-left">
          <div className="badge-community">
            <Users size={16} />
            <span>COMMUNITY EYEWITNESS GROUND TRUTH</span>
          </div>
          <h2>Sundarbans Field Watch &amp; Ranger Submissions</h2>
          <p>
            Ground observations filed by local eco-patrols, fishermen, and forest guards cross-verified against Sentinel-2 satellite data.
          </p>
        </div>

        <div className="header-stats">
          <div className="stat-pill">
            <span className="stat-num">{reports.length}</span>
            <span className="stat-title">Total Reports</span>
          </div>
          <div className="stat-pill confirmed">
            <span className="stat-num">
              {reports.filter((r) => r.status === 'confirmed').length}
            </span>
            <span className="stat-title">Verified by Officers</span>
          </div>
        </div>
      </div>

      {/* ── Two-Column Layout: Eyewitness Feed & Submission Station ── */}
      <div className="community-grid-layout">
        {/* Left Column: Eyewitness Submissions Stream */}
        <section className="feed-column">
          <div className="feed-card">
            {/* Filter Tabs */}
            <div className="feed-card-header">
              <h3>Eyewitness Ground Submissions</h3>
              <div className="feed-filter-pills">
                {['all', 'confirmed', 'pending'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`filter-btn ${filterStatus === st ? 'active' : ''}`}
                    onClick={() => setFilterStatus(st)}
                  >
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Submissions List */}
            <div className="feed-items-list">
              {loading ? (
                <div className="skeleton-container">
                  <div className="skeleton-line" style={{ height: '90px' }}></div>
                  <div className="skeleton-line" style={{ height: '90px' }}></div>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="empty-state">
                  <Users size={28} />
                  <p>No community submissions found in this category.</p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div key={report.id} className="eyewitness-card">
                    {/* Thumbnail Image */}
                    <div className="card-thumb-wrapper">
                      <img
                        src={
                          report.photo_url ||
                          'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&auto=format&fit=crop&q=80'
                        }
                        alt="Violation observation photo"
                        className="thumb-img"
                        loading="lazy"
                      />
                      <span className={`status-badge-corner ${report.status}`}>
                        {report.status === 'confirmed' ? 'Verified' : 'Pending Review'}
                      </span>
                    </div>

                    {/* Report Information */}
                    <div className="card-info">
                      <div className="card-top-row">
                        <div className="category-tag">
                          {(report.category || 'clearing').replace(/_/g, ' ')}
                        </div>
                        <span className="timestamp-tag">
                          {report.created_at
                            ? new Date(report.created_at).toLocaleDateString()
                            : 'Recent'}
                        </span>
                      </div>

                      <p className="card-description">{report.description}</p>

                      {/* GPS & Reporter Meta */}
                      <div className="card-meta-row">
                        <div className="gps-tag font-mono">
                          <MapPin size={12} />
                          <span>
                            {parseFloat(report.lat).toFixed(4)}°N, {parseFloat(report.lng).toFixed(4)}°E
                          </span>
                        </div>
                        <div className="reporter-tag">
                          <span>Reported by: <strong>{report.reporter_name || 'Anonymous Ranger'}</strong></span>
                        </div>
                      </div>

                      {/* Satellite Cross-Link Badge if confirmed */}
                      {report.linked_patch_id && (
                        <div className="linked-satellite-box">
                          <LinkIcon size={12} />
                          <span>Auto-Matched with Sentinel-2 Patch: <strong>{report.linked_patch_id}</strong></span>
                        </div>
                      )}

                      {/* Officer Notes if present */}
                      {report.officer_notes && (
                        <div className="officer-notes-box">
                          <strong>Officer Action:</strong> {report.officer_notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Right Column: Field Ground Report Filing Station */}
        <section className="form-column">
          <div className="submission-station-card">
            <div className="station-header">
              <div className="station-badge">
                <Camera size={15} />
                <span>FIELD SUBMISSION STATION</span>
              </div>
              <h3>File Ground Truth Report</h3>
              <p>
                Document mangrove destruction, illegal fishing dykes, or chemical dumping. Submissions are cryptographically time-stamped.
              </p>
            </div>

            {submitSuccess && (
              <div className="submission-alert success">
                <CheckCircle2 size={16} />
                <span>Report successfully transmitted to Forest Operations Control!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="report-form">
              {/* Category Picker */}
              <div className="form-group">
                <label htmlFor="report-category">Violation Category *</label>
                <select
                  id="report-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="form-control"
                  required
                >
                  <option value="clearing">Illegal Canopy Clearing / Felling</option>
                  <option value="pond_conversion">Commercial Shrimp Pond Excavation</option>
                  <option value="dumping">Toxic Chemical / Ship Effluent Dumping</option>
                  <option value="erosion_cyclone">Embankment Breach / Severe Tidal Wash</option>
                  <option value="poaching">Wildlife Trapping / Poaching Activity</option>
                </select>
              </div>

              {/* GPS Coordinates Grid */}
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="report-lat">Latitude (°N) *</label>
                  <input
                    id="report-lat"
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="form-control font-mono"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="report-lng">Longitude (°E) *</label>
                  <input
                    id="report-lng"
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="form-control font-mono"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="report-desc">Observation Details *</label>
                <textarea
                  id="report-desc"
                  rows="3"
                  placeholder="Describe number of trees cut, machinery, boat registrations, or water coloration..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-control"
                  required
                ></textarea>
              </div>

              {/* Reporter Identity */}
              <div className="form-group">
                <label htmlFor="report-name">Reporter Identity (Optional)</label>
                <input
                  id="report-name"
                  type="text"
                  placeholder="Your Name, Ranger Beat, or Leave Blank for Anonymous Protection"
                  value={formData.reporter_name}
                  onChange={(e) => setFormData({ ...formData, reporter_name: e.target.value })}
                  className="form-control"
                />
              </div>

              {/* Photo Upload with Instant Preview */}
              <div className="form-group">
                <label>Evidence Photo Upload</label>
                <div className="file-drop-area">
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input-hidden"
                  />
                  <label htmlFor="photo-upload" className="file-drop-label">
                    {previewImage ? (
                      <div className="preview-container">
                        <img src={previewImage} alt="Preview" className="img-preview" />
                        <span className="change-photo-text">Click to change photo</span>
                      </div>
                    ) : (
                      <div className="drop-prompt">
                        <UploadCloud size={24} className="upload-icon" />
                        <span>Click or drag field photo here</span>
                        <span className="file-limits">JPEG, PNG, WebP up to 10MB</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-submit-report"
                disabled={submitting}
              >
                <Send size={15} />
                <span>{submitting ? 'Transmitting to Radar...' : 'Submit Eyewitness Report'}</span>
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
