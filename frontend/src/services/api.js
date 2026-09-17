import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to always attach current token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('polarlogix_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and let state refresh
      localStorage.removeItem('polarlogix_token');
      localStorage.removeItem('polarlogix_user');
    }
    return Promise.reject(error);
  }
);

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

export const uploadShipmentDocument = async (shipmentId, payload) => 
  (await api.post(`/shipments/${shipmentId}/documents`, payload)).data;

// ----------------- INVENTORY -----------------
export const getInventory = async (locationId) => (await api.get('/inventory', { params: { location_id: locationId } })).data;
export const saveInventoryItem = async (locationId, payload) => (await api.post(`/inventory/${locationId}`, payload)).data;

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
