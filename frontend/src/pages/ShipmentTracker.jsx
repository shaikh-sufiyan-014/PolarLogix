import React, { useEffect, useState } from 'react';
import { getShipments, updateShipmentStatus, advanceShipmentLeg } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  Truck,
  Search,
  Filter,
  Package,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  X,
  FastForward
} from 'lucide-react';

export default function ShipmentTracker() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalShipment, setActiveModalShipment] = useState(null);
  const [advancingId, setAdvancingId] = useState(null);

  useEffect(() => {
    fetchShipments();
  }, [selectedStatus, selectedDestination]);

  const fetchShipments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getShipments({
        status: selectedStatus || undefined,
        destination: selectedDestination || undefined
      });
      setShipments(data);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to PolarLogix backend API server on port 8008. Please verify backend service is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceLeg = async (e, shipmentId) => {
    e.stopPropagation(); // Prevent modal opening when clicking button on card
    setAdvancingId(shipmentId);
    try {
      const updated = await advanceShipmentLeg(shipmentId);
      // Immediately update local state without page refresh
      setShipments(prev => prev.map(s => s.id === shipmentId ? { ...s, ...updated } : s));
      if (activeModalShipment?.id === shipmentId) {
        setActiveModalShipment(prev => ({ ...prev, ...updated }));
      }
    } catch (err) {
      console.error('Failed to advance leg:', err);
    } finally {
      setAdvancingId(null);
    }
  };

  const handleStatusUpdate = async (shipmentId, newStatus) => {
    try {
      const updated = await updateShipmentStatus(shipmentId, { status: newStatus });
      setShipments(prev => prev.map(s => s.id === shipmentId ? { ...s, ...updated } : s));
      if (activeModalShipment?.id === shipmentId) {
        setActiveModalShipment(prev => ({ ...prev, ...updated }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredShipments = shipments.filter(s =>
    s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Expedition Cargo Courier Tracker
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time status monitoring, box labelling & multi-step leg progress across transport hubs
          </p>
        </div>
        <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20">
          Total Packages: {filteredShipments.length}
        </div>
      </div>

      {/* Visible Error State (No Silent Fallback) */}
      {error && (
        <div className="p-4 glass-panel border-l-4 border-l-rose-500 bg-rose-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-rose-500">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-sm">Backend Connection Error</h3>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchShipments}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center gap-3">
        
        {/* Search */}
        <div className="relative w-full md:w-1/3">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search cargo, ID, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        {/* Filter Status */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="">All Cargo Statuses</option>
            <option value="planned">Planned</option>
            <option value="in_transit">In Transit</option>
            <option value="at_transfer_point">Cape Town Staging</option>
            <option value="delivered">Delivered</option>
            <option value="on_hold">On Hold / Hazmat</option>
          </select>

          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="">All Destinations</option>
            <option value="LOC-BHA">Bharati Station</option>
            <option value="LOC-MAI">Maitri Station</option>
            <option value="LOC-CPT">Cape Town Staging</option>
          </select>
        </div>

      </div>

      {/* Shipment Cards Grid */}
      {loading ? (
        <LoadingSkeleton type="cards" count={6} />
      ) : filteredShipments.length === 0 && !error ? (
        <div className="glass-panel p-12 text-center text-slate-500 dark:text-slate-400">
          No shipments found matching specified query filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredShipments.map((shp) => {
            
            const isDelivered = shp.status === 'delivered';

            return (
              <div
                key={shp.id}
                onClick={() => setActiveModalShipment(shp)}
                className="glass-panel p-5 cursor-pointer hover:border-sky-500/50 transition-all transform hover:-translate-y-0.5 space-y-4 flex flex-col justify-between group"
              >
                
                {/* Top ID & Status */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-sky-500 group-hover:underline">
                    {shp.id}
                  </span>
                  <StatusBadge status={shp.status} />
                </div>

                {/* Main Cargo Info */}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-sky-400 transition-colors">
                    {shp.description}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="capitalize">{shp.category.replace('_', ' ')}</span>
                    <span>•</span>
                    <span className="font-mono">{shp.weight_kg} kg</span>
                    {shp.is_hazmat && (
                      <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-500 font-bold text-[10px]">
                        HAZMAT
                      </span>
                    )}
                  </div>
                </div>

                {/* Package Label info */}
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-xs flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Current Position:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {shp.current_location?.name || shp.current_location_id}
                  </span>
                </div>

                {/* Progress Stepper Line */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <span>{shp.origin?.name || 'Origin'}</span>
                    <span>{shp.destination?.name || 'Destination'}</span>
                  </div>

                  {/* Multi-step bar */}
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 ${
                        shp.status === 'delivered'
                          ? 'w-full bg-emerald-500'
                          : shp.status === 'in_transit'
                          ? 'w-2/3 bg-cyan-400 animate-pulse'
                          : shp.status === 'at_transfer_point'
                          ? 'w-1/2 bg-amber-500'
                          : shp.status === 'on_hold'
                          ? 'w-1/3 bg-rose-500'
                          : 'w-1/4 bg-blue-500'
                      }`}
                    ></div>
                  </div>
                </div>

                {/* DEMO FEATURE: Advance to Next Leg Button */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  {!isDelivered ? (
                    <button
                      onClick={(e) => handleAdvanceLeg(e, shp.id)}
                      disabled={advancingId === shp.id}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      <FastForward className="w-3.5 h-3.5" />
                      <span>{advancingId === shp.id ? 'Simulating...' : 'Advance to Next Leg'}</span>
                    </button>
                  ) : (
                    <span className="text-emerald-500 font-bold flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Voyage Completed
                    </span>
                  )}

                  <span className="text-sky-500 font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                    Details <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Shipment Detail Modal */}
      {activeModalShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel max-w-2xl w-full p-6 space-y-5 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setActiveModalShipment(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-sky-500 text-sm">{activeModalShipment.id}</span>
                  <StatusBadge status={activeModalShipment.status} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {activeModalShipment.description}
                </h2>
              </div>
            </div>

            {/* Quick Details Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
              <div>
                <span className="text-slate-400 block">Category:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                  {activeModalShipment.category.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Weight:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {activeModalShipment.weight_kg} kg
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Box Label:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {activeModalShipment.box_label}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">ETA:</span>
                <span className="font-semibold text-emerald-500 font-mono">
                  {activeModalShipment.eta || 'TBD'}
                </span>
              </div>
            </div>

            {/* Demo Advance Leg Button inside Modal */}
            <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-sky-400">Live Logistics Simulation Control</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Advance cargo through computed transport legs in real time</p>
                </div>
                {activeModalShipment.status !== 'delivered' && (
                  <button
                    onClick={(e) => handleAdvanceLeg(e, activeModalShipment.id)}
                    className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow"
                  >
                    <FastForward className="w-4 h-4" />
                    <span>Advance to Next Leg</span>
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Status Override */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Manual Status Override:
              </label>
              <div className="flex flex-wrap gap-2">
                {['planned', 'in_transit', 'at_transfer_point', 'delivered', 'on_hold'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusUpdate(activeModalShipment.id, st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeModalShipment.status === st
                        ? 'bg-sky-500 text-white font-bold shadow'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {st.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
