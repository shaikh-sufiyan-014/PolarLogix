import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getDashboardSummary,
  getInventory,
  getPersonnel,
  getEmergencies,
  getShipments,
  saveInventoryItem,
  createEmergency,
  updateEmergency
} from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ExpeditionMap from '../components/Map/ExpeditionMap';
import {
  Radio,
  Boxes,
  Users,
  ShieldAlert,
  AlertTriangle,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  Send,
  Thermometer,
  Wind,
  Compass,
  ArrowDownRight,
  ChevronRight
} from 'lucide-react';

export default function StationCommanderDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // overview, inventory, personnel, emergencies

  const [summary, setSummary] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals / forms
  const [showInvModal, setShowInvModal] = useState(false);
  const [invForm, setInvForm] = useState({ item_name: '', category: 'spare_parts', quantity: 10, unit: 'units', minimum_threshold: 5 });
  
  const [showEmgModal, setShowEmgModal] = useState(false);
  const [emgForm, setEmgForm] = useState({ event_type: '', severity: 'high', description: '' });

  const [responseLogInputs, setResponseLogInputs] = useState({});

  const stationName = user?.linked_station_id === 'LOC-BHA' ? 'Bharati Research Station' : 'Maitri Research Station';
  const stationCode = user?.linked_station_id === 'LOC-BHA' ? 'BHARATI-STN (Larsemann Hills)' : 'MAITRI-STN (Schirmacher Oasis)';

  const fetchData = async () => {
    try {
      const [sumData, invData, perData, emgData, shpData] = await Promise.all([
        getDashboardSummary().catch(() => null),
        getInventory(user?.linked_station_id).catch(() => []),
        getPersonnel().catch(() => []),
        getEmergencies().catch(() => []),
        getShipments().catch(() => [])
      ]);
      setSummary(sumData);
      setInventory(Array.isArray(invData) ? invData : []);
      setPersonnel(Array.isArray(perData) ? perData : []);
      setEmergencies(Array.isArray(emgData) ? emgData : []);
      setShipments(Array.isArray(shpData) ? shpData : []);
    } catch (err) {
      console.error('Error fetching station data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // 15s auto-polling for emergency and telemetry updates
    const timer = setInterval(() => {
      getEmergencies().then(data => {
        if (Array.isArray(data)) setEmergencies(data);
      }).catch(console.error);
    }, 15000);
    return () => clearInterval(timer);
  }, [user]);

  const handleAddInventory = async (e) => {
    e.preventDefault();
    try {
      await saveInventoryItem(user.linked_station_id, {
        location_id: user.linked_station_id,
        item_name: invForm.item_name,
        category: invForm.category,
        quantity: parseFloat(invForm.quantity),
        unit: invForm.unit,
        minimum_threshold: parseFloat(invForm.minimum_threshold)
      });
      setShowInvModal(false);
      setInvForm({ item_name: '', category: 'spare_parts', quantity: 10, unit: 'units', minimum_threshold: 5 });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save inventory item');
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
      setEmgForm({ event_type: '', severity: 'high', description: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to report emergency');
    }
  };

  const handleSendResponseLog = async (emgId) => {
    const text = responseLogInputs[emgId];
    if (!text || !text.trim()) return;
    try {
      await updateEmergency(emgId, { response_log: text.trim() });
      setResponseLogInputs(prev => ({ ...prev, [emgId]: '' }));
      fetchData();
    } catch (err) {
      alert('Failed to update response log');
    }
  };

  const handleResolveEmergency = async (emgId) => {
    try {
      await updateEmergency(emgId, { status: 'resolved', response_log: 'Marked incident as RESOLVED by Station Commander.' });
      fetchData();
    } catch (err) {
      alert('Failed to resolve emergency');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <LoadingSkeleton type="cards" count={4} />
      </div>
    );
  }

  const lowStockItems = inventory.filter(i => i.quantity <= i.minimum_threshold);
  const openEmergencies = emergencies.filter(e => e.status === 'open');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Station Commander Hero Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden border-l-4 border-l-sky-500 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse text-sky-500" />
                Station Scoped Operations
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Winter Over Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stationName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {stationCode} • Commander Account: <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{user?.username}</span>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEmgModal(true)}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              Report Station Emergency
            </button>
            <button
              onClick={() => setShowInvModal(true)}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Inventory
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Station Overview', icon: Compass },
            { id: 'inventory', label: `Station Inventory (${inventory.length})`, icon: Boxes, alert: lowStockItems.length > 0 },
            { id: 'personnel', label: `Station Roster (${personnel.length})`, icon: Users },
            { id: 'emergencies', label: `Emergency Hub (${openEmergencies.length})`, icon: ShieldAlert, alert: openEmergencies.length > 0 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.alert && (
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-rose-500 animate-ping'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: STATION OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Station Shipments</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{shipments.length}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-500">Inbound/Local</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Station Personnel</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{personnel.length}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">On Duty</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Low Stock Alerts</span>
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
                  {lowStockItems.length}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${lowStockItems.length > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  {lowStockItems.length > 0 ? 'Action Needed' : 'Supplies Nominal'}
                </span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Station Emergencies</span>
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold ${openEmergencies.length > 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                  {openEmergencies.length}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${openEmergencies.length > 0 ? 'bg-rose-500/10 text-rose-500 animate-pulse' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {openEmergencies.length > 0 ? 'Active Incidents' : 'All Clear'}
                </span>
              </div>
            </div>
          </div>

          {/* Map + Inbound Shipments Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-panel p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sky-500" />
                  Station Inbound Transport Corridors
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">Live Logistics Grid</span>
              </div>
              <div className="h-[360px] rounded-xl overflow-hidden">
                <ExpeditionMap shipments={shipments} />
              </div>
            </div>

            {/* Inbound Cargo Watch */}
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-sky-500" />
                Inbound Cargo Manifests
              </h3>
              <div className="space-y-3 overflow-y-auto max-h-[340px]">
                {shipments.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No inbound shipments currently scheduled.</p>
                ) : (
                  shipments.map((shp) => (
                    <div key={shp.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-sky-500">{shp.id}</span>
                        <StatusBadge status={shp.status} />
                      </div>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{shp.description}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Weight: {shp.weight_kg} kg</span>
                        <span>ETA: {shp.eta || 'Pending'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STATION INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Station Reserve & Critical Supplies Inventory
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scoped strictly to {stationName}. Low-stock thresholds trigger resupply alerts automatically.
              </p>
            </div>
            <button
              onClick={() => setShowInvModal(true)}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 self-start cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Min. Threshold</th>
                  <th className="py-3 px-4">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {inventory.map((item) => {
                  const isLow = item.quantity <= item.minimum_threshold;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">{item.item_name}</td>
                      <td className="py-3.5 px-4 capitalize text-slate-500 dark:text-slate-400">{item.category.replace('_', ' ')}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {item.quantity.toLocaleString()} {item.unit}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {item.minimum_threshold.toLocaleString()} {item.unit}
                      </td>
                      <td className="py-3.5 px-4">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Warning
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Optimal
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STATION PERSONNEL */}
      {activeTab === 'personnel' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Station Deployed Personnel & Duty Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Station commander view of active expedition members, scientists, and engineers stationed at {stationName}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personnel.map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-500">{p.id}</span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {p.season_type} Expedition
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</h4>
                  <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">{p.role}</p>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div>Station: <span className="text-slate-700 dark:text-slate-300">{p.assigned_station}</span></div>
                  <div>Period: <span className="font-mono">{p.deployment_start} to {p.deployment_end}</span></div>
                </div>

                {/* Work Activity Logs */}
                {p.work_logs && p.work_logs.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Latest Duty Status</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 italic mt-0.5">
                      "{p.work_logs[p.work_logs.length - 1].status_text}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STATION EMERGENCY HUB */}
      {activeTab === 'emergencies' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Station Incident & SOS Command Hub
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connected emergency stream scoped to {stationName} and inbound vessels. Polling active every 15s.
              </p>
            </div>
            <button
              onClick={() => setShowEmgModal(true)}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" /> Log Incident
            </button>
          </div>

          <div className="space-y-4">
            {emergencies.length === 0 ? (
              <div className="glass-panel p-12 text-center text-slate-500 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-semibold">No active emergencies for this station.</p>
                <p className="text-xs">All station telemetry and expedition systems operating nominally.</p>
              </div>
            ) : (
              emergencies.map((emg) => (
                <div key={emg.id} className="glass-panel p-5 rounded-2xl border-l-4 border-l-rose-500 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-rose-500">{emg.id}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                          emg.severity === 'critical' ? 'bg-rose-500 text-white animate-pulse' :
                          emg.severity === 'high' ? 'bg-amber-500 text-white' : 'bg-sky-500 text-white'
                        }`}>
                          {emg.severity}
                        </span>
                        <span className="text-xs text-slate-400">• Reported: {emg.reported_at?.substring(0, 16).replace('T', ' ')}</span>
                      </div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">{emg.event_type}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {emg.status === 'open' ? (
                        <button
                          onClick={() => handleResolveEmergency(emg.id)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      ) : (
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 font-semibold text-xs rounded-lg border border-emerald-500/20">
                          Resolved
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    {emg.description}
                  </p>

                  {/* Incident Response Log Trail */}
                  {emg.response_log && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Incident Response Audit Trail</span>
                      <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl whitespace-pre-wrap leading-relaxed">
                        {emg.response_log}
                      </pre>
                    </div>
                  )}

                  {/* Commander Response Logger */}
                  {emg.status === 'open' && (
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Post station commander response log update..."
                        value={responseLogInputs[emg.id] || ''}
                        onChange={(e) => setResponseLogInputs({ ...responseLogInputs, [emg.id]: e.target.value })}
                        className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                      />
                      <button
                        onClick={() => handleSendResponseLog(emg.id)}
                        className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" /> Post Update
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD INVENTORY */}
      {showInvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel p-6 max-w-md w-full rounded-2xl space-y-4 bg-white dark:bg-[#111827]">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add / Update Station Inventory</h3>
            <form onSubmit={handleAddInventory} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Item Name</label>
                <input
                  required
                  type="text"
                  value={invForm.item_name}
                  onChange={(e) => setInvForm({ ...invForm, item_name: e.target.value })}
                  placeholder="e.g. Polar Diesel Fuel"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={invForm.category}
                    onChange={(e) => setInvForm({ ...invForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="fuel">Fuel</option>
                    <option value="food">Food</option>
                    <option value="spare_parts">Spare Parts</option>
                    <option value="medical">Medical</option>
                    <option value="scientific_equipment">Scientific</option>
                    <option value="clothing">Clothing</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Unit</label>
                  <input
                    required
                    type="text"
                    value={invForm.unit}
                    onChange={(e) => setInvForm({ ...invForm, unit: e.target.value })}
                    placeholder="liters, kg, units"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quantity</label>
                  <input
                    required
                    type="number"
                    value={invForm.quantity}
                    onChange={(e) => setInvForm({ ...invForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Min. Alert Threshold</label>
                  <input
                    required
                    type="number"
                    value={invForm.minimum_threshold}
                    onChange={(e) => setInvForm({ ...invForm, minimum_threshold: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInvModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs rounded-lg cursor-pointer"
                >
                  Save Stock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REPORT STATION EMERGENCY */}
      {showEmgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel p-6 max-w-md w-full rounded-2xl space-y-4 bg-white dark:bg-[#111827]">
            <h3 className="text-base font-bold text-rose-500 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Report Station Emergency
            </h3>
            <form onSubmit={handleReportEmergency} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Incident Type</label>
                <input
                  required
                  type="text"
                  value={emgForm.event_type}
                  onChange={(e) => setEmgForm({ ...emgForm, event_type: e.target.value })}
                  placeholder="e.g. Radome Antenna Damage, Genset Tripped"
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
                  <option value="critical">Critical - Immediate Threat / Life Safety</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description & Action Taken</label>
                <textarea
                  required
                  rows={3}
                  value={emgForm.description}
                  onChange={(e) => setEmgForm({ ...emgForm, description: e.target.value })}
                  placeholder="Describe damage, impacted systems, and initial countermeasures..."
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
                  Broadcast Emergency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
