import React, { useState } from 'react';
import { createShipment } from '../services/api';
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
  Sparkles
} from 'lucide-react';

const locationCoordinates = {
  'LOC-GOA': { id: 'LOC-GOA', name: 'India Depot (Goa)', lat: 15.3991, lng: 73.8052 },
  'LOC-CPT': { id: 'LOC-CPT', name: 'Cape Town Staging', lat: -33.9249, lng: 18.4241 },
  'LOC-MAI': { id: 'LOC-MAI', name: 'Maitri Research Station', lat: -70.7667, lng: 11.7333 },
  'LOC-BHA': { id: 'LOC-BHA', name: 'Bharati Research Station', lat: -69.4072, lng: 76.1896 }
};

export default function ShipmentPlanner({ setActiveTab }) {
  const [formData, setFormData] = useState({
    description: '',
    category: 'scientific_equipment',
    weight_kg: 500,
    is_hazmat: false,
    origin_id: 'LOC-GOA',
    destination_id: 'LOC-BHA',
    box_label: '1 of 2',
    target_month: 1
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdShipment, setCreatedShipment] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCreatedShipment(null);

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
      setError(err.response?.data?.detail || 'Failed to compute route for cargo parameters.');
    } finally {
      setLoading(false);
    }
  };

  // Parse computed route legs for UI itinerary
  let computedLegs = [];
  if (createdShipment?.computed_route_json) {
    try {
      computedLegs = JSON.parse(createdShipment.computed_route_json);
    } catch (e) {
      console.error(e);
    }
  }

  // Construct coordinates for map preview
  let mapCoords = [];
  if (computedLegs.length > 0) {
    const orig = locationCoordinates[formData.origin_id];
    if (orig) mapCoords.push(orig);

    computedLegs.forEach(leg => {
      const dest = locationCoordinates[leg.destination_id];
      if (dest) mapCoords.push(dest);
    });
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 bg-gradient-to-r from-sky-500/10 via-cyan-500/5 to-transparent">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-500/30">
            <PackagePlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Multi-Modal Route Planning Engine
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Graph-optimized Dijkstra routing considering weight capacities, hazmat rules & seasonal weather windows
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Route Planning Form (Left Column) */}
        <div className="lg:col-span-5 glass-panel p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>Cargo & Route Parameters</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cargo Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cryogenic Nitrogen Dewars & Valves"
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
                  <option value="LOC-CPT">Cape Town Staging</option>
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
                  Box / Pack Label
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
                  Excludes air transport legs automatically (Ship-only routing)
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
                <span>Computing Dijkstra Graph Route...</span>
              ) : (
                <>
                  <Route className="w-4 h-4" />
                  <span>Compute & Generate Route</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Computed Itinerary & Route Preview (Right Column) */}
        <div className="lg:col-span-7 space-y-6">
          
          {!createdShipment ? (
            <div className="glass-panel p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center mx-auto">
                <Route className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ready for Optimization</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Fill in cargo description and specs on the left to compute the optimal multi-leg transport itinerary.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Success Banner */}
              <div className="glass-panel p-5 border-l-4 border-l-emerald-500 space-y-3 bg-emerald-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-500 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>System-Computed Optimal Route Generated</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-sky-500">{createdShipment.id}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Total Duration:</span>
                    <div className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                      {createdShipment.eta ? 'Calculated' : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Target Station:</span>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {locationCoordinates[createdShipment.destination_id]?.name}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">ETA Date:</span>
                    <div className="font-bold text-emerald-500 font-mono text-sm">{createdShipment.eta}</div>
                  </div>
                </div>
              </div>

              {/* Constraint Warnings Notice if Hazmat or Heavy */}
              {formData.is_hazmat && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Hazmat Constraint Enforced</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Air transport legs automatically excluded. Cargo diverted exclusively to heavy maritime vessels.
                  </p>
                </div>
              )}

              {/* Step-by-Step Itinerary Cards */}
              <div className="glass-panel p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Step-by-Step Multi-Modal Itinerary
                </h3>

                <div className="space-y-3">
                  {computedLegs.map((leg, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 font-bold text-xs flex items-center justify-center">
                          L{idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                            <span>{locationCoordinates[leg.origin_id]?.name || leg.origin_id}</span>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                            <span>{locationCoordinates[leg.destination_id]?.name || leg.destination_id}</span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 capitalize">
                            Mode: <span className="font-medium text-sky-500">{leg.mode.replace('_', ' ')}</span> • Duration: {leg.duration_days} days
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800">
                        {leg.duration_days} Days
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setActiveTab('tracking')}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/20"
                >
                  View in Shipment Tracker Cards
                </button>

              </div>

              {/* Map Preview */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Route Map Visualizer</h3>
                <ExpeditionMap activeRouteCoordinates={mapCoords} />
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
