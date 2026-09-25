import api from './api.js';
import { db, setCachedData, getCachedData } from './db.js';

/**
 * Priority-based Synchronization Engine for PolarLogix
 * Mirrors Antarctic/oceanic satellite link hierarchy:
 * 1. Critical priority (Emergencies) — strictly sequential, retry on error, halts lower queues
 * 2. High priority (Handovers, leg advancement, shipment status) — sequential
 * 3. Normal priority (Personnel status, weather logs, inventory adjustments) — sequential/batch
 */

export class SyncEngine {
  constructor() {
    this.isSyncing = false;
    this.listeners = new Set();
    this.lastSyncTimestamp = null;
    this.conflictNotices = [];
    this.syncLog = [];
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (e) {
        console.error('[SyncEngine] Listener error:', e);
      }
    });
  }

  log(message, type = 'info', meta = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      message,
      type, // 'critical' | 'high' | 'normal' | 'info' | 'error' | 'success' | 'conflict'
      meta
    };
    this.syncLog.unshift(entry);
    if (this.syncLog.length > 50) this.syncLog.pop();
    console.log(`[SyncEngine:${type.toUpperCase()}] ${message}`, meta || '');
    this.notify({ type: 'log', entry });
  }

  getConflictNotices() {
    return [...this.conflictNotices];
  }

  clearConflictNotice(id) {
    this.conflictNotices = this.conflictNotices.filter((n) => n.id !== id);
    this.notify({ type: 'conflicts', notices: this.conflictNotices });
  }

  addConflictNotice(notice) {
    const item = {
      ...notice,
      id: notice.conflict_id || `conflict-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      entity_id: notice.entity_id || notice.id,
      timestamp: new Date().toISOString()
    };
    this.conflictNotices.push(item);
    this.log(`Conflict notice: ${item.message}`, 'conflict', item);
    this.notify({ type: 'conflicts', notices: this.conflictNotices });
  }

  /**
   * Run priority-ordered sync cycle
   */
  async processSyncQueue() {
    if (this.isSyncing) {
      console.log('[SyncEngine] Sync cycle already in progress, skipping duplicate call.');
      return { status: 'in_progress' };
    }

    this.isSyncing = true;
    this.notify({ type: 'sync_start' });
    this.log('Initiating priority sync cycle over restored satellite link...', 'info');

    let totalSynced = 0;
    let criticalErrors = 0;

    try {
      // -------------------------------------------------------------
      // TIER 1: CRITICAL PRIORITY (Emergency Reports)
      // Must sync ONE AT A TIME, strictly in order, verifying server receipt.
      // If any critical item fails, HALT sync immediately and retry later.
      // -------------------------------------------------------------
      const pendingEmergencies = await db.pending_emergency_reports
        .where('status')
        .equals('pending')
        .sortBy('created_at');

      if (pendingEmergencies.length > 0) {
        this.log(`Transmitting ${pendingEmergencies.length} CRITICAL emergency report(s)...`, 'critical');

        for (const item of pendingEmergencies) {
          try {
            this.log(`[CRITICAL] Syncing emergency: "${item.title}" (${item.local_id})`, 'critical');
            
            // Format payload for backend createEmergency endpoint
            const payload = {
              title: item.title,
              description: item.description,
              severity: item.severity || 'high',
              type: item.type || 'operational',
              location_id: item.location_id,
              affected_shipment_id: item.affected_shipment_id || null,
              affected_personnel_id: item.affected_personnel_id || null
            };

            const response = await api.post('/emergencies', payload);
            const serverEmergency = response.data;

            // Remove from pending table
            await db.pending_emergency_reports.delete(item.id);
            totalSynced++;

            // Update cached emergencies
            const cached = (await getCachedData('/emergencies')) || [];
            const updatedCache = [serverEmergency, ...cached.filter((e) => e.id !== serverEmergency.id)];
            await setCachedData('/emergencies', updatedCache);
            await setCachedData('cached_emergencies', updatedCache);

            this.log(`[CRITICAL SUCCESS] Emergency synced with server ID: ${serverEmergency.id}`, 'success', { local_id: item.local_id, server_id: serverEmergency.id });
          } catch (err) {
            criticalErrors++;
            this.log(`[CRITICAL FAILED] Failed to sync emergency "${item.title}": ${err.message}. Halting lower queues.`, 'error');
            
            // Increment retry count
            await db.pending_emergency_reports.update(item.id, {
              retry_count: (item.retry_count || 0) + 1,
              last_error: err.message
            });

            // Critical failure halts lower queues (mirroring Iridium high-priority packet lock)
            this.isSyncing = false;
            this.notify({ type: 'sync_error', error: err });
            return { status: 'halted_critical_error', error: err.message };
          }
        }
      }

      // -------------------------------------------------------------
      // TIER 2: HIGH PRIORITY (Shipment Handovers & Status Changes)
      // -------------------------------------------------------------
      const pendingHighUpdates = await db.pending_status_updates
        .where('status')
        .equals('pending')
        .and((item) => item.priority === 'high')
        .sortBy('created_at');

      if (pendingHighUpdates.length > 0) {
        this.log(`Transmitting ${pendingHighUpdates.length} HIGH priority operational updates...`, 'high');

        for (const item of pendingHighUpdates) {
          try {
            this.log(`[HIGH] Syncing ${item.entity_type} for ${item.entity_id}`, 'high');
            
            let res;
            if (item.endpoint) {
              if (item.method === 'PATCH') {
                res = await api.patch(item.endpoint, item.payload);
              } else {
                res = await api.post(item.endpoint, item.payload);
              }
            } else if (item.entity_type === 'shipment_handover') {
              res = await api.post(`/shipments/${item.entity_id}/handover`, item.payload);
            } else if (item.entity_type === 'shipment_advance_leg') {
              res = await api.post(`/shipments/${item.entity_id}/advance-leg`, item.payload);
            } else if (item.entity_type === 'shipment_status') {
              res = await api.patch(`/shipments/${item.entity_id}/status`, item.payload);
            }

            // Conflict Check (Phase 4: Last-Write-Wins with Warning)
            if (res?.data && item.original_server_timestamp) {
              const serverUpdated = res.data.updated_at || res.data.created_at;
              if (serverUpdated && serverUpdated > item.original_server_timestamp) {
                this.addConflictNotice({
                  entity: item.entity_type,
                  id: item.entity_id,
                  message: `Shipment ${item.entity_id} was updated on the server while you were offline. Your local change was synchronized.`
                });
              }
            }

            await db.pending_status_updates.delete(item.id);
            totalSynced++;
            this.log(`[HIGH SUCCESS] ${item.entity_type} synced for ${item.entity_id}`, 'success');
          } catch (err) {
            this.log(`[HIGH ERROR] Could not sync ${item.entity_type} for ${item.entity_id}: ${err.message}`, 'error');
            await db.pending_status_updates.update(item.id, {
              retry_count: (item.retry_count || 0) + 1,
              last_error: err.message
            });
          }
        }
      }

      // -------------------------------------------------------------
      // TIER 3: NORMAL PRIORITY (Personnel Status, Weather Logs, Inventory)
      // -------------------------------------------------------------
      const pendingNormalUpdates = await db.pending_status_updates
        .where('status')
        .equals('pending')
        .and((item) => item.priority === 'normal')
        .sortBy('created_at');

      const pendingInventoryUpdates = await db.pending_inventory_updates
        .where('status')
        .equals('pending')
        .sortBy('created_at');

      const normalTotal = pendingNormalUpdates.length + pendingInventoryUpdates.length;
      if (normalTotal > 0) {
        this.log(`Transmitting ${normalTotal} NORMAL priority routine telemetry updates...`, 'normal');

        // Process status/weather/personnel updates
        for (const item of pendingNormalUpdates) {
          try {
            this.log(`[NORMAL] Syncing ${item.entity_type}`, 'normal');
            if (item.entity_type === 'personnel_work_status') {
              await api.post('/personnel/me/work-status', item.payload);
            } else if (item.entity_type === 'weather_log') {
              await api.post(`/shipments/${item.entity_id}/weather-logs`, item.payload);
            } else if (item.endpoint) {
              if (item.method === 'PATCH') {
                await api.patch(item.endpoint, item.payload);
              } else {
                await api.post(item.endpoint, item.payload);
              }
            }
            await db.pending_status_updates.delete(item.id);
            totalSynced++;
          } catch (err) {
            this.log(`[NORMAL ERROR] Failed to sync ${item.entity_type}: ${err.message}`, 'error');
            await db.pending_status_updates.update(item.id, {
              retry_count: (item.retry_count || 0) + 1,
              last_error: err.message
            });
          }
        }

        // Process inventory updates
        for (const item of pendingInventoryUpdates) {
          try {
            this.log(`[NORMAL] Syncing inventory item at ${item.location_id}`, 'normal');
            await api.post(`/inventory/${item.location_id}`, item.payload);
            await db.pending_inventory_updates.delete(item.id);
            totalSynced++;
          } catch (err) {
            this.log(`[NORMAL ERROR] Failed to sync inventory item at ${item.location_id}: ${err.message}`, 'error');
            await db.pending_inventory_updates.update(item.id, {
              retry_count: (item.retry_count || 0) + 1,
              last_error: err.message
            });
          }
        }
      }

      this.lastSyncTimestamp = new Date().toISOString();
      this.log(`Priority sync cycle completed successfully. ${totalSynced} items synchronized.`, 'success');
      this.notify({ type: 'sync_complete', totalSynced, timestamp: this.lastSyncTimestamp });
      return { status: 'complete', totalSynced };
    } catch (globalErr) {
      this.log(`Global sync exception: ${globalErr.message}`, 'error');
      this.notify({ type: 'sync_error', error: globalErr });
      return { status: 'error', error: globalErr.message };
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncEngine = new SyncEngine();
export default syncEngine;
