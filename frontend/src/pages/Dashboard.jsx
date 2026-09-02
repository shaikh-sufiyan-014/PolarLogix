import React, { useEffect, useState } from 'react';
import { getDashboardSummary, getShipments, getEmergencies, getInventory } from '../services/api';
import ExpeditionMap from '../components/Map/ExpeditionMap';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  Truck,
  Users,
  AlertTriangle,
  ShieldAlert,
  ArrowUpRight,
  ChevronRight,
  Anchor,
  Plane,
  Box
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Dashboard({ setActiveTab }) {
  const [summary, setSummary] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumData, shpData, emgData] = await Promise.all([
        getDashboardSummary(),
        getShipments(),
        getEmergencies('open')
      ]);
      setSummary(sumData);
      setShipments(shpData);
      setEmergencies(emgData);
    } catch (err) {
      console.error(err);
      setError('Unable to load dashboard data from backend server. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 max-w-7xl mx-auto"><LoadingSkeleton type="cards" count={4} /></div>;

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center">
        <div className="p-6 glass-panel max-w-md mx-auto space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold">Backend Connection Failed</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg text-sm transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Recharts Data Prep
  const statusCounts = [
    { name: 'Planned', count: shipments.filter(s => s.status === 'planned').length, color: '#3B82F6' },
    { name: 'In Transit', count: shipments.filter(s => s.status === 'in_transit').length, color: '#06B6D4' },
    { name: 'Transfer Hub', count: shipments.filter(s => s.status === 'at_transfer_point').length, color: '#F59E0B' },
    { name: 'Delivered', count: shipments.filter(s => s.status === 'delivered').length, color: '#10B981' },
    { name: 'On Hold', count: shipments.filter(s => s.status === 'on_hold').length, color: '#EF4444' }
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 bg-gradient-to-r from-sky-500/10 via-cyan-500/5 to-transparent">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Antarctic Logistics Operations Command
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time multi-modal monitoring for Maitri & Bharati Research Stations (NCPOR 2026)
          </p>
        </div>
        <button
          onClick={() => setActiveTab('planner')}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-sky-500/25 transition-all transform hover:-translate-y-0.5"
        >
          <Box className="w-4 h-4" />
          <span>Plan New Shipment</span>
        </button>
      </div>

      {/* Overview Cards (Clickable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div
          onClick={() => setActiveTab('tracking')}
          className="glass-panel p-5 cursor-pointer hover:border-sky-500/50 transition-all transform hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Shipments
            </span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {summary?.active_shipments || 0}
            </span>
            <span className="text-xs text-slate-400 flex items-center">
              Total {summary?.total_shipments || 0} <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('personnel')}
          className="glass-panel p-5 cursor-pointer hover:border-emerald-500/50 transition-all transform hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Personnel Deployed
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {summary?.personnel_deployed || 0}
            </span>
            <span className="text-xs text-emerald-500 font-medium flex items-center">
              Summer/Winter Roster <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('inventory')}
          className="glass-panel p-5 cursor-pointer hover:border-amber-500/50 transition-all transform hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Low-Stock Alerts
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-amber-500">
              {summary?.low_stock_alerts || 0}
            </span>
            <span className="text-xs text-amber-500 font-medium">Station Supplies Alert</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('emergency')}
          className="glass-panel p-5 cursor-pointer hover:border-rose-500/50 transition-all transform hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Open Emergencies
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-rose-500">
              {summary?.open_emergencies || 0}
            </span>
            <span className="text-xs text-rose-500 font-semibold flex items-center">
              Incident Response <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>
        </div>

      </div>

      {/* Main Map & Active Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Map (Spans 2 Columns) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Anchor className="w-5 h-5 text-sky-500" />
              <span>Multi-Modal Expedition Route Network</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">India → Cape Town → Antarctica</span>
          </div>
          <ExpeditionMap />
        </div>

        {/* Analytics & Active Emergencies Panel */}
        <div className="space-y-6">
          
          {/* Active Emergencies Quick Widget */}
          <div className="glass-panel p-5 space-y-3 border-l-4 border-l-rose-500">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Active Station Incidents</span>
              </h3>
              <button
                onClick={() => setActiveTab('emergency')}
                className="text-xs text-sky-500 hover:underline flex items-center"
              >
                View Hub <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {emergencies.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-2">No active open emergency incidents reported.</p>
            ) : (
              <div className="space-y-2">
                {emergencies.map((emg) => (
                  <div key={emg.id} className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-rose-500">
                      <span>{emg.event_type}</span>
                      <StatusBadge status={emg.severity} />
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 line-clamp-2">{emg.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recharts Cargo Distribution Chart */}
          <div className="glass-panel p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Shipments Pipeline Breakdown
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {statusCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* Recent Cargo Shipments Table */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Recent Expedited Cargo Movements
          </h2>
          <button
            onClick={() => setActiveTab('tracking')}
            className="text-xs text-sky-500 hover:underline flex items-center font-medium"
          >
            All Tracking Cards <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/60 uppercase font-semibold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-3 rounded-l-lg">ID</th>
                <th className="p-3">Cargo Description</th>
                <th className="p-3">Category</th>
                <th className="p-3">Weight</th>
                <th className="p-3">Hazmat</th>
                <th className="p-3">Current Location</th>
                <th className="p-3">Status</th>
                <th className="p-3 rounded-r-lg">ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {shipments.slice(0, 5).map((shp) => (
                <tr key={shp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 font-mono font-bold text-sky-500">{shp.id}</td>
                  <td className="p-3 font-medium text-slate-900 dark:text-white">{shp.description}</td>
                  <td className="p-3 capitalize">{shp.category.replace('_', ' ')}</td>
                  <td className="p-3 font-mono">{shp.weight_kg} kg</td>
                  <td className="p-3">
                    {shp.is_hazmat ? (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 font-bold text-[10px]">HAZMAT</span>
                    ) : (
                      <span className="text-slate-400">Standard</span>
                    )}
                  </td>
                  <td className="p-3">{shp.current_location?.name || shp.current_location_id}</td>
                  <td className="p-3"><StatusBadge status={shp.status} /></td>
                  <td className="p-3 font-mono">{shp.eta || 'TBD'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
