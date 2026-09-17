import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Compass,
  Shield,
  Lock,
  User,
  Radio,
  Ship,
  UserCheck,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon
} from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    role: 'Super Admin (NCPOR HQ)',
    tag: 'Full Access',
    username: 'admin.ncpor',
    password: 'Demo@Admin2026',
    icon: Shield,
    color: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-500/30',
    desc: 'Unrestricted access to all stations, shipments, inventory, personnel & global dispatch.'
  },
  {
    role: 'Station Commander (Bharati)',
    tag: 'Station Scoped',
    username: 'commander.bharati',
    password: 'Demo@Bharati2026',
    icon: Radio,
    color: 'from-sky-500 to-blue-600',
    borderColor: 'border-sky-500/30',
    desc: 'Scoped to Bharati Station: local inventory, roster, and station emergency response.'
  },
  {
    role: 'Shipment Officer',
    tag: 'Voyage Scoped',
    username: 'officer.shipping1',
    password: 'Demo@Officer2026',
    icon: Ship,
    color: 'from-teal-500 to-emerald-600',
    borderColor: 'border-teal-500/30',
    desc: 'Assigned voyage command: digital handovers, consumable depletion, weather logs & docs.'
  },
  {
    role: 'Personnel Member',
    tag: 'Personal ID',
    username: 'PER-001',
    password: 'Demo@Personnel2026',
    icon: UserCheck,
    color: 'from-indigo-500 to-purple-600',
    borderColor: 'border-indigo-500/30',
    desc: 'Individual employee portal: duty status logging, deployment record, station SOS alert.'
  }
];

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [demoPanelExpanded, setDemoPanelExpanded] = useState(true);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(username, password);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid username or password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demo) => {
    setUsername(demo.username);
    setPassword(demo.password);
    setLoading(true);
    setError(null);
    try {
      await login(demo.username, demo.password);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Demo login failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 relative overflow-hidden transition-colors duration-200">
      
      {/* Background Ambient Polar Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-500/10 dark:bg-sky-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar / Theme Toggle */}
      <div className="absolute top-4 right-6 flex items-center space-x-3">
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600" />
          )}
        </button>
      </div>

      <div className="w-full max-w-5xl z-10 space-y-8">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 shadow-xl shadow-sky-500/25 mb-1">
            <Compass className="w-10 h-10 text-white animate-spin-slow" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              PolarLogix
            </h1>
            <span className="px-2 py-0.5 text-xs font-bold tracking-wider rounded uppercase bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
              NCPOR
            </span>
          </div>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Indian Antarctic Programme • Secure Role-Based Expedition Logistics & Incident Dispatch Platform
          </p>
        </div>

        {/* Demo Credentials Panel (Collapsible Card for Judges) */}
        <div className="glass-panel p-5 sm:p-6 border border-sky-500/30 dark:border-sky-500/20 bg-sky-500/5 dark:bg-sky-950/20 shadow-lg rounded-2xl">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setDemoPanelExpanded(!demoPanelExpanded)}>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-sky-500/20 text-sky-500">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  Judge Testing & Demo Login Credentials
                  <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Bcrypt Hashed in DB
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                  Click any demo role card below to instantly auto-fill credentials and sign in.
                </p>
              </div>
            </div>
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              {demoPanelExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {demoPanelExpanded && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
              {DEMO_ACCOUNTS.map((demo) => {
                const Icon = demo.icon;
                return (
                  <div
                    key={demo.username}
                    onClick={() => handleQuickDemoLogin(demo)}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:border-sky-500 dark:hover:border-sky-400 transition-all cursor-pointer shadow-sm hover:shadow-md group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${demo.color} flex items-center justify-center text-white shadow-sm`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {demo.tag}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">
                          {demo.role}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {demo.desc}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-mono text-slate-600 dark:text-slate-300 space-y-0.5">
                      <div className="truncate"><span className="text-slate-400">User:</span> {demo.username}</div>
                      <div className="truncate"><span className="text-slate-400">Pass:</span> {demo.password}</div>
                      <button className="w-full mt-2 py-1.5 px-2 bg-sky-500/10 hover:bg-sky-500 text-sky-600 dark:text-sky-400 hover:text-white font-medium rounded-lg text-xs transition-colors text-center">
                        1-Click Sign In →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Login Form Box */}
        <div className="max-w-md mx-auto glass-panel p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#111827]/90">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-sky-500" />
                Sign In to PolarLogix
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your NCPOR expedition credentials to access your scoped dashboard.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Username or Personnel ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin.ncpor or PER-001"
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In to Expedition Console</span>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
