import React, { useState } from 'react';
import { createShipment, previewRoute } from '../services/api';
import ExpeditionMap from '../components/Map/ExpeditionMap';
import StatusBadge from '../components/StatusBadge';
import {
  PackagePlus,
  Route,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Scale,
  ShieldAlert,
  Ship,
  Plane,
  ArrowRight,
  Sparkles,
  Waves,
  Wind,
  ShieldCheck,
  Compass,
  Navigation,
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';

const locationCoordinates = {
  'LOC-GOA': { id: 'LOC-GOA', name: 'India Depot (Goa)', lat: 15.3991, lng: 73.8052 },
  'LOC-CPT': { id: 'LOC-CPT', name: 'Cape Town Transfer Point', lat: -33.9249, lng: 18.4241 },
  'LOC-MAI': { id: 'LOC-MAI', name: 'Maitri Research Station', lat: -70.7667, lng: 11.7333 },
  'LOC-BHA': { id: 'LOC-BHA', name: 'Bharati Research Station', lat: -69.4068, lng: 76.1953 },
  'LOC-HIM': { id: 'LOC-HIM', name: 'Himadri Arctic Station', lat: 78.9235, lng: 11.9331 },
  'LOC-HMS': { id: 'LOC-HMS', name: 'Himansh Himalayan Station', lat: 32.4485, lng: 77.6155 }
};

export default function ShipmentPlanner({ setActiveTab }) {
  const [formData, setFormData] = useState({
    description: 'Autonomous Oceanographic Glider & CTD Sensors',
    category: 'scientific_equipment',
    weight_kg: 750,
    is_hazmat: false,
    origin_id: 'LOC-GOA',
    destination_id: 'LOC-BHA',
    box_label: '1 of 2',
    target_month: 1
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routePlan, setRoutePlan] = useState(null);
  const [createdShipment, setCreatedShipment] = useState(null);

  // 1. Calculate & Preview Route with Marine Waypoints and Live Weather
  const handleCalculateRoute = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setCreatedShipment(null);

    try {
      const result = await previewRoute({
        description: formData.description,
        category: formData.category,
        weight_kg: parseFloat(formData.weight_kg),
        is_hazmat: formData.is_hazmat,
        origin_id: formData.origin_id,
        destination_id: formData.destination_id,
        box_label: formData.box_label,
        target_month: parseInt(formData.target_month)
      });
      setRoutePlan(result);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to compute route for specified parameters.');
      setRoutePlan(null);
    } finally {
      setLoading(false);
    }
  };

  // 2. Commit & Dispatch Shipment
  const handleCreateShipment = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await createShipment({
        description: formData.description,
        category: formData.category,
        weight_kg: parseFloat(formData.weight_kg),
        is_hazmat: formData.is_hazmat,
        origin_id: formData.origin_id,
        destination_id: formData.destination_id,
        box_label: formData.box_label,
        target_month: parseInt(formData.target_month)
      });
      setCreatedShipment(result);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to save shipment.');
    } finally {
      setLoading(false);
    }
  };

  const computedLegs = routePlan?.legs || [];
  const waypoints = routePlan?.waypoints || [];
  const weatherAdvisory = routePlan?.weather_advisory || null;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 bg-gradient-to-r from-sky-500/10 via-cyan-500/5 to-transparent">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-500/30">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Marine Waypoint & Weather-Aware Route Planner
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Searoute nautical navigation engine avoiding landmasses with live Open-Meteo marine weather verification
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Route Planning Form (Left Column) */}
        <div className="lg:col-span-5 glass-panel p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Compass className="w-4 h-4 text-sky-500" />
            <span>Cargo & Voyage Parameters</span>
          </h2>

          <form onSubmit={handleCalculateRoute} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cargo Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Autonomous Oceanographic Glider"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="scientific_equipment">Scientific Equipment</option>
                  <option value="food">Food Rations</option>
                  <option value="fuel">Fuel & Lubricants</option>
                  <option value="spare_parts">Spare Parts</option>
                  <option value="hazmat">Hazmat / Chemicals</option>
                  <option value="personal_effects">Personal Effects</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="50000"
                  value={formData.weight_kg}
                  onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Origin Depot
                </label>
                <select
                  value={formData.origin_id}
                  onChange={(e) => setFormData({ ...formData, origin_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="LOC-GOA">India Depot (Goa)</option>
                  <option value="LOC-CPT">Cape Town Transfer Point</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Destination Station
                </label>
                <select
                  value={formData.destination_id}
                  onChange={(e) => setFormData({ ...formData, destination_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="LOC-BHA">Bharati Research Station</option>
                  <option value="LOC-MAI">Maitri Research Station</option>
                  <option value="LOC-CPT">Cape Town Transfer Point</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Box / Manifest Label
                </label>
                <input
                  type="text"
                  value={formData.box_label}
                  onChange={(e) => setFormData({ ...formData, box_label: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Season Month
                </label>
                <select
                  value={formData.target_month}
                  onChange={(e) => setFormData({ ...formData, target_month: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value={1}>January (Summer Ops)</option>
                  <option value={2}>February (Summer Ops)</option>
                  <option value={3}>March (Late Summer)</option>
                  <option value={11}>November (Early Summer)</option>
                  <option value={12}>December (Peak Summer)</option>
                </select>
              </div>
            </div>

            {/* Hazmat Toggle Switch */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>Hazardous Cargo (Hazmat)</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Restricts voyage to heavy maritime vessels (air transport excluded)
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.is_hazmat}
                onChange={(e) => setFormData({ ...formData, is_hazmat: e.target.checked })}
                className="w-5 h-5 text-sky-500 rounded focus:ring-sky-500 cursor-pointer"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !formData.description}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-lg shadow-sky-500/30 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Calculating Searoute Waypoints & Weather...</span>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  <span>Compute Marine Route & Check Weather</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Computed Itinerary & Route Preview (Right Column) */}
        <div className="lg:col-span-7 space-y-6">
          
          {!routePlan ? (
            <div className="glass-panel p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center mx-auto">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Maritime Routing Engine Ready</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Select cargo specifications and stations on the left to compute realistic marine waypoints and check live weather along the sea route.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Route Summary Card */}
              <div className="glass-panel p-5 border-l-4 border-l-sky-500 space-y-3 bg-sky-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sky-500 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Realistic Marine Waypoint Route Computed</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {waypoints.length} Total Waypoints
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Total Duration:</span>
                    <div className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                      {routePlan.total_duration_days} Days
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Target Station:</span>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {locationCoordinates[routePlan.destination_id]?.name || routePlan.destination_id}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Marine Engine:</span>
                    <div className="font-bold text-sky-500 font-mono text-sm">Searoute v1.6</div>
                  </div>
                </div>
              </div>

              {/* PHASE 3: ALGORITHMIC WEATHER THRESHOLD CHECK (EXACT LABELING) */}
              {weatherAdvisory && (
                <div className="glass-panel p-5 space-y-4 border border-slate-200 dark:border-slate-800 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <Waves className="w-4 h-4 text-sky-500" />
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          Algorithmic Weather Threshold Check using Live Marine Data
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Deterministic threshold check querying live Open-Meteo Marine (wave height) & Forecast API (wind in knots)
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 self-start ${
                      weatherAdvisory.adverse_weather_detected
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>
                      {weatherAdvisory.adverse_weather_detected ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Advisory Warning</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Safe Marine Windows</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Advisory Alert Banner if Conditions Exceed Threshold */}
                  {weatherAdvisory.adverse_weather_detected && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 space-y-1.5">
                      <div className="font-bold flex items-center space-x-1.5">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>Adverse Marine Conditions Exceed Safety Thresholds</span>
                      </div>
                      <div className="space-y-1">
                        {weatherAdvisory.warnings.map((w, i) => (
                          <div key={i} className="pl-5">• {w}</div>
                        ))}
                      </div>
                      {weatherAdvisory.suggested_action && (
                        <div className="pt-2 border-t border-amber-500/20 font-medium text-slate-800 dark:text-slate-200">
                          <span className="font-bold text-amber-500">Suggested Action: </span>
                          {weatherAdvisory.suggested_action}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Waypoint Live Data Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {weatherAdvisory.waypoints.map((wp, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                          wp.status === 'adverse'
                            ? 'bg-amber-500/5 border-amber-500/30'
                            : wp.status === 'unavailable'
                            ? 'bg-slate-500/5 border-slate-500/30'
                            : 'bg-emerald-500/5 border-emerald-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white truncate">{wp.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            wp.status === 'adverse'
                              ? 'bg-amber-500/10 text-amber-500'
                              : wp.status === 'unavailable'
                              ? 'bg-slate-500/10 text-slate-400'
                              : 'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {wp.status}
                          </span>
                        </div>

                        <div className="space-y-1 text-slate-600 dark:text-slate-300">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center text-slate-400">
                              <Waves className="w-3 h-3 mr-1" /> Wave Height:
                            </span>
                            <span className="font-mono font-bold">
                              {wp.wave_height_m !== null ? `${wp.wave_height_m} m` : 'N/A'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="flex items-center text-slate-400">
                              <Wind className="w-3 h-3 mr-1" /> Wind Speed:
                            </span>
                            <span className="font-mono font-bold">
                              {wp.wind_speed_knots !== null ? `${wp.wind_speed_knots} kt` : 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800 line-clamp-2">
                          {wp.details}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <Info className="w-3 h-3 flex-shrink-0" />
                    <span>
                      Safe thresholds configured in weather_thresholds.json: Max Wave {weatherAdvisory.thresholds?.max_safe_wave_height_m}m, Max Wind {weatherAdvisory.thresholds?.max_safe_wind_speed_knots} kt.
                    </span>
                  </div>
                </div>
              )}

              {/* Step-by-Step Multi-Modal Itinerary */}
              <div className="glass-panel p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Route className="w-4 h-4 text-sky-500" />
                  <span>Step-by-Step Multi-Modal Itinerary (Realistic Durations)</span>
                </h3>

                <div className="space-y-3">
                  {computedLegs.map((leg, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          L{idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                            <span>{locationCoordinates[leg?.origin_id]?.name || leg?.origin_id}</span>
                            <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span>{locationCoordinates[leg?.destination_id]?.name || leg?.destination_id}</span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap gap-2">
                            <span className="capitalize">Mode: <b className="text-sky-500">{leg?.mode ? leg.mode.replace('_', ' ') : 'Leg'}</b></span>
                            {leg.distance_nm && <span>• Distance: <b className="font-mono text-slate-700 dark:text-slate-300">{leg.distance_nm.toLocaleString()} nm</b></span>}
                            {leg.average_speed_knots && <span>• Speed: <b className="font-mono text-slate-700 dark:text-slate-300">{leg.average_speed_knots} kt</b></span>}
                          </div>
                        </div>
                      </div>

                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 self-start sm:self-center">
                        {leg?.duration_days ?? 0} Days Transit
                      </span>
                    </div>
                  ))}
                </div>

                {!createdShipment ? (
                  <button
                    onClick={handleCreateShipment}
                    disabled={loading}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
                  >
                    <PackagePlus className="w-4 h-4" />
                    <span>Confirm & Create Cargo Shipment Record</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Shipment Created: {createdShipment.id}</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('tracking')}
                      className="px-3 py-1.5 bg-emerald-500 text-white font-bold rounded-lg text-xs hover:bg-emerald-600 transition-colors"
                    >
                      View in Tracker →
                    </button>
                  </div>
                )}

              </div>

              {/* Map Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Real Curved Marine Polyline Map Visualizer
                  </h3>
                  <span className="text-xs text-sky-500 font-medium">Avoiding Landmasses</span>
                </div>
                <ExpeditionMap
                  waypoints={waypoints}
                  weatherAdvisory={weatherAdvisory}
                  legs={computedLegs}
                />
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
