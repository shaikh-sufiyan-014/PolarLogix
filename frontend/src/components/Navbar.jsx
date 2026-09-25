import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  LayoutDashboard,
  PackagePlus,
  Truck,
  Boxes,
  Users,
  ShieldAlert,
  Route,
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
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';

import SyncStatusWidget from './SyncStatusWidget';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [selectedStationTab, setSelectedStationTab] = useState('maitri');

  // Dropdown states
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const moreMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setMoreMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Primary nav links (always visible)
  let primaryNavItems = [];
  // Secondary overflow items (under "More" menu)
  let overflowNavItems = [];

  if (user?.role === 'admin') {
    primaryNavItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'planner', label: 'Route Planner', icon: PackagePlus },
      { id: 'tracking', label: 'Shipment Tracker', icon: Truck },
      { id: 'inventory', label: 'Inventory', icon: Boxes },
      { id: 'personnel', label: 'Personnel', icon: Users },
      { id: 'emergency', label: 'Emergency Hub', icon: ShieldAlert, badge: true },
    ];
    overflowNavItems = [
      { id: 'explorer', label: 'Network Explorer', icon: Route },
    ];
  } else if (user?.role === 'station_commander') {
    primaryNavItems = [
      { id: 'station_dashboard', label: 'Station Command Hub', icon: Radio },
    ];
  } else if (user?.role === 'shipment_officer') {
    primaryNavItems = [
      { id: 'officer_dashboard', label: 'Voyage Operations', icon: Ship },
    ];
  } else if (user?.role === 'personnel') {
    primaryNavItems = [
      { id: 'personnel_dashboard', label: 'Expedition Portal', icon: UserCheck },
    ];
  }

  const getRoleBadge = () => {
    if (!user) return null;
    switch (user.role) {
      case 'admin':
        return { label: 'HQ SUPER ADMIN', color: 'bg-amber-50 text-amber-700 border-amber-300', icon: Shield };
      case 'station_commander':
        const stn = user.linked_station_id === 'LOC-BHA' ? 'BHARATI' : 'MAITRI';
        return { label: `COMMANDER • ${stn}`, color: 'bg-sky-50 text-sky-700 border-sky-300', icon: Radio };
      case 'shipment_officer':
        return { label: 'SHIPMENT OFFICER', color: 'bg-teal-50 text-teal-700 border-teal-300', icon: Ship };
      case 'personnel':
        return { label: `PERSONNEL • ${user.linked_personnel_id || user.username}`, color: 'bg-indigo-50 text-indigo-700 border-indigo-300', icon: UserCheck };
      default:
        return { label: user.role, color: 'bg-slate-50 text-slate-700 border-slate-300', icon: User };
    }
  };

  const badge = getRoleBadge();
  const isOverflowActive = overflowNavItems.some(item => item.id === activeTab);

  // User avatar initials
  const getUserInitials = () => {
    if (!user?.username) return 'U';
    if (user.role === 'admin') return 'HQ';
    if (user.role === 'station_commander') return 'SC';
    if (user.role === 'shipment_officer') return 'SO';
    return user.username.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo & NCPOR Tag */}
            <div
              className="flex items-center space-x-3 cursor-pointer select-none"
              onClick={() => setActiveTab(primaryNavItems[0]?.id || 'dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20 flex-shrink-0">
                <Compass className="w-6 h-6 text-white animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900">
                    PolarLogix
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider rounded uppercase bg-sky-50 text-sky-600 border border-sky-200">
                    NCPOR
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  National Centre for Polar and Ocean Research
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links (Primary visible items) */}
            <nav className="hidden lg:flex items-center space-x-1">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-sky-50 text-sky-600 border border-sky-200 shadow-sm font-bold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-500' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </button>
                );
              })}

              {/* "More" Overflow Dropdown Menu (Contains Network Explorer & About) */}
              <div className="relative" ref={moreMenuRef}>
                <button
                  id="nav-more-menu-btn"
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isOverflowActive
                      ? 'bg-sky-50 text-sky-600 border border-sky-200 shadow-sm font-bold'
                      : moreMenuOpen
                      ? 'bg-slate-100 text-slate-900 border border-slate-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                  }`}
                  title="More Navigation Options"
                >
                  <MoreHorizontal className="w-4 h-4 text-slate-500" />
                  <span>More</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180 text-sky-500' : 'text-slate-400'}`} />
                </button>

                {/* Overflow Dropdown Popup */}
                {moreMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-fadeIn">
                    {overflowNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          id={`nav-${item.id}`}
                          onClick={() => {
                            setActiveTab(item.id);
                            setMoreMenuOpen(false);
                          }}
                          className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 text-xs font-semibold transition-colors text-left cursor-pointer ${
                            isActive
                              ? 'bg-sky-50 text-sky-600 font-bold'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'text-sky-500' : 'text-slate-500'}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}

                    {/* About Option in More Menu */}
                    <button
                      id="nav-about-btn"
                      onClick={() => {
                        setShowAboutModal(true);
                        setMoreMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left cursor-pointer border-t border-slate-100"
                    >
                      <Info className="w-4 h-4 text-sky-500" />
                      <span>About NCPOR Programme</span>
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* Right Header Actions: PolarLink Status Dot & User Profile Dropdown */}
            <div className="flex items-center space-x-3">
              
              {/* PolarLink Satellite Comms & Priority Sync Status Dot Indicator (Phase 2) */}
              <SyncStatusWidget />

              {/* User Profile Avatar & Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  id="user-profile-btn"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className={`flex items-center space-x-2 p-1.5 pl-2.5 pr-2 rounded-xl border transition-all cursor-pointer ${
                    profileMenuOpen
                      ? 'bg-slate-100 border-slate-300 shadow-sm ring-2 ring-sky-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  title="User Profile & Identity"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-cyan-400 text-white flex items-center justify-center text-xs font-extrabold shadow-sm">
                    {getUserInitials()}
                  </div>
                  <span className="text-xs font-bold text-slate-800 hidden md:inline max-w-[110px] truncate">
                    {user?.username}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180 text-sky-500' : ''}`} />
                </button>

                {/* Profile Identity & Sign Out Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-fadeIn">
                    
                    {/* User Identity Header */}
                    <div className="px-4 py-2.5 space-y-1.5 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center font-bold text-xs">
                          {getUserInitials()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {user?.username}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Authenticated User
                          </p>
                        </div>
                      </div>

                      {/* Role Badge (Identity display) */}
                      {badge && (
                        <div className={`mt-2 flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase border ${badge.color}`}>
                          <badge.icon className="w-3.5 h-3.5" />
                          <span className="truncate">{badge.label}</span>
                        </div>
                      )}
                    </div>

                    {/* Sign Out Option (1-Click within Dropdown) */}
                    <div className="px-1.5 pt-1.5">
                      <button
                        id="profile-signout-btn"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>

              {/* Mobile Hamburger Button */}
              <button
                id="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                title="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white/95 px-4 pt-2 pb-4 space-y-1">
            {badge && (
              <div className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase mb-2 border ${badge.color}`}>
                <badge.icon className="w-4 h-4" />
                <span>{badge.label}</span>
              </div>
            )}
            
            {primaryNavItems.map((item) => {
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
                      ? 'bg-sky-50 text-sky-600 font-bold border border-sky-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {overflowNavItems.map((item) => {
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
                      ? 'bg-sky-50 text-sky-600 font-bold border border-sky-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => {
                setShowAboutModal(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-sky-600 bg-sky-50"
            >
              <Info className="w-4 h-4" />
              <span>About NCPOR Programme & Stations</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 mt-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </header>

      {/* ABOUT NCPOR PROGRAMME INFO MODAL */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel max-w-3xl w-full p-6 sm:p-8 space-y-6 bg-white border-slate-200 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1 pr-8">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-lg uppercase tracking-wider bg-sky-100 text-sky-700 border border-sky-200">
                  Institutional Overview
                </span>
                <span className="text-xs text-slate-500">
                  Ministry of Earth Sciences, Govt. of India
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                National Centre for Polar and Ocean Research (NCPOR)
              </h2>
            </div>

            {/* Core Institutional Fact Sheet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">Headquarters</span>
                <div className="font-bold text-slate-900">Headland Sada, Vasco-da-Gama, Goa 403804</div>
                <div className="text-slate-500">Autonomous R&D Institution under Ministry of Earth Sciences (MoES)</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">Leadership</span>
                <div className="font-bold text-slate-900">Dr. Thamban Meloth</div>
                <div className="text-slate-500">Director, National Centre for Polar and Ocean Research</div>
              </div>
            </div>

            {/* National Platform Mandate */}
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs space-y-2">
              <div className="font-bold text-sky-700 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>National Research Enabling Mandate</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                NCPOR acts as India's premier national nodal platform coordinating, funding, and providing cold-region expedition logistics for scientists across <b>Indian Institutes of Technology (IITs)</b>, <b>CSIR laboratories</b>, <b>ISRO space organisations (SAC/NRSC)</b>, <b>National Institute of Oceanography (NIO)</b>, <b>Geological Survey of India (GSI)</b>, and premier universities nationwide, alongside in-house scientific programs.
              </p>
            </div>

            {/* Four-Station Polar Dossier Tabs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
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
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-sky-500/50'
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
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                {selectedStationTab === 'maitri' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-bold text-sm text-slate-900">
                      <span>Maitri Research Station (Est. 1989)</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">Antarctic Inland</span>
                    </div>
                    <div className="text-slate-600 text-xs space-y-1">
                      <p><b>Location:</b> Schirmacher Oasis, inland Antarctica (70°46'S, 11°44'E)</p>
                      <p><b>Capacity:</b> 25 Wintering Crew / ~50 Summer Peak (accommodation-dependent configuration)</p>
                      <p><b>Distinctive Logistics Gap:</b> Maitri is located approximately <b>80 km inland</b> from the Indian Barrier/ice-shelf edge where chartered expedition vessels dock. Cargo requires a multi-stage overland supply chain (ship → ice shelf edge → PistenBully snow tractor convoys / helicopters → Maitri station).</p>
                      <p><b>Research Focus:</b> Meteorology, glaciology, solid earth sciences, biology, upper atmospheric physics.</p>
                    </div>
                  </div>
                )}

                {selectedStationTab === 'bharati' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-bold text-sm text-slate-900">
                      <span>Bharati Research Station (Est. 2012)</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-cyan-100 text-cyan-700 border border-cyan-200">Antarctic Coastal</span>
                    </div>
                    <div className="text-slate-600 text-xs space-y-1">
                      <p><b>Location:</b> Larsemann Hills, Prydz Bay (69°24.41'S, 76°11.72'E / -69.4068, 76.1953)</p>
                      <p><b>Capacity:</b> 24 Wintering Crew / 47 Summer Crew (46th ISEA Operating Configuration)</p>
                      <p><b>Distinctive Logistics Fact:</b> Bharati is directly coastal, situated ~<b>200m from shore</b> at Quilty Bay. Direct ship-to-shore helicopter transfer and vessel barge landing are utilized without requiring long-distance inland overland traverses.</p>
                      <p><b>Research Focus:</b> Oceanography, atmospheric sciences, geosciences, polar biology, satellite telemetry.</p>
                    </div>
                  </div>
                )}

                {selectedStationTab === 'himadri' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-bold text-sm text-slate-900">
                      <span>Himadri Arctic Station (Est. 2008)</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">Arctic / Svalbard</span>
                    </div>
                    <div className="text-slate-600 text-xs space-y-1">
                      <p><b>Location:</b> Ny-Ålesund, Spitsbergen, Svalbard, Norway (78°55'N, 11°56'E)</p>
                      <p><b>Operating Framework:</b> Operates within an <b>international research base framework</b> under the Svalbard Treaty (Kings Bay AS logistics), distinct from sovereign Antarctic station management.</p>
                      <p><b>Capacity:</b> 8 Summer Researchers (Seasonal and project-based campaigns).</p>
                      <p><b>Research Focus:</b> Atmospheric science, microbiology, earth science, glaciology, space physics, biology, micropalaeontology, palaeoclimatology.</p>
                    </div>
                  </div>
                )}

                {selectedStationTab === 'himansh' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-bold text-sm text-slate-900">
                      <span>Himansh Himalayan Station (Est. 2016)</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">Himalayan Glacier Base</span>
                    </div>
                    <div className="text-slate-600 text-xs space-y-1">
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
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200 backdrop-blur-md lg:hidden flex justify-around py-2 px-1">
          {primaryNavItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center p-1.5 text-xs transition-colors ${
                  isActive ? 'text-sky-600 font-bold' : 'text-slate-500'
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
