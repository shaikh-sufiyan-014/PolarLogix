import React, { useEffect, useState } from 'react';
import { getInventory, saveInventoryItem } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  Boxes,
  AlertTriangle,
  Plus,
  Building2,
  CheckCircle2,
  X,
  RefreshCw
} from 'lucide-react';

const locations = [
  { id: 'LOC-BHA', name: 'Bharati Station', tag: 'Larsemann Hills' },
  { id: 'LOC-MAI', name: 'Maitri Station', tag: 'Prydz Bay / Schirmacher' },
  { id: 'LOC-CPT', name: 'Cape Town Transfer', tag: 'South Africa Staging' },
  { id: 'LOC-GOA', name: 'India Depot', tag: 'NCPOR Goa Base' }
];

export default function InventoryDashboard() {
  const [activeLocationId, setActiveLocationId] = useState('LOC-BHA');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newItem, setNewItem] = useState({
    item_name: '',
    category: 'fuel',
    quantity: 1000,
    unit: 'liters',
    minimum_threshold: 500
  });

  useEffect(() => {
    fetchInventory();
  }, [activeLocationId]);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInventory(activeLocationId);
      setInventory(data);
    } catch (err) {
      console.error(err);
      setError("Unable to reach PolarLogix backend server on port 8008. Please check backend status.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      await saveInventoryItem(activeLocationId, {
        location_id: activeLocationId,
        item_name: newItem.item_name,
        category: newItem.category,
        quantity: parseFloat(newItem.quantity),
        unit: newItem.unit,
        minimum_threshold: parseFloat(newItem.minimum_threshold)
      });
      setShowAddModal(false);
      setNewItem({ item_name: '', category: 'fuel', quantity: 1000, unit: 'liters', minimum_threshold: 500 });
      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const activeLocInfo = locations.find(l => l.id === activeLocationId);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-emerald-500/10 via-sky-500/5 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Multi-Station Live Inventory Depots
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time stock monitoring, fuel reserves & automated low-supply alerts across bases
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stock Item</span>
        </button>
      </div>

      {/* Error Alert Box (No Silent Fallback) */}
      {error && (
        <div className="p-4 glass-panel border-l-4 border-l-rose-500 bg-rose-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-rose-500">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-sm">Inventory Fetch Error</h3>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchInventory}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Location Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {locations.map((loc) => {
          const isActive = activeLocationId === loc.id;
          return (
            <button
              key={loc.id}
              onClick={() => setActiveLocationId(loc.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                  : 'glass-panel text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{loc.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Location Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Managing supplies for <strong>{activeLocInfo?.name}</strong> ({activeLocInfo?.tag})</span>
        <span className="font-mono">{inventory.length} Recorded Items</span>
      </div>

      {/* Inventory Table */}
      <div className="glass-panel p-5 space-y-4">
        {loading ? (
          <LoadingSkeleton type="list" count={5} />
        ) : inventory.length === 0 && !error ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No stock inventory items recorded for this station depot.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800/60 uppercase font-semibold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-3.5 rounded-l-lg">Item Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Current Stock</th>
                  <th className="p-3.5">Minimum Threshold</th>
                  <th className="p-3.5 rounded-r-lg">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {inventory.map((item) => {
                  const isLow = item.quantity <= item.minimum_threshold;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white text-sm">
                        {item.item_name}
                      </td>
                      <td className="p-3.5 capitalize font-medium text-slate-500 dark:text-slate-400">
                        {item.category.replace('_', ' ')}
                      </td>
                      <td className="p-3.5 font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                        {item.quantity.toLocaleString()} {item.unit}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">
                        {item.minimum_threshold.toLocaleString()} {item.unit}
                      </td>
                      <td className="p-3.5">
                        {isLow ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Low Stock Alert
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Optimum Level
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Stock Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full p-6 space-y-4 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Add Inventory Item to {activeLocInfo?.name}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={newItem.item_name}
                  onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="fuel">Fuel & Oils</option>
                  <option value="food">Food & Rations</option>
                  <option value="medical">Medical Supplies</option>
                  <option value="spare_parts">Spare Parts</option>
                  <option value="scientific_equipment">Scientific Consumables</option>
                  <option value="clothing">Polar Clothing</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Minimum Alert Threshold</label>
                <input
                  type="number"
                  required
                  value={newItem.minimum_threshold}
                  onChange={(e) => setNewItem({ ...newItem, minimum_threshold: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/20"
              >
                Save Inventory Item
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
