import React, { useEffect, useState } from 'react';
import { getPersonnel, createPersonnel } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  Users,
  UserPlus,
  Calendar,
  Sun,
  Snowflake,
  Filter,
  X,
  Clock
} from 'lucide-react';

export default function PersonnelManager() {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newPerson, setNewPerson] = useState({
    name: '',
    role: 'Glaciologist',
    assigned_station: 'Bharati Station',
    season_type: 'summer',
    deployment_start: '2025-11-15',
    deployment_end: '2026-03-30',
    current_status: 'deployed'
  });

  useEffect(() => {
    fetchPersonnel();
  }, [selectedStation, selectedSeason]);

  const fetchPersonnel = async () => {
    setLoading(true);
    try {
      const data = await getPersonnel({
        station: selectedStation || undefined,
        season: selectedSeason || undefined
      });
      setPersonnel(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPerson = async (e) => {
    e.preventDefault();
    try {
      await createPersonnel(newPerson);
      setShowAddModal(false);
      setNewPerson({
        name: '',
        role: 'Glaciologist',
        assigned_station: 'Bharati Station',
        season_type: 'summer',
        deployment_start: '2025-11-15',
        deployment_end: '2026-03-30',
        current_status: 'deployed'
      });
      fetchPersonnel();
    } catch (err) {
      console.error(err);
    }
  };

  const summerCount = personnel.filter(p => p.season_type === 'summer').length;
  const winterCount = personnel.filter(p => p.season_type === 'winter').length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Station Personnel Deployment Roster
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Tracking summer & winter team rotations, station capacities and expedition handovers
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-sky-500/30 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Deploy Expedition Member</span>
        </button>
      </div>

      {/* Season Timeline Visualizer Widget */}
      <div className="glass-panel p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-sky-500" />
          <span>Annual Expedition Season Timeline & Handover Cycle</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-500 text-sm flex items-center space-x-1.5">
                <Sun className="w-4 h-4" />
                <span>Summer Team Window (Nov - Mar)</span>
              </span>
              <span className="font-mono text-xs font-bold text-amber-500">{summerCount} Members</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Peak scientific fieldwork, aerial logistics & heavy supply replenishment.
            </p>
            <div className="w-full h-2 rounded-full bg-amber-500/20 overflow-hidden">
              <div className="h-full bg-amber-400 w-3/4 rounded-full"></div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-sky-500/20 bg-sky-500/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-400 text-sm flex items-center space-x-1.5">
                <Snowflake className="w-4 h-4" />
                <span>Wintering Team Window (Apr - Oct)</span>
              </span>
              <span className="font-mono text-xs font-bold text-sky-400">{winterCount} Members</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Skeleton wintering crew operating generators, meteorology & vital station life support.
            </p>
            <div className="w-full h-2 rounded-full bg-sky-500/20 overflow-hidden">
              <div className="h-full bg-sky-500 w-1/2 rounded-full"></div>
            </div>
          </div>

        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="">All Stations</option>
            <option value="Bharati Station">Bharati Station</option>
            <option value="Maitri Station">Maitri Station</option>
            <option value="Cape Town Staging">Cape Town Staging</option>
          </select>

          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="">All Seasons</option>
            <option value="summer">Summer Crew</option>
            <option value="winter">Wintering Crew</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="glass-panel p-5 space-y-4">
        {loading ? (
          <LoadingSkeleton type="list" count={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800/60 uppercase font-semibold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-3.5 rounded-l-lg">ID</th>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Role / Speciality</th>
                  <th className="p-3.5">Assigned Station</th>
                  <th className="p-3.5">Season</th>
                  <th className="p-3.5">Deployment Dates</th>
                  <th className="p-3.5 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {personnel.map((per) => (
                  <tr key={per.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono text-sky-500 font-bold">{per.id}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white text-sm">{per.name}</td>
                    <td className="p-3.5 font-medium">{per.role}</td>
                    <td className="p-3.5">{per.assigned_station}</td>
                    <td className="p-3.5 capitalize">
                      {per.season_type === 'summer' ? (
                        <span className="text-amber-500 font-semibold flex items-center"><Sun className="w-3.5 h-3.5 mr-1" /> Summer</span>
                      ) : (
                        <span className="text-sky-400 font-semibold flex items-center"><Snowflake className="w-3.5 h-3.5 mr-1" /> Winter</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">
                      {per.deployment_start} → {per.deployment_end}
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={per.current_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Personnel Modal */}
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
              Deploy Expedition Member
            </h3>

            <form onSubmit={handleAddPerson} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role / Designation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chief Meteorological Scientist"
                  value={newPerson.role}
                  onChange={(e) => setNewPerson({ ...newPerson, role: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Station</label>
                  <select
                    value={newPerson.assigned_station}
                    onChange={(e) => setNewPerson({ ...newPerson, assigned_station: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Bharati Station">Bharati Station</option>
                    <option value="Maitri Station">Maitri Station</option>
                    <option value="Cape Town Staging">Cape Town Staging</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Season</label>
                  <select
                    value={newPerson.season_type}
                    onChange={(e) => setNewPerson({ ...newPerson, season_type: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="summer">Summer Crew</option>
                    <option value="winter">Wintering Crew</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newPerson.deployment_start}
                    onChange={(e) => setNewPerson({ ...newPerson, deployment_start: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newPerson.deployment_end}
                    onChange={(e) => setNewPerson({ ...newPerson, deployment_end: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-sky-500/20"
              >
                Save Personnel Record
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
