import React from 'react';
import {
  Shield,
  Activity,
  Network,
  Cpu,
  ShieldAlert,
  BarChart3,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSimulation } from '../contexts/SimulationContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenJudgeDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenJudgeDemo,
}) => {
  const { user, logout } = useAuth();
  const { status, startSimulation, pauseSimulation, resetSimulation } = useSimulation();

  const navItems = [
    { id: 'command', label: 'Command Center', icon: Activity },
    { id: 'network', label: '3D Network', icon: Network },
    { id: 'simulation', label: 'Simulation Lab', icon: Play },
    { id: 'prediction', label: 'AI Prediction', icon: Cpu },
    { id: 'defence', label: 'Defence Center', icon: ShieldAlert },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
  ];

  const threatColor =
    status?.threat_level.includes('CRITICAL')
      ? 'text-rose-400 bg-rose-500/20 border-rose-500/50 animate-pulse'
      : status?.threat_level.includes('ELEVATED')
      ? 'text-amber-400 bg-amber-500/20 border-amber-500/50'
      : 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50';

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-cyan-500/20 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('command')}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(33,212,253,0.5)]">
            <Shield className="w-6 h-6 text-slate-950 fill-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg tracking-wider text-white">CYBERSHIELD</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-mono font-bold">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              Predict • Protect • Recover
            </p>
          </div>
        </div>

        {/* Center Module Navigation */}
        <nav className="hidden lg:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(33,212,253,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center space-x-3">
          {/* Threat Status Badge */}
          <div
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono border font-semibold ${threatColor}`}
          >
            <span className="w-2 h-2 rounded-full bg-current" />
            <span>{status?.threat_level || 'NORMAL SECURE'}</span>
          </div>

          {/* Quick Simulation Controls */}
          <div className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-lg border border-slate-700">
            {status?.status === 'RUNNING' ? (
              <button
                onClick={() => pauseSimulation()}
                className="p-1.5 rounded hover:bg-slate-800 text-amber-400 transition"
                title="Pause Simulation"
              >
                <Pause className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => startSimulation()}
                className="p-1.5 rounded hover:bg-slate-800 text-emerald-400 transition"
                title="Start / Resume Simulation"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => resetSimulation()}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Reset Simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Judge Demo Guided Tour Pill */}
          <button
            onClick={onOpenJudgeDemo}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/50 hover:bg-cyan-500/30 transition shadow-[0_0_15px_rgba(33,212,253,0.2)] animate-pulse"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>JUDGE DEMO</span>
          </button>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
            <div className="hidden md:block text-right">
              <div className="text-xs font-semibold text-white leading-tight">
                {user?.full_name || 'Operator'}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono uppercase">
                {user?.role || 'Operator'}
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Submenu Navigation */}
      <div className="flex lg:hidden overflow-x-auto space-x-2 pt-2 border-t border-slate-800/80 mt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs whitespace-nowrap ${
                isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400' : 'text-slate-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

