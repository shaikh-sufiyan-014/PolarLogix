import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getMyPersonnelProfile,
  postWorkStatus,
  createEmergency,
  getEmergencies
} from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  UserCheck,
  Calendar,
  MapPin,
  Clock,
  ShieldAlert,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ClipboardList,
  Compass,
  Radio
} from 'lucide-react';

const COMMON_STATUS_PRESETS = [
  'On generator maintenance duty',
  'Conducting meteorological balloon launch',
  'Ice core sampling in field sector #4',
  'Available for station logistics duty',
  'Off-shift / rest cycle in living quarters',
  'Emergency medical response standby'
];

export default function PersonnelDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusText, setStatusText] = useState('');
  const [taskCategory, setTaskCategory] = useState('Station Maintenance');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Emergency Modal
  const [showEmgModal, setShowEmgModal] = useState(false);
  const [emgForm, setEmgForm] = useState({ event_type: 'Lab Instrument Malfunction', severity: 'medium', description: '' });

  const [notification, setNotification] = useState(null);

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchPersonnelData = async () => {
    try {
      const [profData, emgData] = await Promise.all([
        getMyPersonnelProfile().catch(() => null),
        getEmergencies().catch(() => [])
      ]);
      setProfile(profData);
      setEmergencies(Array.isArray(emgData) ? emgData : []);
    } catch (err) {
      console.error('Failed to fetch personnel data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonnelData();
    // Auto-poll emergencies every 15s
    const timer = setInterval(() => {
      getEmergencies().then(data => {
        if (Array.isArray(data)) setEmergencies(data);
      }).catch(console.error);
    }, 15000);
    return () => clearInterval(timer);
  }, [user]);

  const handlePostStatus = async (e) => {
    e.preventDefault();
    if (!statusText.trim()) return;
    setSubmittingStatus(true);
    try {
      await postWorkStatus({
        status_text: statusText.trim(),
        task_category: taskCategory
      });
      setStatusText('');
      showToast('Work status update recorded to expedition log!');
      fetchPersonnelData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update work status');
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleReportEmergency = async (e) => {
    e.preventDefault();
    try {
      await createEmergency({
        station_id: user.linked_station_id,
        event_type: emgForm.event_type,
        severity: emgForm.severity,
        description: emgForm.description
      });
      setShowEmgModal(false);
      setEmgForm({ event_type: 'Lab Instrument Malfunction', severity: 'medium', description: '' });
      showToast('Emergency SOS dispatched to Station Commander & NCPOR HQ!');
      fetchPersonnelData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to dispatch emergency');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <LoadingSkeleton type="cards" count={3} />
      </div>
    );
  }

  const workLogs = profile?.work_logs || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg ${
          notification.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
        }`}>
          <span>{notification.msg}</span>
          <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Hero Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border-l-4 border-l-indigo-500 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                Antarctic Expedition Member Portal
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Active Deployment
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {profile?.name || user?.username}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Personnel ID: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{profile?.id || user?.username}</span> • Official Expedition Roster Record
            </p>
          </div>

          <button
            onClick={() => setShowEmgModal(true)}
            className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-500/20 transition-all flex items-center gap-2 cursor-pointer self-start md:self-center"
          >
            <ShieldAlert className="w-4 h-4" />
            Report Station Emergency / SOS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT 5 COLS: MY OFFICIAL PROFILE (READ-ONLY) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-indigo-500" />
                My Official Profile
              </h3>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                Read-Only Record
              </span>
            </div>

            {profile ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 space-y-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Full Name & Scientific Role</span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{profile.name}</span>
                    <div className="text-indigo-600 dark:text-indigo-400 font-semibold">{profile.role}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Affiliated Institution</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{profile.affiliated_institution || 'NCPOR'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Employment Category</span>
                      <span className="font-semibold capitalize text-indigo-600 dark:text-indigo-400">
                        {profile.personnel_category ? profile.personnel_category.replace('_', ' ') : 'Permanent Staff'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Assigned Station</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.assigned_station}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Season Cycle</span>
                      <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">{profile.season_type}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-slate-400 block text-[11px]">Deployment Dates</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {profile.deployment_start} → {profile.deployment_end}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Operational Status</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {profile.current_status}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-indigo-500/5 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  <span className="font-bold text-indigo-500 block mb-1">Station Commander Note:</span>
                  All personnel deployment records are authenticated directly by NCPOR HQ. Privacy and role-isolation are strictly enforced.
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No profile details linked to this ID.</p>
            )}
          </div>
        </div>

        {/* RIGHT 7 COLS: WORK STATUS TRACKER & DUTY LOGS */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Work Status Update Box */}
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                Work Status & Duty Tracker
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update your current duty status or research task. Updates appear in the Station Commander roster.
              </p>
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Quick Status Presets</span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_STATUS_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setStatusText(preset)}
                    className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-indigo-500 text-slate-700 dark:text-slate-300 transition-colors text-left"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Status Form */}
            <form onSubmit={handlePostStatus} className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Current Task / Activity</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. On generator maintenance duty"
                    value={statusText}
                    onChange={(e) => setStatusText(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="Station Maintenance">Station Maintenance</option>
                    <option value="Scientific Research">Scientific Research</option>
                    <option value="Field Expedition">Field Expedition</option>
                    <option value="Emergency Duty">Emergency Duty</option>
                    <option value="Rest / Off-Shift">Rest / Off-Shift</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingStatus || !statusText.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {submittingStatus ? 'Updating...' : 'Log Duty Status'}
              </button>
            </form>

            {/* History of Work Logs */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Recent Duty Logs</h4>
              {workLogs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No duty status logs recorded yet.</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {workLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white">{log.status_text}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {log.logged_at?.substring(0, 16).replace('T', ' ')}
                        </span>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        {log.task_category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Station Connected Alerts Box */}
          <div className="glass-panel p-6 rounded-2xl space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Active Station Alerts & Warnings
            </h3>
            {emergencies.length === 0 ? (
              <p className="text-xs text-slate-400">No active station emergency alerts.</p>
            ) : (
              emergencies.map((emg) => (
                <div key={emg.id} className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{emg.event_type}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500 text-white">
                      {emg.severity}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{emg.description}</p>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

      {/* MODAL: REPORT STATION EMERGENCY */}
      {showEmgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel p-6 max-w-md w-full rounded-2xl space-y-4 bg-white dark:bg-[#111827]">
            <h3 className="text-base font-bold text-rose-500 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Dispatch Emergency Incident
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Immediately alerts the Bharati Station Commander and NCPOR Operations Headquarters.
            </p>
            <form onSubmit={handleReportEmergency} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Incident Event Type</label>
                <input
                  required
                  type="text"
                  value={emgForm.event_type}
                  onChange={(e) => setEmgForm({ ...emgForm, event_type: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Severity</label>
                <select
                  value={emgForm.severity}
                  onChange={(e) => setEmgForm({ ...emgForm, severity: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="low">Low - Minor Equipment Notice</option>
                  <option value="medium">Medium - Operational Warning</option>
                  <option value="high">High - Station Critical Event</option>
                  <option value="critical">Critical - Life Safety / Evacuation Alert</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Incident Details</label>
                <textarea
                  required
                  rows={3}
                  value={emgForm.description}
                  onChange={(e) => setEmgForm({ ...emgForm, description: e.target.value })}
                  placeholder="Describe incident, location inside station, and assistance needed..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEmgModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-lg cursor-pointer"
                >
                  Broadcast SOS Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
