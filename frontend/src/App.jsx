import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';

// Role-Scoped Dashboards
import StationCommanderDashboard from './pages/StationCommanderDashboard';
import ShipmentOfficerDashboard from './pages/ShipmentOfficerDashboard';
import PersonnelDashboard from './pages/PersonnelDashboard';

// Super Admin Dashboards
import Dashboard from './pages/Dashboard';
import ShipmentPlanner from './pages/ShipmentPlanner';
import ShipmentTracker from './pages/ShipmentTracker';
import InventoryDashboard from './pages/InventoryDashboard';
import PersonnelManager from './pages/PersonnelManager';
import EmergencyResponse from './pages/EmergencyResponse';
import RouteExplorer from './pages/RouteExplorer';

import ErrorBoundary from './components/ErrorBoundary';
import { Compass } from 'lucide-react';

function AuthenticatedApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Set default tab when user changes
  useEffect(() => {
    if (user) {
      if (user.role === 'station_commander') {
        setActiveTab('station_dashboard');
      } else if (user.role === 'shipment_officer') {
        setActiveTab('officer_dashboard');
      } else if (user.role === 'personnel') {
        setActiveTab('personnel_dashboard');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/25 animate-pulse">
          <Compass className="w-7 h-7 text-white animate-spin-slow" />
        </div>
        <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
          Initializing PolarLogix Secure Session...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200 pb-16 lg:pb-0">
      {/* Top Navbar with active role indicators */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area based on User Role */}
      <main className="transition-all duration-300">
        <ErrorBoundary key={`${user.role}-${activeTab}`}>
          {/* Station Commander Scoped View */}
          {user.role === 'station_commander' && <StationCommanderDashboard />}

          {/* Shipment Officer Dedicated View */}
          {user.role === 'shipment_officer' && <ShipmentOfficerDashboard />}

          {/* Personnel Dedicated Portal */}
          {user.role === 'personnel' && <PersonnelDashboard />}

          {/* Super Admin Full Navigation Experience */}
          {user.role === 'admin' && (
            <>
              {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
              {activeTab === 'planner' && <ShipmentPlanner setActiveTab={setActiveTab} />}
              {activeTab === 'tracking' && <ShipmentTracker />}
              {activeTab === 'inventory' && <InventoryDashboard />}
              {activeTab === 'personnel' && <PersonnelManager />}
              {activeTab === 'emergency' && <EmergencyResponse />}
              {activeTab === 'explorer' && <RouteExplorer />}
            </>
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PolarLogix Multi-Role RBAC • National Centre for Polar and Ocean Research (NCPOR)</span>
          <span>Covering Maitri & Bharati Stations, Antarctica</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
