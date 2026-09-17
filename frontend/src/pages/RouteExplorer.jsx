import React, { useEffect, useState } from 'react';
import { getTransportLegs, getLocations } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  Route,
  Ship,
  Plane,
  Calendar,
  Scale,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Clock,
  Compass,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const monthNames = {
  1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
  7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
};

const modeIcons = {
  ship: Ship,
  aircraft: Plane,
  cargo_flight: Plane,
  helicopter: Compass
};

export default function RouteExplorer() {
  const [legs, setLegs] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [legData, locData] = await Promise.all([
        getTransportLegs().catch(err => {
          console.error('getTransportLegs error:', err);
          return [];
        }),
        getLocations().catch(err => {
          console.error('getLocations error:', err);
          return [];
        })
      ]);
      setLegs(Array.isArray(legData) ? legData : []);
      setLocations(Array.isArray(locData) ? locData : []);
    } catch (err) {
      console.error('RouteExplorer fetchNetworkData error:', err);
      setLegs([]);
      setLocations([]);
      setError("Unable to reach PolarLogix network routing service. Please verify backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const safeLegs = Array.isArray(legs) ? legs : [];
  const safeLocations = Array.isArray(locations) ? locations : [];

  const getLocationName = (id) => {
    const loc = safeLocations.find(l => l?.id === id);
    return loc ? loc.name : id;
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 bg-gradient-to-r from-sky-500/10 via-cyan-500/5 to-transparent">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-500/30">
            <Route className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Antarctic Transport Network Explorer
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Interactive constraint matrix: weight limits, hazmat restrictions, durations & seasonal weather windows
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="p-4 glass-panel border-l-4 border-l-rose-500 bg-rose-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-rose-500">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-sm">Transport Network Query Error</h3>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchNetworkData}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton type="cards" count={4} />
      ) : safeLegs.length === 0 && !error ? (
        <div className="glass-panel p-12 text-center text-slate-500 dark:text-slate-400">
          No transport legs or routes currently registered.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {safeLegs.map((leg) => {
            const Icon = modeIcons[leg?.mode] || Route;
            let availableMonths = [];
            if (Array.isArray(leg?.available_months)) {
              availableMonths = leg.available_months;
            } else if (typeof leg?.available_months === 'string') {
              try { availableMonths = JSON.parse(leg.available_months); } catch (e) {}
            }
            if (!Array.isArray(availableMonths)) availableMonths = [];

            return (
              <div
                key={leg?.id || Math.random()}
                className="glass-panel p-5 space-y-4 hover:border-sky-500/50 transition-all flex flex-col justify-between"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-sky-500">{leg?.id}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {leg?.mode ? leg.mode.replace('_', ' ') : 'Leg'}
                  </span>
                </div>

                {/* Route Path */}
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Leg Route:</div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>{getLocationName(leg?.origin_id)}</span>
                    <ArrowRight className="w-4 h-4 text-sky-500 flex-shrink-0" />
                    <span>{getLocationName(leg?.destination_id)}</span>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> Transit Duration
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{leg?.duration_days ?? 0} Days</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 flex items-center">
                      <Scale className="w-3 h-3 mr-1" /> Capacity Limit
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{(leg?.capacity_kg ?? 0).toLocaleString()} kg</span>
                  </div>

                  {leg?.distance_nm && (
                    <div className="space-y-0.5 col-span-2 pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Nautical Distance:</span>
                      <span className="font-mono font-bold text-sky-500">{leg.distance_nm.toLocaleString()} nm</span>
                    </div>
                  )}

                  {leg?.average_speed_knots && (
                    <div className="space-y-0.5 col-span-2 flex items-center justify-between">
                      <span className="text-slate-400">Vessel Cruising Speed:</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{leg.average_speed_knots} knots</span>
                    </div>
                  )}
                </div>

                {/* Hazmat Rule */}
                <div className="flex items-center justify-between text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Hazmat Allowance:</span>
                  {leg?.hazmat_allowed ? (
                    <span className="font-bold text-emerald-500 flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Allowed
                    </span>
                  ) : (
                    <span className="font-bold text-rose-500 flex items-center">
                      <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Excluded (Air)
                    </span>
                  )}
                </div>

                {/* Seasonal Months Calendar Grid */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> Operational Months:</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1 text-[10px] font-mono text-center">
                    {[11, 12, 1, 2, 3, 4].map((m) => {
                      const isAvailable = availableMonths.includes(m);
                      return (
                        <span
                          key={m}
                          className={`py-1 rounded font-bold ${
                            isAvailable
                              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                              : 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 line-through'
                          }`}
                        >
                          {monthNames[m]}
                        </span>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
