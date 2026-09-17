import React, { useEffect, useState } from 'react';
import { getDashboardSummary, getShipments, getEmergencies } from '../services/api';
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
  Box,
  Globe,
  Snowflake,
  Mountain,
  Compass,
  Building,
  CheckCircle2,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function Dashboard({ setActiveTab }) {
  const [programmeFilter, setProgrammeFilter] = useState('all'); // all, antarctic_programme, arctic_programme, himalayan_programme
  const [summary, setSummary] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [programmeFilter]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumData, shpData, emgData] = await Promise.all([
        getDashboardSummary({ programme: programmeFilter }).catch(err => {
          console.error('Failed to get dashboard summary:', err);
          return null;
        }),
        getShipments().catch(err => {
          console.error('Failed to get shipments:', err);
          return [];
        }),
        getEmergencies('open').catch(err => {
          console.error('Failed to get emergencies:', err);
          return [];
        })
      ]);
      setSummary(sumData || null);
      setShipments(Array.isArray(shpData) ? shpData : []);
      setEmergencies(Array.isArray(emgData) ? emgData : []);
    } catch (err) {
      console.error('Dashboard fetchData error:', err);
      setShipments([]);
      setEmergencies([]);
      setSummary(null);
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
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Filter shipments based on programme
  const safeShipments = Array.isArray(shipments) ? shipments.filter(s => {
    if (programmeFilter === 'all') return true;
    if (programmeFilter === 'antarctic_programme') {
      const antarcticIds = ['LOC-MAI', 'LOC-BHA', 'LOC-CPT', 'LOC-GOA'];
      return antarcticIds.includes(s.origin_id) || antarcticIds.includes(s.destination_id) || antarcticIds.includes(s.current_location_id);
    }
    if (programmeFilter === 'arctic_programme') {
      return s.origin_id === 'LOC-HIM' || s.destination_id === 'LOC-HIM' || s.current_location_id === 'LOC-HIM';
    }
    if (programmeFilter === 'himalayan_programme') {
      return s.origin_id === 'LOC-HMS' || s.destination_id === 'LOC-HMS' || s.current_location_id === 'LOC-HMS';
    }
    return true;
  }) : [];

  const safeEmergencies = Array.isArray(emergencies) ? emergencies : [];

  // Recharts Data Prep
  const statusCounts = [
    { name: 'Planned', count: safeShipments.filter(s => s?.status === 'planned').length, color: '#3B82F6' },
    { name: 'In Transit', count: safeShipments.filter(s => s?.status === 'in_transit').length, color: '#06B6D4' },
    { name: 'Transfer Hub', count: safeShipments.filter(s => s?.status === 'at_transfer_point').length, color: '#F59E0B' },
    { name: 'Delivered', count: safeShipments.filter(s => s?.status === 'delivered').length, color: '#10B981' },
    { name: 'On Hold', count: safeShipments.filter(s => s?.status === 'on_hold').length, color: '#EF4444' }
  ];

  // Programme tabs config
  const programmes = [
    { id: 'all', label: 'All Programmes', icon: Globe, count: '4 Stations', desc: 'Unified Polar & Himalayan Mandate' },
    { id: 'antarctic_programme', label: 'Antarctic Programme', icon: Snowflake, count: 'Maitri & Bharati', desc: 'Southern Ocean & Ice Shelf Logistics' },
    { id: 'arctic_programme', label: 'Arctic Programme', icon: Compass, count: 'Himadri Station', desc: 'Ny-Ålesund, Svalbard (Est. 2008)' },
    { id: 'himalayan_programme', label: 'Himalayan Programme', icon: Mountain, count: 'Himansh Station', desc: 'Sutri Dhaka Glacier Base (~4080m)' }
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 bg-gradient-to-r from-sky-500/10 via-cyan-500/5 to-transparent">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg uppercase tracking-wider bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30">
              National Centre for Polar and Ocean Research (NCPOR)
            </span>
            <span className="text-xs text-slate-400">Govt. of India</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Polar & Himalayan Expedition Logistics Command
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Multi-modal tracking for Maitri, Bharati, Himadri & Himansh Research Stations
          </p>
        </div>
        <button
          onClick={() => setActiveTab('planner')}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-sky-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer self-start md:self-center"
        >
          <Box className="w-4 h-4" />
          <span>Plan New Shipment</span>
        </button>
      </div>

      {/* PHASE 3: PROGRAMME FILTER TOGGLE BAR */}
      <div className="glass-panel p-2.5 bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between px-3 py-1 mb-2 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-sky-500" />
            NCPOR Division & Programme Scope Filter
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Filters Map, Telemetry, Active Cargo & Station Roster
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {programmes.map((p) => {
            const Icon = p.icon;
            const isSelected = programmeFilter === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setProgrammeFilter(p.id)}
                className={`flex items-start space-x-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 ring-2 ring-sky-400 font-bold'
                    : 'bg-white/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60'
                }`}
              >
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-sky-500/10 text-sky-500'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold truncate">{p.label}</div>
                  <div className={`text-[11px] truncate ${isSelected ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {p.count}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
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
              Multi-Institute Roster <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
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
            <span className="text-xs text-amber-500 font-medium">Critical Threshold Alert</span>
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
              <span>Multi-Modal Expedition Route & Field Base Network</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              {programmeFilter.replace('_', ' ')}
            </span>
          </div>
          <ExpeditionMap programmeFilter={programmeFilter} />
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
                className="text-xs text-sky-500 hover:underline flex items-center cursor-pointer"
              >
                View Hub <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {safeEmergencies.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-2">No active open emergency incidents reported.</p>
            ) : (
              <div className="space-y-2">
                {safeEmergencies.map((emg) => (
                  <div key={emg?.id || Math.random()} className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-rose-500">
                      <span>{emg?.event_type || 'Incident'}</span>
                      <StatusBadge status={emg?.severity} />
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 line-clamp-2">{emg?.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recharts Cargo Distribution Chart */}
          <div className="glass-panel p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Cargo Pipeline Breakdown
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                {safeShipments.length} Total
              </span>
            </div>
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
            Expedited Cargo Movements ({programmeFilter === 'all' ? 'All Bases' : programmeFilter.replace('_', ' ')})
          </h2>
          <button
            onClick={() => setActiveTab('tracking')}
            className="text-xs text-sky-500 hover:underline flex items-center font-medium cursor-pointer"
          >
            All Tracking Cards <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        {safeShipments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No cargo movements recorded for this programme scope.
          </div>
        ) : (
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
                {safeShipments.slice(0, 5).map((shp) => (
                  <tr key={shp?.id || Math.random()} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-sky-500">{shp?.id}</td>
                    <td className="p-3 font-medium text-slate-900 dark:text-white">{shp?.description}</td>
                    <td className="p-3 capitalize">{shp?.category?.replace('_', ' ') || 'General'}</td>
                    <td className="p-3 font-mono">{shp?.weight_kg ?? 0} kg</td>
                    <td className="p-3">
                      {shp?.is_hazmat ? (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 font-bold text-[10px]">HAZMAT</span>
                      ) : (
                        <span className="text-slate-400">Standard</span>
                      )}
                    </td>
                    <td className="p-3">{shp?.current_location?.name || shp?.current_location_id || 'Unknown'}</td>
                    <td className="p-3"><StatusBadge status={shp?.status} /></td>
                    <td className="p-3 font-mono">{shp?.eta || 'TBD'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
