import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Compass,
  LayoutDashboard,
  PackagePlus,
  Truck,
  Boxes,
  Users,
  ShieldAlert,
  Route,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  Shield,
  Radio,
  Ship,
  UserCheck,
  User,
  Info,
  Building2,
  Globe,
  Snowflake,
  Mountain,
  Award,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [selectedStationTab, setSelectedStationTab] = useState('maitri');

  // Define nav links per role
  let navItems = [];
  if (user?.role === 'admin') {
    navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'planner', label: 'Route Planner', icon: PackagePlus },
      { id: 'tracking', label: 'Shipment Tracker', icon: Truck },
      { id: 'inventory', label: 'Inventory', icon: Boxes },
      { id: 'personnel', label: 'Personnel', icon: Users },
      { id: 'emergency', label: 'Emergency Hub', icon: ShieldAlert, badge: true },
      { id: 'explorer', label: 'Network Explorer', icon: Route },
    ];
  } else if (user?.role === 'station_commander') {
    navItems = [
      { id: 'station_dashboard', label: 'Station Command Hub', icon: Radio },
    ];
  } else if (user?.role === 'shipment_officer') {
    navItems = [
      { id: 'officer_dashboard', label: 'Voyage Operations', icon: Ship },
    ];
  } else if (user?.role === 'personnel') {
    navItems = [
      { id: 'personnel_dashboard', label: 'Expedition Portal', icon: UserCheck },
    ];
  }

  const getRoleBadge = () => {
    if (!user) return null;
    switch (user.role) {
      case 'admin':
        return { label: 'HQ SUPER ADMIN', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30', icon: Shield };
      case 'station_commander':
        const stn = user.linked_station_id === 'LOC-BHA' ? 'BHARATI' : 'MAITRI';
        return { label: `COMMANDER • ${stn}`, color: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30', icon: Radio };
      case 'shipment_officer':
        return { label: 'SHIPMENT OFFICER', color: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30', icon: Ship };
      case 'personnel':
        return { label: `PERSONNEL • ${user.linked_personnel_id || user.username}`, color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30', icon: UserCheck };
      default:
        return { label: user.role, color: 'bg-slate-500/15 text-slate-600 border-slate-500/30', icon: User };
    }
  };

  const badge = getRoleBadge();

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 dark:bg-[#0B0F19]/85 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo & NCPOR Tag */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab(navItems[0]?.id || 'dashboard')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20 flex-shrink-0">
                <Compass className="w-6 h-6 text-white animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                    PolarLogix
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider rounded uppercase bg-sky-500/10 text-sky-500 border border-sky-500/20">
                    NCPOR
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  National Centre for Polar and Ocean Research
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links (Admin sees all 7; others see scoped link) */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-500' : ''}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Header Actions: About Button, User Role Tag, Theme Toggle & Logout */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {/* PHASE 4: About Programme Info Button */}
              <button
                onClick={() => setShowAboutModal(true)}
                title="About NCPOR Polar Programme & Stations"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white transition-all text-xs font-semibold cursor-pointer shadow-sm"
              >
                <Info className="w-4 h-4" />
                <span className="hidden md:inline">About Programme</span>
              </button>

              {badge && (
                <div className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide uppercase border ${badge.color}`}>
                  <badge.icon className="w-3.5 h-3.5" />
                  <span>{badge.label}</span>
                </div>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-600" />
                )}
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Sign Out of PolarLogix"
                className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all flex items-center space-x-1 text-xs font-semibold cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sign Out</span>
              </button>

              {/* Mobile Hamburger Button */}
              {navItems.length > 1 && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B0F19]/95 px-4 pt-2 pb-4 space-y-1">
            {badge && (
              <div className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase mb-2 border ${badge.color}`}>
                <badge.icon className="w-4 h-4" />
                <span>{badge.label}</span>
              </div>
            )}
            <button
              onClick={() => {
                setShowAboutModal(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-500/10"
            >
              <Info className="w-4 h-4" />
              <span>About NCPOR Programme & Stations</span>
            </button>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                    isActive
                      ? 'bg-sky-500/10 text-sky-500 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* PHASE 4: ABOUT NCPOR PROGRAMME INFO MODAL */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel max-w-3xl w-full p-6 sm:p-8 space-y-6 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1 pr-8">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-lg uppercase tracking-wider bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                  Institutional Overview
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Ministry of Earth Sciences, Govt. of India
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                National Centre for Polar and Ocean Research (NCPOR)
              </h2>
            </div>

            {/* Core Institutional Fact Sheet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">Headquarters</span>
                <div className="font-bold text-slate-900 dark:text-white">Headland Sada, Vasco-da-Gama, Goa 403804</div>
                <div className="text-slate-500">Autonomous R&D Institution under Ministry of Earth Sciences (MoES)</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">Leadership</span>
                <div className="font-bold text-slate-900 dark:text-white">Dr. Thamban Meloth</div>
                <div className="text-slate-500">Director, National Centre for Polar and Ocean Research</div>
              </div>
            </div>

            {/* National Platform Mandate */}
            <div className="p-4 rounded-xl bg-sky-500/5 dark:bg-sky-950/20 border border-sky-500/20 text-xs space-y-2">
              <div className="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>National Research Enabling Mandate</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                NCPOR acts as India's premier national nodal platform coordinating, funding, and providing cold-region expedition logistics for scientists across <b>Indian Institutes of Technology (IITs)</b>, <b>CSIR laboratories</b>, <b>ISRO space organisations (SAC/NRSC)</b>, <b>National Institute of Oceanography (NIO)</b>, <b>Geological Survey of India (GSI)</b>, and premier universities nationwide, alongside in-house scientific programs.
              </p>
            </div>

            {/* Four-Station Polar Dossier Tabs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-500" />
                  <span>The Four NCPOR Field Stations</span>
                </h3>
                <span className="text-[11px] text-slate-400">Antarctic, Arctic & Himalayan Mandate</span>
              </div>

              {/* Station Tab Switcher */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'maitri', name: 'Maitri', region: 'Antarctic', icon: Snowflake },
                  { id: 'bharati', name: 'Bharati', region: 'Antarctic', icon: Snowflake },
                  { id: 'himadri', name: 'Himadri', region: 'Arctic', icon: Compass },
                  { id: 'himansh', name: 'Himansh', region: 'Himalayas', icon: Mountain },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isSelected = selectedStationTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedStationTab(tab.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500 text-white border-sky-500 shadow-md font-bold'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-500/50'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-xs font-extrabold">{tab.name}</span>
                      </div>
                      <div className={`text-[10px] ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                        {tab.region}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Station Detail Card */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs space-y-3">
                {selectedStationTab === 'maitri' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
                      <span>Maitri Research Station (Est. 1989)</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Antarctic Inland</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs space-y-1">
                      <p><b>Location:</b> Schirmacher Oasis, inland Antarctica (70°46'S, 11°44'E)</p>
                      <p><b>Capacity:</b> 25 Wintering Crew / ~50 Summer Peak (accommodation-dependent configuration)</p>
                      <p><b>Distinctive Logistics Gap:</b> Maitri is located approximately <b>80 km inland</b> from the Indian Barrier/ice-shelf edge where chartered expedition vessels dock. Cargo requires a multi-stage overland supply chain (ship → ice shelf edge → PistenBully snow tractor convoys / helicopters → Maitri station).</p>
                      <p><b>Research Focus:</b> Meteorology, glaciology, solid earth sciences, biology, upper atmospheric physics.</p>
                    </div>
                  </div>
                )}

                {selectedStationTab === 'bharati' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
                      <span>Bharati Research Station (Est. 2012)</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">Antarctic Coastal</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs space-y-1">
                      <p><b>Location:</b> Larsemann Hills, Prydz Bay (69°24.41'S, 76°11.72'E / -69.4068, 76.1953)</p>
                      <p><b>Capacity:</b> 24 Wintering Crew / 47 Summer Crew (46th ISEA Operating Configuration)</p>
                      <p><b>Distinctive Logistics Fact:</b> Bharati is directly coastal, situated ~<b>200m from shore</b> at Quilty Bay. Direct ship-to-shore helicopter transfer and vessel barge landing are utilized without requiring long-distance inland overland traverses.</p>
                      <p><b>Research Focus:</b> Oceanography, atmospheric sciences, geosciences, polar biology, satellite telemetry.</p>
                    </div>
                  </div>
                )}

                {selectedStationTab === 'himadri' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
                      <span>Himadri Arctic Station (Est. 2008)</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20">Arctic / Svalbard</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs space-y-1">
                      <p><b>Location:</b> Ny-Ålesund, Spitsbergen, Svalbard, Norway (78°55'N, 11°56'E)</p>
                      <p><b>Operating Framework:</b> Operates within an <b>international research base framework</b> under the Svalbard Treaty (Kings Bay AS logistics), distinct from sovereign Antarctic station management.</p>
                      <p><b>Capacity:</b> 8 Summer Researchers (Seasonal and project-based campaigns).</p>
                      <p><b>Research Focus:</b> Atmospheric science, microbiology, earth science, glaciology, space physics, biology, micropalaeontology, palaeoclimatology.</p>
                    </div>
                  </div>
                )}

                {selectedStationTab === 'himansh' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
                      <span>Himansh Himalayan Station (Est. 2016)</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">Himalayan Glacier Base</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs space-y-1">
                      <p><b>Location:</b> Sutri Dhaka, Chandra Basin, Lahaul-Spiti, Himachal Pradesh, India (32.4485°N, 77.6155°E)</p>
                      <p><b>Altitude:</b> ~4,080 meters above sea level.</p>
                      <p><b>Logistics Model:</b> Land-based road logistics (no sea or air transport legs apply; accessible via Manali-Leh road corridor).</p>
                      <p><b>Research Purpose:</b> Continuous field research on Himalayan glacier dynamics, hydrological discharge, ice thickness, and climate interaction in the High Himalayas.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowAboutModal(false)}
                className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Mobile Bottom Quick Bar for Super Admin */}
      {user?.role === 'admin' && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0B0F19]/90 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md lg:hidden flex justify-around py-2 px-1">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center p-1.5 text-xs transition-colors ${
                  isActive ? 'text-sky-500 font-bold' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span className="text-[10px] truncate max-w-[60px]">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
}
