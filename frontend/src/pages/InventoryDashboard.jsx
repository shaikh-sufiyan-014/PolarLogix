import React, { useEffect, useState } from 'react';
import { getInventory, updateInventoryItem, deleteInventoryItem } from '../services/api';
import { useConnectivity } from '../context/ConnectivityContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  Boxes,
  AlertTriangle,
  Plus,
  Building2,
  CheckCircle2,
  X,
  RefreshCw,
  Database,
  Pencil,
  Trash2,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';

const locations = [
  { id: 'LOC-BHA', name: 'Bharati Station', tag: 'Larsemann Hills (Antarctica)' },
  { id: 'LOC-MAI', name: 'Maitri Station', tag: 'Schirmacher Oasis (Antarctica)' },
  { id: 'LOC-HIM', name: 'Himadri Station', tag: 'Ny-Ålesund, Svalbard (Arctic)' },
  { id: 'LOC-HMS', name: 'Himansh Base', tag: 'Sutri Dhaka (Himalayas)' },
  { id: 'LOC-CPT', name: 'Cape Town Transfer', tag: 'South Africa Staging' },
  { id: 'LOC-GOA', name: 'India Depot', tag: 'NCPOR Goa Base' }
];

export default function InventoryDashboard() {
  const { submitInventoryItem } = useConnectivity();
  const [activeLocationId, setActiveLocationId] = useState('LOC-BHA');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Inline edit state
  const [editingItemId, setEditingItemId] = useState(null);
  const [editForm, setEditForm] = useState({ quantity: '', minimum_threshold: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation state
  const [deleteTargetItem, setDeleteTargetItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [newItem, setNewItem] = useState({
    item_name: '',
    category: 'fuel',
    quantity: 1000,
    unit: 'liters',
    minimum_threshold: 500
  });

  useEffect(() => {
    fetchInventory();
    setEditingItemId(null);
    setDeleteTargetItem(null);
    setActionError(null);
  }, [activeLocationId]);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInventory(activeLocationId);
      setInventory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('InventoryDashboard fetchInventory error:', err);
      setInventory([]);
      setError("Operating from local IndexedDB cache.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      await submitInventoryItem(activeLocationId, {
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
      console.error('Failed to save item:', err);
    }
  };

  const handleStartEdit = (item) => {
    setEditingItemId(item.id);
    setEditForm({
      quantity: item.quantity !== undefined ? item.quantity : '',
      minimum_threshold: item.minimum_threshold !== undefined ? item.minimum_threshold : ''
    });
    setActionError(null);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditForm({ quantity: '', minimum_threshold: '' });
    setActionError(null);
  };

  const handleSaveEdit = async (itemId) => {
    const qty = parseFloat(editForm.quantity);
    const minThresh = parseFloat(editForm.minimum_threshold);

    if (isNaN(qty) || qty < 0) {
      setActionError("Please enter a valid non-negative quantity.");
      return;
    }
    if (isNaN(minThresh) || minThresh < 0) {
      setActionError("Please enter a valid non-negative minimum threshold.");
      return;
    }

    setIsSaving(true);
    setActionError(null);
    try {
      const updated = await updateInventoryItem(itemId, {
        quantity: qty,
        minimum_threshold: minThresh
      });
      
      // Update row immediately without full page reload
      setInventory((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, ...updated, quantity: qty, minimum_threshold: minThresh }
            : item
        )
      );
      setEditingItemId(null);
    } catch (err) {
      console.error('Failed to update inventory item:', err);
      setActionError(err.response?.data?.detail || "Failed to update inventory item. Please check permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetItem) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      await deleteInventoryItem(deleteTargetItem.id);
      // Remove row immediately without full page reload
      setInventory((prev) => prev.filter((item) => item.id !== deleteTargetItem.id));
      setDeleteTargetItem(null);
    } catch (err) {
      console.error('Failed to delete inventory item:', err);
      setActionError(err.response?.data?.detail || "Failed to delete inventory item. Please check permissions.");
    } finally {
      setIsDeleting(false);
    }
  };

  const safeLocations = Array.isArray(locations) ? locations : [];
  const activeLocInfo = safeLocations.find(l => l.id === activeLocationId);
  const safeInventory = Array.isArray(inventory) ? inventory : [];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-emerald-500/10 via-sky-500/5 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Multi-Station Live Inventory Depots
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time stock monitoring, fuel reserves & automated low-supply alerts across bases
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stock Item</span>
        </button>
      </div>

      {/* Action Error Alert */}
      {actionError && (
        <div className="p-3.5 glass-panel border-l-4 border-l-rose-500 bg-rose-500/10 flex items-center justify-between gap-3 text-rose-600 text-xs font-semibold rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-rose-400 hover:text-rose-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Location Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {locations.map((loc) => {
          const isActive = activeLocationId === loc.id;
          return (
            <button
              key={loc.id}
              onClick={() => setActiveLocationId(loc.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                  : 'glass-panel text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{loc.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Location Info */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Managing supplies for <strong>{activeLocInfo?.name}</strong> ({activeLocInfo?.tag})</span>
        <span className="font-mono">{safeInventory.length} Recorded Items</span>
      </div>

      {/* Inventory Table */}
      <div className="glass-panel p-5 space-y-4">
        {loading ? (
          <LoadingSkeleton type="list" count={5} />
        ) : safeInventory.length === 0 && !error ? (
          <div className="p-8 text-center text-slate-500">
            No stock inventory items recorded for this station depot.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 uppercase font-semibold text-slate-500">
                <tr>
                  <th className="p-3.5 rounded-l-lg">Item Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Current Stock</th>
                  <th className="p-3.5">Minimum Threshold</th>
                  <th className="p-3.5">Stock Status</th>
                  <th className="p-3.5 rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {safeInventory.map((item) => {
                  const isEditing = editingItemId === item.id;
                  const qty = typeof item?.quantity === 'number' ? item.quantity : parseFloat(item?.quantity || 0);
                  const minThresh = typeof item?.minimum_threshold === 'number' ? item.minimum_threshold : parseFloat(item?.minimum_threshold || 0);
                  
                  // Live preview values if editing
                  const displayQty = isEditing ? parseFloat(editForm.quantity || 0) : qty;
                  const displayMinThresh = isEditing ? parseFloat(editForm.minimum_threshold || 0) : minThresh;
                  const isLow = displayQty <= displayMinThresh;

                  return (
                    <tr
                      key={item?.id || Math.random()}
                      className={`transition-colors ${
                        isEditing ? 'bg-sky-50/60 border-l-4 border-l-sky-500' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3.5 font-bold text-slate-900 text-sm">
                        {item?.item_name}
                      </td>
                      <td className="p-3.5 capitalize font-medium text-slate-500">
                        {item?.category?.replace('_', ' ') || 'General'}
                      </td>
                      
                      {/* Current Stock Cell */}
                      <td className="p-3.5 font-mono text-sm font-bold text-slate-800">
                        {isEditing ? (
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-sky-700 block uppercase tracking-wider">
                              Update current stock:
                            </label>
                            <div className="flex items-center space-x-1.5">
                              <input
                                type="number"
                                step="any"
                                min="0"
                                value={editForm.quantity}
                                onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                                className="w-28 px-2.5 py-1.5 text-xs font-mono font-bold bg-white border-2 border-sky-400 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                                placeholder="Stock quantity"
                                autoFocus
                              />
                              <span className="text-slate-500 font-mono text-xs">{item?.unit || ''}</span>
                            </div>
                          </div>
                        ) : (
                          <span>{qty.toLocaleString()} {item?.unit || ''}</span>
                        )}
                      </td>

                      {/* Minimum Threshold Cell */}
                      <td className="p-3.5 font-mono text-slate-500">
                        {isEditing ? (
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-600 block uppercase tracking-wider">
                              Min. threshold:
                            </label>
                            <div className="flex items-center space-x-1.5">
                              <input
                                type="number"
                                step="any"
                                min="0"
                                value={editForm.minimum_threshold}
                                onChange={(e) => setEditForm({ ...editForm, minimum_threshold: e.target.value })}
                                className="w-28 px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                                placeholder="Threshold"
                              />
                              <span className="text-slate-400 font-mono text-xs">{item?.unit || ''}</span>
                            </div>
                          </div>
                        ) : (
                          <span>{minThresh.toLocaleString()} {item?.unit || ''}</span>
                        )}
                      </td>

                      {/* Stock Status Badge */}
                      <td className="p-3.5">
                        {isLow ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Low Stock Alert
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Optimum Level
                          </span>
                        )}
                      </td>

                      {/* Action Buttons Column */}
                      <td className="p-3.5 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleSaveEdit(item.id)}
                              disabled={isSaving}
                              className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-sm transition-all flex items-center gap-1 text-xs font-bold disabled:opacity-50 cursor-pointer"
                              title="Save Changes"
                            >
                              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              <span className="hidden sm:inline pr-1">Save</span>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isSaving}
                              className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer"
                              title="Cancel Edit"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline pr-1">Cancel</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Stock Quantity & Threshold"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTargetItem(item)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Inventory Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* Delete Confirmation Modal */}
      {deleteTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel max-w-md w-full p-6 space-y-4 bg-white border-slate-300 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => !isDeleting && setDeleteTargetItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Delete Inventory Item?
                </h3>
                <p className="text-xs text-slate-600">
                  Delete this inventory item? This cannot be undone.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-800">{deleteTargetItem.item_name}</div>
              <div className="text-slate-500 flex items-center justify-between">
                <span>Category: <strong className="capitalize">{deleteTargetItem.category?.replace('_', ' ')}</strong></span>
                <span>Current Stock: <strong>{deleteTargetItem.quantity} {deleteTargetItem.unit}</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetItem(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-lg shadow-rose-500/20 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete Stock Item</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Stock Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full p-6 space-y-4 bg-white border-slate-300 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">
              Add Inventory Item to {activeLocInfo?.name}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={newItem.item_name}
                  onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Alert Threshold</label>
                <input
                  type="number"
                  required
                  value={newItem.minimum_threshold}
                  onChange={(e) => setNewItem({ ...newItem, minimum_threshold: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
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

