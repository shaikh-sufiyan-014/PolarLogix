import React, { useEffect, useState } from 'react';
import { getEmergencies, createEmergency, updateEmergency } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  ShieldAlert,
  AlertTriangle,
  Plus,
  Clock,
  CheckCircle2,
  Send,
  X,
  Radio
} from 'lucide-react';

export default function EmergencyResponse() {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [logInputMap, setLogInputMap] = useState({});

  const [newEmergency, setNewEmergency] = useState({
    station_id: 'LOC-BHA',
    event_type: 'Generator Failure',
    severity: 'critical',
    description: ''
  });

  useEffect(() => {
    fetchEmergencies();
  }, [selectedStatus]);

  const fetchEmergencies = async () => {
    setLoading(true);
    try {
      const data = await getEmergencies(selectedStatus || undefined);
      setEmergencies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReportEmergency = async (e) => {
    e.preventDefault();
    try {
      await createEmergency(newEmergency);
      setShowReportModal(false);
      setNewEmergency({
        station_id: 'LOC-BHA',
        event_type: 'Generator Failure',
        severity: 'critical',
        description: ''
      });
      fetchEmergencies();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLogEntry = async (emergencyId) => {
    const text = logInputMap[emergencyId];
    if (!text) return;

    try {
      await updateEmergency(emergencyId, { response_log: text });
      setLogInputMap({ ...logInputMap, [emergencyId]: '' });
      fetchEmergencies();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (emergencyId, currentStatus) => {
    const nextStatus = currentStatus === 'open' ? 'resolved' : 'open';
    try {
      await updateEmergency(emergencyId, { status: nextStatus });
      fetchEmergencies();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner - Urgent Visual Polish */}
      <div className="glass-panel p-6 bg-gradient-to-r from-rose-500/15 via-orange-500/5 to-transparent border-l-4 border-l-rose-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Emergency Response Coordination Center
            </h1>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Station distress alerts, power grid failures, severe weather hazards & medical dispatch logs
          </p>
        </div>
        <button
          onClick={() => setShowReportModal(true)}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-rose-500/30 transition-all transform hover:-translate-y-0.5"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Report Station Emergency</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedStatus('')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedStatus === '' ? 'bg-sky-500 text-white shadow' : 'glass-panel text-slate-400'
            }`}
          >
            All Incidents
          </button>
          <button
            onClick={() => setSelectedStatus('open')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedStatus === 'open' ? 'bg-rose-500 text-white shadow animate-pulse' : 'glass-panel text-slate-400'
            }`}
          >
            Active Open Incidents
          </button>
          <button
            onClick={() => setSelectedStatus('resolved')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedStatus === 'resolved' ? 'bg-emerald-500 text-white shadow' : 'glass-panel text-slate-400'
            }`}
          >
            Resolved Cases
          </button>
        </div>
      </div>

      {/* Incident List / Feed */}
      {loading ? (
        <LoadingSkeleton type="cards" count={3} />
      ) : emergencies.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-500 dark:text-slate-400">
          No emergency incidents recorded matching filter.
        </div>
      ) : (
        <div className="space-y-4">
          {emergencies.map((emg) => {
            const isOpen = emg.status === 'open';
            return (
              <div
                key={emg.id}
                className={`glass-panel p-6 space-y-4 border-l-4 transition-all ${
                  isOpen ? 'border-l-rose-500 shadow-lg shadow-rose-500/5' : 'border-l-emerald-500 opacity-90'
                }`}
              >
                
                {/* Top Row Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold text-slate-400">{emg.id}</span>
                    <StatusBadge status={emg.severity} />
                    <StatusBadge status={emg.status} />
                  </div>
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-slate-400 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" /> {emg.reported_at?.replace('T', ' ').slice(0, 16)}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(emg.id, emg.status)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        isOpen
                          ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20'
                      }`}
                    >
                      {isOpen ? 'Mark Resolved' : 'Reopen Incident'}
                    </button>
                  </div>
                </div>

                {/* Incident Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Radio className="w-4 h-4 text-rose-500" />
                    <span>{emg.event_type} — {emg.station?.name || emg.station_id}</span>
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                    {emg.description}
                  </p>
                </div>

                {/* Response Log History Box */}
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Response Dispatch Timeline Log:
                  </span>
                  <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {emg.response_log || 'No response log entries.'}
                  </pre>
                </div>

                {/* Append Log Entry Input */}
                {isOpen && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Type response log update..."
                      value={logInputMap[emg.id] || ''}
                      onChange={(e) => setLogInputMap({ ...logInputMap, [emg.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddLogEntry(emg.id)}
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleAddLogEntry(emg.id)}
                      className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs flex items-center space-x-1 shadow transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Log Update</span>
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Report New Emergency Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full p-6 space-y-4 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-rose-500 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5" />
              <span>Report Emergency Incident</span>
            </h3>

            <form onSubmit={handleReportEmergency} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Station Location *</label>
                <select
                  value={newEmergency.station_id}
                  onChange={(e) => setNewEmergency({ ...newEmergency, station_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="LOC-BHA">Bharati Station</option>
                  <option value="LOC-MAI">Maitri Station</option>
                  <option value="LOC-CPT">Cape Town Staging Hub</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Incident Type</label>
                  <select
                    value={newEmergency.event_type}
                    onChange={(e) => setNewEmergency({ ...newEmergency, event_type: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="Generator Failure">Generator Failure</option>
                    <option value="Blizzard Damage">Blizzard Damage</option>
                    <option value="Medical Emergency">Medical Emergency</option>
                    <option value="Fuel Leak">Fuel Leak</option>
                    <option value="Communication Blackout">Comms Blackout</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Severity Level</label>
                  <select
                    value={newEmergency.severity}
                    onChange={(e) => setNewEmergency({ ...newEmergency, severity: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="critical">CRITICAL (Life / Power Risk)</option>
                    <option value="high">HIGH (Urgent Repair)</option>
                    <option value="medium">MEDIUM (Station Alert)</option>
                    <option value="low">LOW (Minor Warning)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Incident Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail the emergency situation, affected equipment, or medical status..."
                  value={newEmergency.description}
                  onChange={(e) => setNewEmergency({ ...newEmergency, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-rose-500/30"
              >
                Log Emergency Dispatch
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
