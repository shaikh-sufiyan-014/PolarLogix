import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDashboardSummary = async () => (await api.get('/dashboard/summary')).data;
export const getLocations = async () => (await api.get('/locations')).data;
export const getTransportLegs = async () => (await api.get('/transport-legs')).data;

export const getShipments = async (params) => (await api.get('/shipments', { params })).data;
export const getShipmentDetail = async (id) => (await api.get(`/shipments/${id}`)).data;
export const createShipment = async (payload) => (await api.post('/shipments', payload)).data;
export const updateShipmentStatus = async (id, payload) => (await api.patch(`/shipments/${id}/status`, payload)).data;
export const advanceShipmentLeg = async (id) => (await api.post(`/shipments/${id}/advance-leg`)).data;
export const getShipmentRouteMap = async (id) => (await api.get(`/shipments/${id}/route-map`)).data;

export const getInventory = async (locationId) => (await api.get('/inventory', { params: { location_id: locationId } })).data;
export const saveInventoryItem = async (locationId, payload) => (await api.post(`/inventory/${locationId}`, payload)).data;

export const getPersonnel = async (params) => (await api.get('/personnel', { params })).data;
export const createPersonnel = async (payload) => (await api.post('/personnel', payload)).data;

export const getEmergencies = async (status) => (await api.get('/emergencies', { params: { status } })).data;
export const createEmergency = async (payload) => (await api.post('/emergencies', payload)).data;
export const updateEmergency = async (id, payload) => (await api.patch(`/emergencies/${id}`, payload)).data;

export default api;
