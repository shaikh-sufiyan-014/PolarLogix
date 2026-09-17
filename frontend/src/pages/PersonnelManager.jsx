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
  Clock,
  AlertTriangle,
  RefreshCw,
  Building2,
  Briefcase,
  Award,
  Compass,
  CheckCircle2
} from 'lucide-react';

const categoryLabels = {
  permanent_staff: { label: 'Permanent Staff', color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' },
  project_scientist: { label: 'Project Scientist', color: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' },
  contract_specialist: { label: 'Contract Specialist', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  visiting_researcher: { label: 'Visiting Researcher', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' }
};

const commonInstitutions = [
  'NCPOR',
  'IIT Bombay',
  'CSIR-NIO',
  'GSI',
  'AIIMS New Delhi',
  'ISRO-SAC',
  'IISc Bangalore',
  'IIT Kharagpur',
  'Wadia Institute of Himalayan Geology'
];

export default function PersonnelManager() {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStation, setSelectedStation] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newPerson, setNewPerson] = useState({
    name: '',
    role: 'Senior Glaciologist',
    affiliated_institution: 'NCPOR',
    personnel_category: 'permanent_staff',
    assigned_station: 'Bharati Research Station',
    season_type: 'summer',
    deployment_start: '2025-11-15',
    deployment_end: '2026-03-30',
    current_status: 'deployed'
  });

  useEffect(() => {
    fetchPersonnel();
  }, [selectedStation, selectedSeason, selectedCategory, selectedInstitution]);

  const fetchPersonnel = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPersonnel({
        station: selectedStation || undefined,
        season: selectedSeason || undefined,
        category: selectedCategory || undefined,
        institution: selectedInstitution || undefined
      });
      setPersonnel(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('PersonnelManager fetchPersonnel error:', err);
      setPersonnel([]);
      setError("Unable to reach PolarLogix personnel service. Please check backend connection.");
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
        role: 'Senior Glaciologist',
        affiliated_institution: 'NCPOR',
        personnel_category: 'permanent_staff',
        assigned_station: 'Bharati Research Station',
        season_type: 'summer',
        deployment_start: '2025-11-15',
        deployment_end: '2026-03-30',
        current_status: 'deployed'
      });
      fetchPersonnel();
    } catch (err) {
      console.error('Failed to deploy personnel:', err);
    }
  };

  const safePersonnel = Array.isArray(personnel) ? personnel : [];
  const summerCount = safePersonnel.filter(p => p?.season_type === 'summer').length;
  const winterCount = safePersonnel.filter(p => p?.season_type === 'winter').length;

  // Institution diversity count
  const institutionsSet = new Set(safePersonnel.map(p => p?.affiliated_institution).filter(Boolean));

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              National Polar Platform
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {institutionsSet.size} Partner Institutions
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Expedition Personnel & Multi-Institution Roster
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Tracking scientists and specialists representing NCPOR, IITs, CSIR labs, GSI, AIIMS, and partner universities
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-sky-500/30 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Deploy Expedition Member</span>
        </button>
      </div>

      {/* Visible Error State */}
      {error && (
        <div className="p-4 glass-panel border-l-4 border-l-rose-500 bg-rose-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-rose-500">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-sm">Personnel Roster Connection Error</h3>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchPersonnel}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Diversity & Season Visualizer Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="glass-panel p-5 space-y-2 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-500 text-sm flex items-center space-x-1.5">
              <Sun className="w-4 h-4" />
              <span>Summer Team Window</span>
            </span>
            <span className="font-mono text-xs font-bold text-amber-500">{summerCount} Deployed</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Peak scientific fieldwork, aerial logistics & heavy supply replenishment (Nov - Mar / Arctic May - Sep).
          </p>
        </div>

        <div className="glass-panel p-5 space-y-2 border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sky-400 text-sm flex items-center space-x-1.5">
              <Snowflake className="w-4 h-4" />
              <span>Wintering Team Crew</span>
            </span>
            <span className="font-mono text-xs font-bold text-sky-400">{winterCount} Members</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Wintering crew operating station power, life-support, meteorology & telemetry.
          </p>
        </div>

        <div className="glass-panel p-5 space-y-2 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-500 text-sm flex items-center space-x-1.5">
              <Building2 className="w-4 h-4" />
              <span>Affiliated Institutions</span>
            </span>
            <span className="font-mono text-xs font-bold text-emerald-500">{institutionsSet.size} Distinct</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            National platform supporting visiting researchers from premier IITs, CSIR labs, ISRO, and universities.
          </p>
        </div>

      </div>

      {/* Multi-Dimensional Filter Bar */}
      <div className="glass-panel p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
          <Filter className="w-4 h-4" />
          <span>Filters:</span>
        </div>

        <select
          value={selectedStation}
          onChange={(e) => setSelectedStation(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
        >
          <option value="">All Stations & Bases</option>
          <option value="Bharati Research Station">Bharati Station (Antarctica)</option>
          <option value="Maitri Research Station">Maitri Station (Antarctica)</option>
          <option value="Himadri Arctic Station">Himadri Station (Arctic / Svalbard)</option>
          <option value="Himansh Himalayan Station">Himansh Base (Himalayas / Spiti)</option>
          <option value="Cape Town Transfer Point">Cape Town Staging Hub</option>
          <option value="India Depot">Goa Depot</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
        >
          <option value="">All Employment Categories</option>
          <option value="permanent_staff">Permanent Staff</option>
          <option value="project_scientist">Project Scientist</option>
          <option value="contract_specialist">Contract Specialist</option>
          <option value="visiting_researcher">Visiting Researcher</option>
        </select>

        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
        >
          <option value="">All Seasons</option>
          <option value="summer">Summer Crew</option>
          <option value="winter">Wintering Crew</option>
        </select>

        {(selectedStation || selectedCategory || selectedSeason || selectedInstitution) && (
          <button
            onClick={() => {
              setSelectedStation('');
              setSelectedCategory('');
              setSelectedSeason('');
              setSelectedInstitution('');
            }}
            className="text-xs text-sky-500 hover:underline px-2 py-1 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Roster Table */}
      <div className="glass-panel p-5 space-y-4">
        {loading ? (
          <LoadingSkeleton type="list" count={5} />
        ) : safePersonnel.length === 0 && !error ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
            No expedition personnel records found matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800/60 uppercase font-semibold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-3.5 rounded-l-lg">ID</th>
                  <th className="p-3.5">Name & Role</th>
                  <th className="p-3.5">Affiliated Institution</th>
                  <th className="p-3.5">Employment Category</th>
                  <th className="p-3.5">Assigned Station</th>
                  <th className="p-3.5">Season</th>
                  <th className="p-3.5">Deployment Window</th>
                  <th className="p-3.5 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {safePersonnel.map((per) => {
                  const cat = categoryLabels[per?.personnel_category] || { label: per?.personnel_category || 'Permanent', color: 'bg-slate-100 text-slate-700' };
                  return (
                    <tr key={per?.id || Math.random()} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono text-sky-500 font-bold">{per?.id}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{per?.name}</div>
                        <div className="text-slate-500 dark:text-slate-400 text-xs">{per?.role}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          <Building2 className="w-3 h-3 mr-1 text-sky-500" />
                          {per?.affiliated_institution || 'NCPOR'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wide ${cat.color}`}>
                          {cat.label}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium">{per?.assigned_station}</td>
                      <td className="p-3.5 capitalize">
                        {per?.season_type === 'summer' ? (
                          <span className="text-amber-500 font-semibold flex items-center"><Sun className="w-3.5 h-3.5 mr-1" /> Summer</span>
                        ) : (
                          <span className="text-sky-400 font-semibold flex items-center"><Snowflake className="w-3.5 h-3.5 mr-1" /> Winter</span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                        {per?.deployment_start} → {per?.deployment_end}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={per?.current_status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Personnel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel max-w-lg w-full p-6 space-y-4 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Deploy Expedition Member
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Register station personnel with institutional affiliation and employment category.
              </p>
            </div>

            <form onSubmit={handleAddPerson} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role / Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chief Glaciologist"
                    value={newPerson.role}
                    onChange={(e) => setNewPerson({ ...newPerson, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Affiliated Institution *</label>
                  <input
                    type="text"
                    required
                    list="institutions-list"
                    placeholder="e.g. NCPOR, IIT Bombay"
                    value={newPerson.affiliated_institution}
                    onChange={(e) => setNewPerson({ ...newPerson, affiliated_institution: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <datalist id="institutions-list">
                    {commonInstitutions.map(inst => <option key={inst} value={inst} />)}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Employment Category *</label>
                  <select
                    value={newPerson.personnel_category}
                    onChange={(e) => setNewPerson({ ...newPerson, personnel_category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="permanent_staff">Permanent Staff</option>
                    <option value="project_scientist">Project Scientist</option>
                    <option value="contract_specialist">Contract Specialist</option>
                    <option value="visiting_researcher">Visiting Researcher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Station *</label>
                  <select
                    value={newPerson.assigned_station}
                    onChange={(e) => setNewPerson({ ...newPerson, assigned_station: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Bharati Research Station">Bharati Station (Antarctica)</option>
                    <option value="Maitri Research Station">Maitri Station (Antarctica)</option>
                    <option value="Himadri Arctic Station">Himadri Station (Arctic)</option>
                    <option value="Himansh Himalayan Station">Himansh Base (Himalayas)</option>
                    <option value="Cape Town Transfer Point">Cape Town Transfer Point</option>
                    <option value="India Depot (Goa)">India Depot (Goa)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Season</label>
                  <select
                    value={newPerson.season_type}
                    onChange={(e) => setNewPerson({ ...newPerson, season_type: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="summer">Summer Crew</option>
                    <option value="winter">Wintering Crew</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newPerson.deployment_start}
                    onChange={(e) => setNewPerson({ ...newPerson, deployment_start: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newPerson.deployment_end}
                    onChange={(e) => setNewPerson({ ...newPerson, deployment_end: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-sky-500/20 cursor-pointer mt-2"
              >
                Save Expedition Record
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
