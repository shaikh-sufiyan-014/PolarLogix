import React from 'react';
import { useConnectivity } from '../context/ConnectivityContext';
import { WifiOff, Radio, RefreshCw, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function OfflineBanner() {
  const {
    isOnline,
    isSyncing,
    pendingSummary,
    triggerSync,
    pingHealth,
    toastMessage
  } = useConnectivity();

  if (isOnline && pendingSummary.total === 0 && !toastMessage) {
    return null;
  }

  return (
    <div className="sticky top-16 z-40 w-full transition-all">
      {/* 1. Offline Mode Banner */}
      {!isOnline && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <div className="p-1 rounded-md bg-white/20 animate-pulse">
              <WifiOff className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold flex items-center gap-1.5">
                <span>PolarLink Offline (Antarctic Comms Blackout)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/25 font-mono uppercase">
                  Iridium Buffer Ready
                </span>
              </div>
              <p className="text-amber-100 text-[11px] hidden sm:block">
                All changes, emergency reports & logs are saved locally in IndexedDB and will auto-sync with priority once connectivity returns.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {pendingSummary.total > 0 && (
              <div className="flex items-center space-x-1.5 px-2 py-1 rounded bg-black/30 font-semibold text-[11px]">
                {pendingSummary.criticalCount > 0 && (
                  <span className="text-rose-200 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
                    {pendingSummary.criticalCount} Critical
                  </span>
                )}
                {pendingSummary.highCount > 0 && (
                  <span className="text-amber-200">
                    {pendingSummary.highCount} High
                  </span>
                )}
                {pendingSummary.normalCount > 0 && (
                  <span className="text-slate-200">
                    {pendingSummary.normalCount} Normal
                  </span>
                )}
              </div>
            )}

            <button
              onClick={() => pingHealth()}
              title="Ping server health check"
              className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Check Link</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Sync In Progress Banner (When link restores) */}
      {isOnline && isSyncing && (
        <div className="bg-sky-600 text-white px-4 py-2 shadow flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-sky-200" />
            <span className="font-semibold">
              PolarLink Active: Priority synchronization in progress...
            </span>
          </div>
          <span className="text-[11px] text-sky-100 font-mono">
            {pendingSummary.criticalCount > 0
              ? `Transmitting Critical Emergenices (1/1)...`
              : `Flushing ${pendingSummary.total} pending record(s)...`}
          </span>
        </div>
      )}

      {/* 3. Toast Message Notification Bar (if active) */}
      {toastMessage && (
        <div
          className={`px-4 py-1.5 text-xs font-medium flex items-center justify-between transition-all ${
            toastMessage.type === 'error'
              ? 'bg-rose-600 text-white'
              : toastMessage.type === 'warning'
              ? 'bg-amber-600 text-white'
              : toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800 text-slate-100'
          }`}
        >
          <div className="flex items-center space-x-2">
            {toastMessage.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
            {toastMessage.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5" />}
            {toastMessage.type === 'error' && <ShieldAlert className="w-3.5 h-3.5" />}
            <span>{toastMessage.msg}</span>
          </div>
        </div>
      )}
    </div>
  );
}
