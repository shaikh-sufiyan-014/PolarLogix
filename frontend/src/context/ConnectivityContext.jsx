import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { checkApiHealth } from '../services/api';
import {
  db,
  addPendingEmergency,
  addPendingStatusUpdate,
  addPendingInventoryUpdate,
  getPendingSyncSummary,
  setCachedData,
  getCachedData
} from '../services/db';
import syncEngine from '../services/syncQueue';
import * as apiMethods from '../services/api';

const ConnectivityContext = createContext();

export function ConnectivityProvider({ children }) {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [pendingSummary, setPendingSummary] = useState({
    total: 0,
    criticalCount: 0,
    highCount: 0,
    normalCount: 0,
    items: [],
    critical: [],
    high: [],
    normal: []
  });
  const [conflictNotices, setConflictNotices] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Show non-blocking toast notification
  const showToast = useCallback((msg, type = 'info', duration = 5000) => {
    setToastMessage({ id: Date.now(), msg, type });
    setTimeout(() => {
      setToastMessage((current) => (current?.msg === msg ? null : current));
    }, duration);
  }, []);

  // Refresh pending items count
  const refreshPendingCounts = useCallback(async () => {
    const summary = await getPendingSyncSummary();
    setPendingSummary(summary);
  }, []);

  // Active Health Ping (GET /api/health)
  const pingHealth = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false);
      return false;
    }
    const healthy = await checkApiHealth();
    setIsOnline((prev) => {
      if (!prev && healthy) {
        showToast('🟢 PolarLink Restored: Satellite connectivity active. Initiating priority sync...', 'success');
        // Auto trigger priority sync upon link restoration
        syncEngine.processSyncQueue();
      } else if (prev && !healthy) {
        showToast('⚠️ PolarLink Interrupted: Operating in Offline Mode. All changes will be saved to IndexedDB.', 'warning');
      }
      return healthy;
    });
    return healthy;
  }, [showToast]);

  // Initial setup & periodic health check timer (every 10 seconds)
  useEffect(() => {
    // Initial counts
    refreshPendingCounts();
    pingHealth();

    const handleBrowserOnline = () => {
      console.log('[Connectivity] Browser fired "online" event. Verifying server health...');
      pingHealth();
    };

    const handleBrowserOffline = () => {
      console.log('[Connectivity] Browser fired "offline" event.');
      setIsOnline(false);
      showToast('⚠️ Offline Mode: Physical network adapter disconnected.', 'warning');
    };

    window.addEventListener('online', handleBrowserOnline);
    window.addEventListener('offline', handleBrowserOffline);

    // Periodic ping every 10-12s
    const pingInterval = setInterval(() => {
      pingHealth();
    }, 10000);

    // Periodic check for pending counts (every 4s)
    const countInterval = setInterval(() => {
      refreshPendingCounts();
    }, 4000);

    // Subscribe to syncEngine events
    const unsubscribeSync = syncEngine.subscribe((event) => {
      if (event.type === 'sync_start') {
        setIsSyncing(true);
      } else if (event.type === 'sync_complete') {
        setIsSyncing(false);
        setLastSyncTime(event.timestamp);
        refreshPendingCounts();
        if (event.totalSynced > 0) {
          showToast(`✅ Sync Complete: ${event.totalSynced} items synchronized with HQ server.`, 'success');
        }
      } else if (event.type === 'sync_error') {
        setIsSyncing(false);
        refreshPendingCounts();
      } else if (event.type === 'conflicts') {
        setConflictNotices(event.notices);
      }
    });

    return () => {
      window.removeEventListener('online', handleBrowserOnline);
      window.removeEventListener('offline', handleBrowserOffline);
      clearInterval(pingInterval);
      clearInterval(countInterval);
      unsubscribeSync();
    };
  }, [pingHealth, refreshPendingCounts, showToast]);

  // Force trigger sync
  const triggerSync = useCallback(async () => {
    const isHealthy = await pingHealth();
    if (!isHealthy) {
      showToast('⚠️ Cannot sync: PolarLink is currently offline.', 'warning');
      return { status: 'offline' };
    }
    return await syncEngine.processSyncQueue();
  }, [pingHealth, showToast]);

  const dismissConflictNotice = useCallback((id) => {
    syncEngine.clearConflictNotice(id);
  }, []);

  // -------------------------------------------------------------
  // OPTIMISTIC OFFLINE-AWARE MUTATION HANDLERS
  // -------------------------------------------------------------

  // 1. Emergency Report (CRITICAL PRIORITY)
  const submitEmergency = async (payload) => {
    if (isOnline) {
      try {
        const result = await apiMethods.createEmergency(payload);
        showToast('🚨 Emergency report transmitted immediately to HQ.', 'success');
        // Update cache
        const cached = (await getCachedData('/emergencies')) || [];
        await setCachedData('/emergencies', [result, ...cached.filter((e) => e.id !== result.id)]);
        return { success: true, data: result, isOffline: false };
      } catch (err) {
        console.warn('[Emergency] Online submission failed, falling back to local critical queue:', err);
      }
    }

    // Offline / Network Failure Fallback
    const localRecord = await addPendingEmergency(payload);
    await refreshPendingCounts();

    // Optimistically update cached emergencies so it displays in UI immediately
    const cached = (await getCachedData('/emergencies')) || [];
    const optimisticItem = {
      id: localRecord.local_id,
      ...payload,
      status: 'active',
      reported_at: localRecord.created_at,
      is_pending_sync: true,
      priority: 'critical'
    };
    await setCachedData('/emergencies', [optimisticItem, ...cached]);

    showToast('🚨 Saved locally (Critical Priority Queue) — will transmit first when connection returns.', 'warning', 6000);
    return { success: true, data: optimisticItem, isOffline: true };
  };

  // 2. Personnel Work Status (NORMAL PRIORITY)
  const submitPersonnelWorkStatus = async (payload) => {
    if (isOnline) {
      try {
        const result = await apiMethods.postWorkStatus(payload);
        showToast('✅ Work status updated successfully.', 'success');
        return { success: true, data: result, isOffline: false };
      } catch (err) {
        console.warn('[Personnel] Online update failed, saving locally:', err);
      }
    }

    const localRecord = await addPendingStatusUpdate({
      entity_type: 'personnel_work_status',
      entity_id: 'me',
      payload,
      priority: 'normal'
    });
    await refreshPendingCounts();
    showToast('💾 Status saved locally — queued for background sync.', 'info');
    return { success: true, data: { ...payload, is_pending_sync: true }, isOffline: true };
  };

  // 3. Shipment Handover Confirmation (HIGH PRIORITY)
  const submitHandoverConfirmation = async (shipmentId, payload) => {
    if (isOnline) {
      try {
        const result = await apiMethods.recordHandoverConfirmation(shipmentId, payload);
        showToast('📦 Handover confirmation recorded.', 'success');
        return { success: true, data: result, isOffline: false };
      } catch (err) {
        console.warn('[Handover] Online submission failed, queuing high priority:', err);
      }
    }

    const localRecord = await addPendingStatusUpdate({
      entity_type: 'shipment_handover',
      entity_id: shipmentId,
      payload,
      priority: 'high'
    });
    await refreshPendingCounts();
    showToast('💾 Handover saved locally (High Priority Queue) — will sync when link restores.', 'warning');
    return { success: true, data: { ...payload, is_pending_sync: true }, isOffline: true };
  };

  // 4. Weather Log (NORMAL PRIORITY)
  const submitWeatherLog = async (shipmentId, payload) => {
    if (isOnline) {
      try {
        const result = await apiMethods.addWeatherLog(shipmentId, payload);
        showToast('🌤️ Weather observation logged.', 'success');
        return { success: true, data: result, isOffline: false };
      } catch (err) {
        console.warn('[WeatherLog] Online failed, queuing:', err);
      }
    }

    const localRecord = await addPendingStatusUpdate({
      entity_type: 'weather_log',
      entity_id: shipmentId,
      payload,
      priority: 'normal'
    });
    await refreshPendingCounts();
    showToast('💾 Weather log stored in local buffer.', 'info');
    return { success: true, data: { ...payload, is_pending_sync: true }, isOffline: true };
  };

  // 5. Inventory Item (NORMAL PRIORITY)
  const submitInventoryItem = async (locationId, payload) => {
    if (isOnline) {
      try {
        const result = await apiMethods.saveInventoryItem(locationId, payload);
        showToast('📋 Inventory stock record updated.', 'success');
        return { success: true, data: result, isOffline: false };
      } catch (err) {
        console.warn('[Inventory] Online failed, queuing:', err);
      }
    }

    const localRecord = await addPendingInventoryUpdate({
      location_id: locationId,
      item_id: payload?.id,
      payload,
      priority: 'normal'
    });
    await refreshPendingCounts();
    showToast('💾 Inventory updated locally — will sync on reconnect.', 'info');
    return { success: true, data: { ...payload, is_pending_sync: true }, isOffline: true };
  };

  // 6. Shipment Status Transition (HIGH PRIORITY)
  const submitShipmentStatus = async (shipmentId, payload) => {
    if (isOnline) {
      try {
        const result = await apiMethods.updateShipmentStatus(shipmentId, payload);
        showToast('🚢 Shipment status updated.', 'success');
        return { success: true, data: result, isOffline: false };
      } catch (err) {
        console.warn('[ShipmentStatus] Online failed, queuing:', err);
      }
    }

    const localRecord = await addPendingStatusUpdate({
      entity_type: 'shipment_status',
      entity_id: shipmentId,
      payload,
      priority: 'high'
    });
    await refreshPendingCounts();
    showToast('💾 Status change buffered locally (High Priority).', 'warning');
    return { success: true, data: { ...payload, is_pending_sync: true }, isOffline: true };
  };

  // 7. Advance Shipment Leg (HIGH PRIORITY)
  const submitAdvanceLeg = async (shipmentId) => {
    if (isOnline) {
      try {
        const result = await apiMethods.advanceShipmentLeg(shipmentId);
        showToast('🧭 Shipment advanced to next voyage leg.', 'success');
        return { success: true, data: result, isOffline: false };
      } catch (err) {
        console.warn('[AdvanceLeg] Online failed, queuing:', err);
      }
    }

    const localRecord = await addPendingStatusUpdate({
      entity_type: 'shipment_advance_leg',
      entity_id: shipmentId,
      payload: {},
      priority: 'high'
    });
    await refreshPendingCounts();
    showToast('💾 Leg advancement saved locally (High Priority).', 'warning');
    return { success: true, data: { is_pending_sync: true }, isOffline: true };
  };

  return (
    <ConnectivityContext.Provider
      value={{
        isOnline,
        isSyncing,
        lastSyncTime,
        pendingSummary,
        conflictNotices,
        toastMessage,
        pingHealth,
        triggerSync,
        dismissConflictNotice,
        showToast,
        refreshPendingCounts,
        // Offline-first mutation wrappers
        submitEmergency,
        submitPersonnelWorkStatus,
        submitHandoverConfirmation,
        submitWeatherLog,
        submitInventoryItem,
        submitShipmentStatus,
        submitAdvanceLeg
      }}
    >
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity() {
  const context = useContext(ConnectivityContext);
  if (!context) {
    throw new Error('useConnectivity must be used within a ConnectivityProvider');
  }
  return context;
}
