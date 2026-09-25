import Dexie from 'dexie';

/**
 * PolarLogixDB - IndexedDB local persistence engine
 * Configured for extreme reliability during intermittent Antarctic connectivity.
 */
export const db = new Dexie('PolarLogixDB');

// Define database schema
db.version(1).stores({
  // Emergency Reports: highest critical priority
  pending_emergency_reports: '++id, local_id, title, priority, status, created_at',
  
  // Status & Operational Updates: shipment handovers, personnel work logs, weather observations, status transitions
  pending_status_updates: '++id, local_id, entity_type, entity_id, priority, status, created_at',
  
  // Inventory Updates: local stock adjustments and audit reports
  pending_inventory_updates: '++id, local_id, location_id, item_id, priority, status, created_at',
  
  // Offline Read Cache: mirrors key backend entities (shipments, inventory, personnel, emergencies, locations, summary)
  cached_dashboard_data: 'key, updated_at'
});

// Cache Helpers
export const setCachedData = async (key, data) => {
  try {
    await db.cached_dashboard_data.put({
      key,
      data,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn(`[IndexedDB Cache] Failed to cache data for key "${key}":`, err);
  }
};

export const getCachedData = async (key) => {
  try {
    const record = await db.cached_dashboard_data.get(key);
    return record ? record.data : null;
  } catch (err) {
    console.warn(`[IndexedDB Cache] Failed to read cached data for key "${key}":`, err);
    return null;
  }
};

export const getAllCachedData = async () => {
  try {
    const all = await db.cached_dashboard_data.toArray();
    return all.reduce((acc, item) => {
      acc[item.key] = { data: item.data, updated_at: item.updated_at };
      return acc;
    }, {});
  } catch (err) {
    console.warn('[IndexedDB Cache] Failed to read all cached data:', err);
    return {};
  }
};

// Queue Helpers for Pending Mutations
export const addPendingEmergency = async (payload) => {
  const local_id = `LOCAL-EMG-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const record = {
    local_id,
    ...payload,
    priority: 'critical',
    status: 'pending',
    retry_count: 0,
    created_at: new Date().toISOString(),
    is_offline_created: true
  };
  const id = await db.pending_emergency_reports.add(record);
  return { ...record, id };
};

export const addPendingStatusUpdate = async ({ entity_type, entity_id, payload, priority = 'normal', endpoint, method = 'POST' }) => {
  const local_id = `LOCAL-UPD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const record = {
    local_id,
    entity_type, // 'personnel_work_status', 'shipment_handover', 'weather_log', 'shipment_status', 'shipment_advance_leg'
    entity_id,
    endpoint,
    method,
    payload,
    priority, // 'critical' | 'high' | 'normal'
    status: 'pending',
    retry_count: 0,
    created_at: new Date().toISOString(),
    is_offline_created: true
  };
  const id = await db.pending_status_updates.add(record);
  return { ...record, id };
};

export const addPendingInventoryUpdate = async ({ location_id, item_id, payload, priority = 'normal' }) => {
  const local_id = `LOCAL-INV-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const record = {
    local_id,
    location_id,
    item_id: item_id || payload?.id,
    payload,
    priority,
    status: 'pending',
    retry_count: 0,
    created_at: new Date().toISOString(),
    is_offline_created: true
  };
  const id = await db.pending_inventory_updates.add(record);
  return { ...record, id };
};

// Get pending counts by priority
export const getPendingSyncSummary = async () => {
  try {
    const emergencies = await db.pending_emergency_reports.where('status').equals('pending').toArray();
    const statusUpdates = await db.pending_status_updates.where('status').equals('pending').toArray();
    const inventoryUpdates = await db.pending_inventory_updates.where('status').equals('pending').toArray();

    const all = [
      ...emergencies.map(e => ({ ...e, queue_type: 'emergency' })),
      ...statusUpdates.map(s => ({ ...s, queue_type: 'status_update' })),
      ...inventoryUpdates.map(i => ({ ...i, queue_type: 'inventory' }))
    ];

    const critical = all.filter(item => item.priority === 'critical');
    const high = all.filter(item => item.priority === 'high');
    const normal = all.filter(item => item.priority === 'normal');

    return {
      total: all.length,
      criticalCount: critical.length,
      highCount: high.length,
      normalCount: normal.length,
      items: all,
      critical,
      high,
      normal
    };
  } catch (err) {
    console.warn('[IndexedDB] Error computing pending sync summary:', err);
    return {
      total: 0,
      criticalCount: 0,
      highCount: 0,
      normalCount: 0,
      items: [],
      critical: [],
      high: [],
      normal: []
    };
  }
};

export default db;
