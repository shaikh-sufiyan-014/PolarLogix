import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ShipmentPlanner from './pages/ShipmentPlanner';
import ShipmentTracker from './pages/ShipmentTracker';
import InventoryDashboard from './pages/InventoryDashboard';
import PersonnelManager from './pages/PersonnelManager';
import EmergencyResponse from './pages/EmergencyResponse';
import RouteExplorer from './pages/RouteExplorer';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200 pb-16 lg:pb-0">
        
        {/* Top Navbar */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <main className="transition-all duration-300">
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === 'planner' && <ShipmentPlanner setActiveTab={setActiveTab} />}
          {activeTab === 'tracking' && <ShipmentTracker />}
          {activeTab === 'inventory' && <InventoryDashboard />}
          {activeTab === 'personnel' && <PersonnelManager />}
          {activeTab === 'emergency' && <EmergencyResponse />}
          {activeTab === 'explorer' && <RouteExplorer />}
        </main>

        {/* Footer */}
        <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>PolarLogix v1.0 • National Centre for Polar and Ocean Research (NCPOR)</span>
            <span>Covering Maitri & Bharati Stations, Antarctica</span>
          </div>
        </footer>

      </div>
    </ThemeProvider>
  );
}
