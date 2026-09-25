import axios from 'axios';
import { setCachedData, getCachedData } from './db.js';

const baseURL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor to always attach current token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('polarlogix_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Generate cache key for GET requests
const getCacheKey = (url, params) => {
  if (!params || Object.keys(params).length === 0) return url;
  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
  return `${url}?${sorted}`;
};

// Response Interceptor for IndexedDB Auto-Caching & Offline Fallback
api.interceptors.response.use(
  async (response) => {
    // Only cache GET responses
    if (response.config.method?.toLowerCase() === 'get') {
      const cacheKey = getCacheKey(response.config.url, response.config.params);
      // Asynchronously cache to IndexedDB
      setCachedData(cacheKey, response.data);
      // Also cache normalized entity keys for offline read access
      if (response.config.url.includes('/dashboard/summary')) {
        setCachedData('cached_dashboard_summary', response.data);
      } else if (response.config.url.includes('/shipments') && !response.config.url.match(/\/shipments\/[^\/]+/)) {
        setCachedData('cached_shipments', response.data);
      } else if (response.config.url.includes('/inventory')) {
        setCachedData('cached_inventory', response.data);
      } else if (response.config.url.includes('/personnel') && !response.config.url.match(/\/personnel\/[^\/]+/)) {
        setCachedData('cached_personnel', response.data);
      } else if (response.config.url.includes('/emergencies')) {
        setCachedData('cached_emergencies', response.data);
      } else if (response.config.url.includes('/locations')) {
        setCachedData('cached_locations', response.data);
      }
    }
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and let state refresh
      localStorage.removeItem('polarlogix_token');
      localStorage.removeItem('polarlogix_user');
      return Promise.reject(error);
    }

    // If network error / offline / timeout on a GET request, attempt to serve from IndexedDB cache
    if ((!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') &&
        error.config?.method?.toLowerCase() === 'get') {
      const cacheKey = getCacheKey(error.config.url, error.config.params);
      const cached = await getCachedData(cacheKey);
      if (cached !== null && cached !== undefined) {
        console.info(`[Offline Cache Hit] Serving from IndexedDB: ${cacheKey}`);
        return Promise.resolve({
          data: cached,
          status: 200,
          statusText: 'OK (From Local IndexedDB Cache)',
          headers: {},
          config: error.config,
          is_offline_cached: true
        });
      }
    }

    return Promise.reject(error);
  }
);

// Health check endpoint for active connectivity detection
export const checkApiHealth = async () => {
  try {
    const res = await api.get('/health', { timeout: 3500 });
    return res.data?.status === 'healthy' || res.status === 200;
  } catch (err) {
    return false;
  }
};

// ----------------- AUTH -----------------
export const login = async (username, password) => (await api.post('/auth/login', { username, password })).data;
export const getCurrentUser = async () => (await api.get('/auth/me')).data;
export const getUsers = async () => (await api.get('/auth/users')).data;
export const createUser = async (payload) => (await api.post('/auth/users', payload)).data;

// ----------------- GENERAL -----------------
export const getDashboardSummary = async (params) => (await api.get('/dashboard/summary', { params })).data;
export const getLocations = async (params) => (await api.get('/locations', { params })).data;
export const getTransportLegs = async () => (await api.get('/transport-legs')).data;

// ----------------- SHIPMENTS & ROUTING -----------------
export const getShipments = async (params) => (await api.get('/shipments', { params })).data;
export const getShipmentDetail = async (id) => (await api.get(`/shipments/${id}`)).data;
export const createShipment = async (payload) => (await api.post('/shipments', payload)).data;
export const previewRoute = async (payload) => (await api.post('/routing/preview', payload)).data;
export const checkRouteWeather = async (waypoints) => (await api.post('/weather/route-check', waypoints)).data;
export const updateShipmentStatus = async (id, payload) => (await api.patch(`/shipments/${id}/status`, payload)).data;
export const advanceShipmentLeg = async (id) => (await api.post(`/shipments/${id}/advance-leg`)).data;
export const getShipmentRouteMap = async (id) => (await api.get(`/shipments/${id}/route-map`)).data;

// ----------------- OFFICER SUB-RESOURCES -----------------
export const recordHandoverConfirmation = async (shipmentId, payload) => 
  (await api.post(`/shipments/${shipmentId}/handover`, payload)).data;

export const getShipmentConsumables = async (shipmentId) => 
  (await api.get(`/shipments/${shipmentId}/consumables`)).data;

export const updateConsumableLevel = async (shipmentId, consumableId, payload) => 
  (await api.patch(`/shipments/${shipmentId}/consumables/${consumableId}`, payload)).data;

export const recalculateAlternateRoute = async (shipmentId, payload) => 
  (await api.post(`/shipments/${shipmentId}/recalculate-alternate-route`, payload)).data;

export const addWeatherLog = async (shipmentId, payload) => 
  (await api.post(`/shipments/${shipmentId}/weather-logs`, payload)).data;

export const updateWeatherLog = async (shipmentId, weatherLogId, payload) => 
  (await api.put(`/shipments/${shipmentId}/weather-logs/${weatherLogId}`, payload)).data;

export const deleteWeatherLog = async (shipmentId, weatherLogId) => 
  (await api.delete(`/shipments/${shipmentId}/weather-logs/${weatherLogId}`)).data;

export const uploadShipmentDocument = async (shipmentId, payload) => {
  const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
  return (await api.post(`/shipments/${shipmentId}/documents`, payload, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
  })).data;
};

export const downloadShipmentDocument = async (shipmentId, documentId, fileName) => {
  const response = await api.get(`/shipments/${shipmentId}/documents/${documentId}/download`, {
    responseType: 'blob'
  });
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName || 'document';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// ----------------- INVENTORY -----------------
export const getInventory = async (locationId) => (await api.get('/inventory', { params: { location_id: locationId } })).data;
export const saveInventoryItem = async (locationId, payload) => (await api.post(`/inventory/${locationId}`, payload)).data;
export const updateInventoryItem = async (itemId, payload) => (await api.patch(`/inventory/${itemId}`, payload)).data;
export const deleteInventoryItem = async (itemId) => (await api.delete(`/inventory/${itemId}`)).data;

// ----------------- PERSONNEL & WORK STATUS -----------------
export const getPersonnel = async (params) => (await api.get('/personnel', { params })).data;
export const getPersonnelDetail = async (id) => (await api.get(`/personnel/${id}`)).data;
export const getMyPersonnelProfile = async () => (await api.get('/personnel/me/profile')).data;
export const postWorkStatus = async (payload) => (await api.post('/personnel/me/work-status', payload)).data;
export const createPersonnel = async (payload) => (await api.post('/personnel', payload)).data;

// ----------------- EMERGENCIES -----------------
export const getEmergencies = async (status) => (await api.get('/emergencies', { params: { status } })).data;
export const createEmergency = async (payload) => (await api.post('/emergencies', payload)).data;
export const updateEmergency = async (id, payload) => (await api.patch(`/emergencies/${id}`, payload)).data;

export default api;
