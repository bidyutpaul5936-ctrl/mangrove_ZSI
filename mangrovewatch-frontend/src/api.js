/**
 * MangroveWatch API Module
 * 
 * Single module for all backend API calls.
 * Uses VITE_API_URL from environment variables — never hardcoded.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const config = {
    headers: {},
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('officer_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(config.body instanceof FormData)) {
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
  }

  try {
    const response = await fetch(url, config);
    
    // Handle PDF downloads
    if (response.headers.get('content-type')?.includes('application/pdf')) {
      return response.blob();
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new ApiError(response.status, data.detail || 'API Error', data);
    }
    
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error(`API request failed: ${url}`, error);
    throw new ApiError(0, error.message || 'Network error');
  }
}

// ── Health ──
export const checkHealth = () => request('/health');

// ── Detection ──
export const getLossPatches = (params = {}) => {
  const query = new URLSearchParams();
  if (params.startDate) query.set('start_date', params.startDate);
  if (params.endDate) query.set('end_date', params.endDate);
  if (params.minArea) query.set('min_area', params.minArea);
  if (params.year) query.set('year', params.year);
  if (params.cause) query.set('cause', params.cause);
  if (params.severity) query.set('severity', params.severity);
  const qs = query.toString();
  return request(`/api/detection/loss-patches${qs ? `?${qs}` : ''}`);
};

export const getMangroveExtent = () => request('/api/detection/extent');

export const getProtectedAreas = () => request('/api/detection/protected-areas');

export const getCarbonEstimate = (patchId) => request(`/api/detection/carbon/${patchId}`);

export const getAggregateCarbonLoss = () => request('/api/detection/carbon');

export const getDashboardStats = () => request('/api/detection/stats');

export const getTimelapseData = () => request('/api/detection/timelapse');

// ── Evidence Reports ──
export const generateEvidencePDF = async (patchId) => {
  const blob = await request(`/api/reports/evidence/${patchId}`, { method: 'POST' });
  return blob;
};

export const getEvidenceMetadata = (patchId) => request(`/api/reports/evidence/${patchId}/meta`);

export const downloadEvidencePDF = async (patchId) => {
  const blob = await generateEvidencePDF(patchId);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MangroveWatch_Evidence_${patchId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// ── Citizen Reports ──
export const getCitizenReports = (params = {}) => {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.category) query.set('category', params.category);
  const qs = query.toString();
  return request(`/api/citizen-reports${qs ? `?${qs}` : ''}`);
};

export const submitCitizenReport = (formData) => {
  return request('/api/citizen-reports', {
    method: 'POST',
    body: formData,
    headers: {}, // Let browser set Content-Type for FormData
  });
};

export const verifyCitizenReport = (reportId, formData) => {
  return request(`/api/citizen-reports/${reportId}/verify`, {
    method: 'PUT',
    body: formData,
    headers: {},
  });
};

// ── Alerts ──
export const getAlerts = (params = {}) => {
  const query = new URLSearchParams();
  if (params.openOnly) query.set('open_only', 'true');
  if (params.severity) query.set('severity', params.severity);
  const qs = query.toString();
  return request(`/api/alerts${qs ? `?${qs}` : ''}`);
};

export const acknowledgeAlert = (alertId) => {
  return request(`/api/alerts/${alertId}/acknowledge`, { method: 'PUT' });
};

export const sendAlertNotification = (alertId) => {
  return request(`/api/alerts/${alertId}/notify`, { method: 'POST' });
};

export const sendTestAlert = (data = {}) => {
  return request('/api/alerts/test', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// ── Auth ──
export const login = (token) => {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
};

export const verifyAuth = () => request('/api/auth/verify');

export default {
  checkHealth,
  getLossPatches,
  getMangroveExtent,
  getProtectedAreas,
  getCarbonEstimate,
  getAggregateCarbonLoss,
  getDashboardStats,
  getTimelapseData,
  generateEvidencePDF,
  downloadEvidencePDF,
  getEvidenceMetadata,
  getCitizenReports,
  submitCitizenReport,
  verifyCitizenReport,
  getAlerts,
  acknowledgeAlert,
  sendAlertNotification,
  sendTestAlert,
  login,
  verifyAuth,
};
