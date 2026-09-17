import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getShipments,
  getShipmentDetail,
  advanceShipmentLeg,
  recordHandoverConfirmation,
  getShipmentConsumables,
  updateConsumableLevel,
  recalculateAlternateRoute,
  addWeatherLog,
  uploadShipmentDocument,
  createEmergency,
  getLocations
} from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  Ship,
  Truck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  CloudSnow,
  Route,
  ShieldAlert,
  Fuel,
  Droplets,
  Utensils,
  Plus,
  Compass,
  ArrowRight,
  UploadCloud,
  FileCheck,
  Send,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  Thermometer,
  Wind
} from 'lucide-react';

export default function ShipmentOfficerDashboard() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  // Active sub-tab inside shipment detail: 'progress' | 'handovers' | 'consumables' | 'weather' | 'documents' | 'alternateRoute' | 'emergency'
  const [activeTab, setActiveTab] = useState('progress');

  // Form states
  const [handoverForm, setHandoverForm] = useState({ location_id: 'LOC-CPT', confirmation_type: 'received', notes: '' });
  const [weatherForm, setWeatherForm] = useState({ condition: 'Heavy Blizzard / 40kt Winds', note: '', temperature_c: -12.0, wind_speed_knots: 40.0 });
  const [docForm, setDocForm] = useState({ file_name: '', file_type: 'hazmat_cert' });
  const [rerouteForm, setRerouteForm] = useState({ issue_description: 'Pack ice formation blocking primary maritime channel', avoid_mode: 'ship' });
  const [emgForm, setEmgForm] = useState({ event_type: 'Cargo Shift During Gale', severity: 'high', description: '' });

  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchOfficerData = async () => {
    try {
      const [shpData, locData] = await Promise.all([
        getShipments().catch(() => []),
        getLocations().catch(() => [])
      ]);
      const list = Array.isArray(shpData) ? shpData : [];
      setShipments(list);
      setLocations(Array.isArray(locData) ? locData : []);

      if (list.length > 0) {
        // Refresh selected shipment or select first
        const currentId = selectedShipment?.id || list[0].id;
        const detail = await getShipmentDetail(currentId).catch(() => list[0]);
        setSelectedShipment(detail);
      }
    } catch (err) {
      console.error('Failed to load officer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficerData();
  }, [user]);

  const handleSelectShipment = async (shp) => {
    setLoading(true);
    try {
      const detail = await getShipmentDetail(shp.id);
      setSelectedShipment(detail);
    } catch (err) {
      console.error('Error fetching shipment detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceLeg = async () => {
    if (!selectedShipment) return;
    setAdvancing(true);
    try {
      const updated = await advanceShipmentLeg(selectedShipment.id);
      setSelectedShipment(updated);
      showNotification(`Shipment ${updated.id} successfully advanced to next transport leg!`);
      fetchOfficerData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to advance leg');
    } finally {
      setAdvancing(false);
    }
  };

  const handleConfirmHandover = async (e) => {
    e.preventDefault();
    if (!selectedShipment) return;
    try {
      await recordHandoverConfirmation(selectedShipment.id, handoverForm);
      showNotification('Chain-of-Custody handover record logged successfully.');
      const detail = await getShipmentDetail(selectedShipment.id);
      setSelectedShipment(detail);
      setHandoverForm({ location_id: 'LOC-CPT', confirmation_type: 'received', notes: '' });
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to record handover');
    }
  };

  const handleAddWeatherLog = async (e) => {
    e.preventDefault();
    if (!selectedShipment) return;
    try {
      await addWeatherLog(selectedShipment.id, weatherForm);
      showNotification('Current voyage weather log saved.');
      const detail = await getShipmentDetail(selectedShipment.id);
      setSelectedShipment(detail);
      setWeatherForm({ condition: 'Calm Seas', note: '', temperature_c: 0, wind_speed_knots: 10 });
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add weather log');
    }
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!selectedShipment || !docForm.file_name) return;
    try {
      await uploadShipmentDocument(selectedShipment.id, docForm);
      showNotification('Document manifest attached to shipment.');
      const detail = await getShipmentDetail(selectedShipment.id);
      setSelectedShipment(detail);
      setDocForm({ file_name: '', file_type: 'hazmat_cert' });
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to attach document');
    }
  };

  const handleRecalculateAlternateRoute = async (e) => {
    e.preventDefault();
    if (!selectedShipment) return;
    try {
      const updated = await recalculateAlternateRoute(selectedShipment.id, rerouteForm);
      setSelectedShipment(updated);
      showNotification('Alternate route recomputed using Dijkstra engine!');
      fetchOfficerData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to recalculate alternate route');
    }
  };

  const handleReportShipmentEmergency = async (e) => {
    e.preventDefault();
    if (!selectedShipment) return;
    try {
      await createEmergency({
        shipment_id: selectedShipment.id,
        station_id: selectedShipment.destination_id,
        event_type: emgForm.event_type,
        severity: emgForm.severity,
        description: emgForm.description
      });
      showNotification('Shipment Emergency dispatched to NCPOR and Station Commander.');
      setEmgForm({ event_type: 'Cargo Shift During Gale', severity: 'high', description: '' });
      fetchOfficerData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to report emergency');
    }
  };

  if (loading && !selectedShipment) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <LoadingSkeleton type="cards" count={4} />
      </div>
    );
  }

  // Parse computed route
  let computedLegs = [];
  if (selectedShipment?.computed_route_json) {
    try {
      computedLegs = JSON.parse(selectedShipment.computed_route_json);
    } catch (e) {}
  }

  // Calculate consumables warning
  const consumablesList = selectedShipment?.consumables || [];
  const lowConsumables = consumablesList.filter(c => c.current_quantity <= (c.starting_quantity * 0.25));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
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
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border-l-4 border-l-teal-500 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 flex items-center gap-1.5">
                <Ship className="w-3.5 h-3.5 text-teal-500" />
                Shipment Officer Command Portal
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                {shipments.length} Assigned Voyage{shipments.length === 1 ? '' : 's'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Expedition Cargo & Voyage Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Assigned Officer: <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{user?.username}</span> • Scoped to assigned shipments and active transit custody.
            </p>
          </div>

          {selectedShipment && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleAdvanceLeg}
                disabled={advancing || selectedShipment.status === 'delivered'}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {advancing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {selectedShipment.status === 'delivered' ? 'Shipment Delivered' : 'Advance Next Voyage Leg →'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Left Column (My Shipments List) & Right Column (Dedicated Operation Center) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT 4 COLS: MY SHIPMENTS SELECTOR */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-4 rounded-2xl space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-500" />
                My Assigned Shipments
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {shipments.length}
              </span>
            </h3>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
              {shipments.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No shipments currently assigned to your officer account.
                </div>
              ) : (
                shipments.map((shp) => {
                  const isSelected = selectedShipment?.id === shp.id;
                  return (
                    <div
                      key={shp.id}
                      onClick={() => handleSelectShipment(shp)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? 'border-teal-500 bg-teal-500/10 dark:bg-teal-950/30 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400">{shp.id}</span>
                        <StatusBadge status={shp.status} />
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{shp.description}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                        <span>{shp.weight_kg.toLocaleString()} kg</span>
                        <span className="truncate max-w-[120px]">Dest: {shp.destination?.name?.split(' ')[0] || shp.destination_id}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT 8 COLS: DEDICATED SHIPMENT OPERATIONS WORKSPACE */}
        <div className="lg:col-span-8 space-y-6">
          {selectedShipment ? (
            <div className="glass-panel p-6 rounded-2xl space-y-6">
              
              {/* Selected Shipment Summary Card */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-teal-500">{selectedShipment.id}</span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedShipment.description}</h2>
                  </div>
                  <StatusBadge status={selectedShipment.status} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Category</span>
                    <span className="font-semibold capitalize">{selectedShipment.category.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Weight</span>
                    <span className="font-semibold">{selectedShipment.weight_kg} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Current Location</span>
                    <span className="font-semibold text-teal-600 dark:text-teal-400">{selectedShipment.current_location?.name || selectedShipment.current_location_id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Destination</span>
                    <span className="font-semibold">{selectedShipment.destination?.name || selectedShipment.destination_id}</span>
                  </div>
                </div>
              </div>

              {/* Sub-Tabs Selector */}
              <div className="flex flex-wrap gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-3">
                {[
                  { id: 'progress', label: 'Route & Legs', icon: Route },
                  { id: 'handovers', label: `Handovers (${selectedShipment.handover_confirmations?.length || 0})`, icon: FileCheck },
                  { id: 'consumables', label: `Consumables (${consumablesList.length})`, icon: Fuel, alert: lowConsumables.length > 0 },
                  { id: 'weather', label: `Weather Log (${selectedShipment.weather_logs?.length || 0})`, icon: CloudSnow },
                  { id: 'documents', label: `Docs (${selectedShipment.documents?.length || 0})`, icon: FileText },
                  { id: 'alternateRoute', label: 'Alternate Route', icon: Compass },
                  { id: 'emergency', label: 'Report Issue', icon: ShieldAlert }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-teal-500 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      {tab.alert && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: ROUTE PROGRESS */}
              {activeTab === 'progress' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Voyage Itinerary & Legs</h3>
                  <div className="space-y-3">
                    {computedLegs.map((leg, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                          selectedShipment.current_leg_id === leg.leg_id
                            ? 'border-teal-500 bg-teal-500/10 dark:bg-teal-950/20'
                            : 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 rounded-full bg-teal-500 text-white font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </div>
                          <div>
                            <span className="font-bold font-mono text-slate-900 dark:text-white">{leg.leg_id}</span>
                            <div className="text-[11px] text-slate-500 capitalize">
                              Mode: {leg.mode} • Duration: {leg.duration_days} days
                            </div>
                          </div>
                        </div>

                        <div>
                          {selectedShipment.current_leg_id === leg.leg_id ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500 text-white animate-pulse">
                              Active Leg
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-mono">Leg #{idx + 1}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: DIGITAL HANDOVER CONFIRMATION */}
              {activeTab === 'handovers' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Chain-of-Custody Digital Handovers</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sign off transfer receipts at Cape Town Staging & Antarctic drop points.
                    </p>
                  </div>

                  {/* Handover Sign-off Form */}
                  <form onSubmit={handleConfirmHandover} className="p-4 rounded-xl border border-teal-500/30 bg-teal-500/5 dark:bg-teal-950/20 space-y-3">
                    <h4 className="font-bold text-xs text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4" /> Log New Handover Event
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Transfer Location</label>
                        <select
                          value={handoverForm.location_id}
                          onChange={(e) => setHandoverForm({ ...handoverForm, location_id: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        >
                          {locations.map((loc) => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Confirmation Type</label>
                        <select
                          value={handoverForm.confirmation_type}
                          onChange={(e) => setHandoverForm({ ...handoverForm, confirmation_type: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        >
                          <option value="received">Confirm Received from Inbound Carrier</option>
                          <option value="handed_off">Confirm Handed Off to Onward Flight / Vessel</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Custody Notes / Seal Inspection</label>
                      <input
                        type="text"
                        placeholder="e.g. Container seals verified intact; temperature logging recorder continuous."
                        value={handoverForm.notes}
                        onChange={(e) => setHandoverForm({ ...handoverForm, notes: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      Sign Digital Handover Record
                    </button>
                  </form>

                  {/* Handover Timeline */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logged Handover Trail</h4>
                    {selectedShipment.handover_confirmations?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No handover confirmations recorded yet.</p>
                    ) : (
                      selectedShipment.handover_confirmations.map((hnd) => (
                        <div key={hnd.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white capitalize">
                              {hnd.confirmation_type.replace('_', ' ')} @ {hnd.location?.name || hnd.location_id}
                            </span>
                            <span className="text-[11px] font-mono text-teal-600 dark:text-teal-400">
                              {hnd.confirmed_at?.substring(0, 16).replace('T', ' ')}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300">{hnd.notes || 'No extra notes provided.'}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: VOYAGE CONSUMABLES TRACKER & LOW STOCK WARNING */}
              {activeTab === 'consumables' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Voyage Consumables & Provisioning Tracker</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Starting vs current supplies allocated for this voyage. Alerts trigger if stock falls below safety reserve.
                    </p>
                  </div>

                  {lowConsumables.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2.5">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <span className="font-bold">Low Consumables Alert:</span> One or more voyage provisioning items have depleted below 25% safety reserve. Request replenishment at next transfer port.
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {consumablesList.map((c) => {
                      const percentage = Math.round((c.current_quantity / (c.starting_quantity || 1)) * 100);
                      const isLow = percentage <= 25;
                      return (
                        <div key={c.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{c.item_name}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isLow ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-500/10 text-emerald-500'
                            }`}>
                              {isLow ? 'Low Stock Warning' : 'Adequate'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-500">Remaining:</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {c.current_quantity.toLocaleString()} / {c.starting_quantity.toLocaleString()} {c.unit} ({percentage}%)
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                isLow ? 'bg-rose-500' : percentage <= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, percentage)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Daily Burn: ~{c.daily_consumption_rate} {c.unit}/day</span>
                            <span>Safe Days: ~{Math.floor(c.current_quantity / (c.daily_consumption_rate || 1))} days left</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: WEATHER & CONDITION LOGS */}
              {activeTab === 'weather' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Expedition Weather & Sea Condition Log</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Log real-time weather, gale warnings, and pack ice conditions encountered along the voyage corridor.
                    </p>
                  </div>

                  <form onSubmit={handleAddWeatherLog} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CloudSnow className="w-4 h-4 text-sky-500" /> Record Weather Observation
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Condition Summary</label>
                        <input
                          type="text"
                          required
                          value={weatherForm.condition}
                          onChange={(e) => setWeatherForm({ ...weatherForm, condition: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Temperature (°C)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={weatherForm.temperature_c}
                          onChange={(e) => setWeatherForm({ ...weatherForm, temperature_c: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Wind Speed (knots)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={weatherForm.wind_speed_knots}
                          onChange={(e) => setWeatherForm({ ...weatherForm, wind_speed_knots: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Observation Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Swell 5m, pack ice thickness 40cm, speed reduced to 8 knots."
                        value={weatherForm.note}
                        onChange={(e) => setWeatherForm({ ...weatherForm, note: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      Save Weather Log
                    </button>
                  </form>

                  {/* Weather Log Trail */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logged Observations</h4>
                    {selectedShipment.weather_logs?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No weather reports logged yet.</p>
                    ) : (
                      selectedShipment.weather_logs.map((wth) => (
                        <div key={wth.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <CloudSnow className="w-3.5 h-3.5 text-sky-500" />
                              {wth.condition}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">{wth.logged_at?.substring(0, 16).replace('T', ' ')}</span>
                          </div>
                          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                            {wth.temperature_c !== null && <span>Temp: {wth.temperature_c}°C</span>}
                            {wth.wind_speed_knots !== null && <span>Wind: {wth.wind_speed_knots} knots</span>}
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 mt-1">{wth.note}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: DOCUMENT MANIFEST ATTACHMENTS */}
              {activeTab === 'documents' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Shipment Documentation & Regulatory Manifests</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Attach Hazmat MSDS certificates, Customs clearance paperwork, and packing manifests.
                    </p>
                  </div>

                  <form onSubmit={handleUploadDoc} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-teal-500" /> Attach Document Record
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">File Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Hazmat_MSDS_Certificate.pdf"
                          value={docForm.file_name}
                          onChange={(e) => setDocForm({ ...docForm, file_name: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Document Type</label>
                        <select
                          value={docForm.file_type}
                          onChange={(e) => setDocForm({ ...docForm, file_type: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        >
                          <option value="hazmat_cert">Hazmat / Dangerous Goods Certificate</option>
                          <option value="customs_paperwork">Customs Port Clearance Paperwork</option>
                          <option value="packing_manifest">Packing & Pallet Manifest</option>
                          <option value="inspection_report">Pre-Voyage Cold-Chain Inspection Report</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      Attach Document
                    </button>
                  </form>

                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attached Shipment Files</h4>
                    {selectedShipment.documents?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No document attachments uploaded.</p>
                    ) : (
                      selectedShipment.documents.map((doc) => (
                        <div key={doc.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-4 h-4 text-teal-500 flex-shrink-0" />
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">{doc.file_name}</span>
                              <div className="text-[11px] text-slate-500 capitalize">
                                {doc.file_type.replace('_', ' ')} • {doc.file_size_kb} KB
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            {doc.uploaded_at?.substring(0, 10)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: SCOPED ALTERNATE ROUTE SUGGESTION */}
              {activeTab === 'alternateRoute' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Emergency Route Optimizer (Scoped Recomputation)</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Flag weather disruptions or blocked transit legs. The NetworkX Dijkstra engine will calculate the fastest feasible alternate corridor from your current position.
                    </p>
                  </div>

                  <form onSubmit={handleRecalculateAlternateRoute} className="p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 dark:bg-sky-950/20 space-y-3">
                    <h4 className="font-bold text-xs text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                      <Compass className="w-4 h-4" /> Recompute Optimal Alternate Route
                    </h4>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Disruption Reason / Hazard Description</label>
                      <input
                        type="text"
                        required
                        value={rerouteForm.issue_description}
                        onChange={(e) => setRerouteForm({ ...rerouteForm, issue_description: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Transport Mode to Bypass</label>
                      <select
                        value={rerouteForm.avoid_mode}
                        onChange={(e) => setRerouteForm({ ...rerouteForm, avoid_mode: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      >
                        <option value="ship">Bypass Maritime Shipping (Pack ice / vessel engine trouble)</option>
                        <option value="aircraft">Bypass Airbridge Flight (Crosswinds / runway blizzard)</option>
                        <option value="helicopter">Bypass Helicopter Transport</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      Recalculate Alternate Route
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 7: REPORT SHIPMENT EMERGENCY */}
              {activeTab === 'emergency' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Shipment Incident & Emergency Dispatch</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Report critical cargo, vessel, or transfer incidents. Automatically feeds into NCPOR HQ and Destination Station Commander hubs.
                    </p>
                  </div>

                  <form onSubmit={handleReportShipmentEmergency} className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20 space-y-3">
                    <h4 className="font-bold text-xs text-rose-500 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" /> Report Shipment Emergency
                    </h4>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Incident Type</label>
                      <input
                        type="text"
                        required
                        value={emgForm.event_type}
                        onChange={(e) => setEmgForm({ ...emgForm, event_type: e.target.value })}
                        placeholder="e.g. Cargo Lashing Shift, Refrigerator Container Failure"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Severity</label>
                      <select
                        value={emgForm.severity}
                        onChange={(e) => setEmgForm({ ...emgForm, severity: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      >
                        <option value="medium">Medium - Operational Warning</option>
                        <option value="high">High - Serious Cargo / Delay Risk</option>
                        <option value="critical">Critical - Immediate Vessel / Life Threat</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Incident Details</label>
                      <textarea
                        rows={3}
                        required
                        value={emgForm.description}
                        onChange={(e) => setEmgForm({ ...emgForm, description: e.target.value })}
                        placeholder="Provide details on location, cargo state, and emergency assistance required..."
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      Dispatch Shipment SOS to HQ
                    </button>
                  </form>
                </div>
              )}

            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-400">
              Select a shipment from the left list to view operations.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
