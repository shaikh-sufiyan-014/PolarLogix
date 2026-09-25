import React, { useState, useEffect } from 'react';
import { useConnectivity } from '../context/ConnectivityContext';
import syncEngine from '../services/syncQueue';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  X,
  Database,
  Server,
  Layers,
  Send
} from 'lucide-react';

export default function SyncStatusWidget() {
  const {
    isOnline,
    isSyncing,
    lastSyncTime,
    pendingSummary,
    triggerSync,
    pingHealth,
    conflictNotices,
    dismissConflictNotice
  } = useConnectivity();

  const [modalOpen, setModalOpen] = useState(false);
  const [syncLogs, setSyncLogs] = useState([...syncEngine.syncLog]);

  useEffect(() => {
    const unsub = syncEngine.subscribe((event) => {
      if (event.type === 'log') {
        setSyncLogs([...syncEngine.syncLog]);
      }
    });
    return unsub;
  }, []);

  const formatTime = (isoString) => {
    if (!isoString) return 'Never';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <>
      {/* PHASE 2: Compact PolarLink Status Dot Indicator */}
      <div className="relative group flex items-center">
        <button
          id="polarlink-status-dot"
          onClick={() => setModalOpen(true)}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-sky-500/30"
          aria-label={isOnline ? 'PolarLink: Active' : 'PolarLink: Offline'}
          title={isOnline ? 'PolarLink: Active' : 'PolarLink: Offline'}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              isOnline
                ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                : 'bg-rose-500 shadow-sm shadow-rose-500/50 animate-pulse'
            }`}
          />
        </button>

        {/* Hover Tooltip */}
        <div className="absolute top-full right-0 mt-1 hidden group-hover:flex items-center space-x-1.5 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none transition-opacity">
          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`} />
          <span>{isOnline ? 'PolarLink: Active' : 'PolarLink: Offline'}</span>
        </div>
      </div>

      {/* Sync Queue Inspector Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel max-w-2xl w-full p-6 space-y-5 bg-white border-slate-200 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>PolarLink Satellite Comms & Priority Sync Queue</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dexie IndexedDB local buffer • Priority transmission hierarchy
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Link Status</span>
                <div className="flex items-center gap-1.5 font-extrabold text-xs mt-1">
                  {isOnline ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <Wifi className="w-3.5 h-3.5 text-emerald-500" /> Starlink Active
                    </span>
                  ) : (
                    <span className="text-rose-600 flex items-center gap-1">
                      <WifiOff className="w-3.5 h-3.5 text-rose-500" /> Offline Buffer
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Last Sync</span>
                <div className="font-extrabold text-xs text-slate-700 mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {formatTime(lastSyncTime)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Critical Queue</span>
                <div className="font-extrabold text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {pendingSummary.criticalCount} Emergency
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Standard Queue</span>
                <div className="font-extrabold text-xs text-slate-700 mt-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-sky-500" />
                  {pendingSummary.highCount + pendingSummary.normalCount} Records
                </div>
              </div>
            </div>

            {/* Conflict Warnings */}
            {conflictNotices.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Conflict Notifications (Last Write Synchronized)</span>
                </h4>
                {conflictNotices.map((conflict) => (
                  <div
                    key={conflict.id}
                    className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between text-amber-800"
                  >
                    <span>{conflict.message}</span>
                    <button
                      onClick={() => dismissConflictNotice(conflict.id)}
                      className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-700 text-[10px] font-bold cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pending Items Priority List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-sky-500" />
                  <span>Buffered Outbox ({pendingSummary.total} Items)</span>
                </h4>
                <span className="text-[10px] text-slate-400">
                  Transmits in order: Critical ➔ High ➔ Normal
                </span>
              </div>

              {pendingSummary.total === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1 opacity-70" />
                  All local changes are fully synchronized with HQ.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {pendingSummary.items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        item.priority === 'critical'
                          ? 'bg-rose-50 border-rose-200 text-rose-800 font-medium'
                          : item.priority === 'high'
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            item.priority === 'critical'
                              ? 'bg-rose-500 text-white'
                              : item.priority === 'high'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-500 text-white'
                          }`}
                        >
                          {item.priority}
                        </span>
                        <span className="font-bold">
                          {item.title || item.entity_type || 'Inventory Item'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.local_id}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatTime(item.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Transmission Audit Log */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Satellite Transmission Audit Log
              </h4>
              <div className="bg-slate-900 rounded-xl p-2.5 font-mono text-[10px] text-emerald-400 h-28 overflow-y-auto space-y-1">
                {syncLogs.length === 0 ? (
                  <div className="text-slate-500 italic">No sync activity logged yet.</div>
                ) : (
                  syncLogs.map((entry, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5 leading-tight">
                      <span className="text-slate-500 flex-shrink-0">
                        [{formatTime(entry.timestamp)}]
                      </span>
                      <span
                        className={
                          entry.type === 'critical'
                            ? 'text-rose-400 font-bold'
                            : entry.type === 'high'
                            ? 'text-amber-400 font-bold'
                            : entry.type === 'success'
                            ? 'text-emerald-300 font-bold'
                            : entry.type === 'error'
                            ? 'text-rose-400'
                            : 'text-slate-300'
                        }
                      >
                        {entry.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <button
                onClick={() => pingHealth()}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-sky-500" />
                <span>Test Link Ping</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-1.5 rounded-xl text-slate-500 hover:text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={async () => {
                    await triggerSync();
                  }}
                  disabled={isSyncing || pendingSummary.total === 0}
                  className={`px-4 py-1.5 rounded-xl text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-all shadow-md ${
                    isSyncing || pendingSummary.total === 0
                      ? 'bg-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-sky-500 hover:bg-sky-600'
                  }`}
                >
                  <Send className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Queue Now'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
