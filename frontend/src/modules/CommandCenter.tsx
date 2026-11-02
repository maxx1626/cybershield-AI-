import React, { useEffect, useState } from 'react';
import {
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Flame,
  Radio,
  Clock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Server,
  Zap
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useSimulation } from '../contexts/SimulationContext';
import { StatCard } from '../components/StatCard';
import { api } from '../services/api';
import { GNNResponse, SEIRModelResponse } from '../types';

interface CommandCenterProps {
  onNavigateTab: (tab: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ onNavigateTab }) => {
  const { status, topology } = useSimulation();
  const [seirData, setSeirData] = useState<SEIRModelResponse | null>(null);
  const [gnnData, setGnnData] = useState<GNNResponse | null>(null);

  useEffect(() => {
    api.getSEIRModel(15).then(setSeirData).catch(() => {});
    api.getGNNPredictions().then(setGnnData).catch(() => {});
  }, [status?.current_tick]);

  const counts = topology?.stats || {
    total_devices: 60,
    susceptible: 59,
    exposed: 0,
    infected: 1,
    recovered: 0,
    offline: 0,
    health_score: 98.0,
  };

  const highRiskCount = gnnData?.high_risk_count ?? 1;

  // Segment Risk Distribution for Pie / Bar chart
  const segmentStats = React.useMemo(() => {
    if (!topology) return [];
    const map = new Map<string, { segment: string; total: number; compromised: number }>();
    topology.devices.forEach((d) => {
      const entry = map.get(d.segment) || { segment: d.segment, total: 0, compromised: 0 };
      entry.total += 1;
      if (d.state === 'INFECTED' || d.state === 'EXPOSED') {
        entry.compromised += 1;
      }
      map.set(d.segment, entry);
    });
    return Array.from(map.values());
  }, [topology]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Operations Control Status */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(33,212,253,0.3)]">
              <Activity className="w-7 h-7" />
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                CYBER OPERATIONS COMMAND CENTER
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400">
                LIVE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Active Scenario: <span className="text-cyan-300 font-bold">{status?.scenario || 'Scenario A'}</span> • Seed: {status?.seed ?? 42} • Tick #{status?.current_tick ?? 0}
            </p>
          </div>
        </div>

        {/* Global Security Metrics */}
        <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Network Security Score</span>
            <div className="text-2xl font-mono font-black text-white flex items-center justify-end space-x-1">
              <span>{status?.health_score ?? 98.5}%</span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Reproduction Number (R0)</span>
            <span className={`text-2xl font-mono font-black ${(status?.reproduction_number_r0 ?? 0) >= 1.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {status?.reproduction_number_r0?.toFixed(2) ?? '1.24'}
            </span>
          </div>
        </div>
      </div>

      {/* 6 Core Stat Cards (Module 02 Requirements) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Virtual Devices"
          value={counts.total_devices}
          subtitle="Isolated Subnets"
          icon={Server}
          color="blue"
        />
        <StatCard
          title="Healthy Devices"
          value={counts.susceptible}
          subtitle="Susceptible Clean"
          icon={CheckCircle2}
          color="green"
          trend="Secure"
          trendPositive={true}
        />
        <StatCard
          title="Exposed Devices"
          value={counts.exposed}
          subtitle="Lateral Incubating"
          icon={AlertTriangle}
          color="orange"
          trend={counts.exposed > 0 ? 'Warning' : 'Nominal'}
          trendPositive={counts.exposed === 0}
        />
        <StatCard
          title="Infected Devices"
          value={counts.infected}
          subtitle="Active Compromise"
          icon={Flame}
          color="red"
          trend={counts.infected > 0 ? 'Active' : 'Zero'}
          trendPositive={counts.infected === 0}
        />
        <StatCard
          title="High-Risk Devices"
          value={highRiskCount}
          subtitle="GNN Embedding Risk"
          icon={Cpu}
          color="orange"
        />
        <StatCard
          title="Quarantined / Recovered"
          value={`${counts.offline} / ${counts.recovered}`}
          subtitle="Offline | Clean"
          icon={Shield}
          color="cyan"
        />
      </div>

      {/* Charts & Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: SEIR Epidemic Progression Curve */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>SEIR Epidemic Dynamics Over Time</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                SciPy Differential Equations: Susceptible vs Exposed vs Infected vs Recovered
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('prediction')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center space-x-1"
            >
              <span>Full SEIR Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={seirData?.trajectory || []}>
                <defs>
                  <linearGradient id="colorS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#25D995" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#25D995" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorE" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFAA42" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FFAA42" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4B5C" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#FF4B5C" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#21D4FD" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#21D4FD" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time_label" stroke="#64748b" textAnchor="end" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 60]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b1525', borderColor: '#21D4FD', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="susceptible" stroke="#25D995" fillOpacity={1} fill="url(#colorS)" name="Susceptible" />
                <Area type="monotone" dataKey="exposed" stroke="#FFAA42" fillOpacity={1} fill="url(#colorE)" name="Exposed" />
                <Area type="monotone" dataKey="infected" stroke="#FF4B5C" fillOpacity={1} fill="url(#colorI)" name="Infected" />
                <Area type="monotone" dataKey="recovered" stroke="#21D4FD" fillOpacity={1} fill="url(#colorR)" name="Recovered" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Segment Threat Distribution */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Segment Vulnerability</span>
              </h3>
              <button
                onClick={() => onNavigateTab('network')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center space-x-1"
              >
                <span>3D View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 font-mono mb-4">
              Real-time device distribution across the 5 isolated network subnets.
            </p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={segmentStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="segment" stroke="#64748b" tick={{ fontSize: 9 }} width={90} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b1525', borderColor: '#21D4FD', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="total" fill="#3B82F6" name="Total Devices" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="compromised" fill="#FF4B5C" name="Compromised" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs font-mono text-slate-400 flex justify-between">
            <span>Overall Network Density: &lt;k&gt; = 3.84</span>
            <span className="text-cyan-400 font-bold">5 Subnets Guarded</span>
          </div>
        </div>
      </div>

      {/* Live Event Activity Feed & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Activity Feed */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h3 className="font-bold text-sm text-white">Live Synthetic Network Events</h3>
            </div>
            <button
              onClick={() => onNavigateTab('simulation')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center space-x-1"
            >
              <span>Attack Simulation Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {status?.events && status.events.length > 0 ? (
              status.events.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-start justify-between p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="flex items-start space-x-3">
                    <span
                      className={`mt-0.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        evt.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : evt.severity === 'WARNING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : evt.severity === 'THREAT'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      {evt.severity}
                    </span>
                    <div>
                      <p className="text-xs text-slate-200 font-mono">{evt.description}</p>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1 font-mono">
                        <span>Event: {evt.event_type}</span>
                        {evt.source_device_id && <span>• Source: {evt.source_device_id}</span>}
                        {evt.target_device_id && <span>• Target: {evt.target_device_id}</span>}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap pl-2">
                    Tick #{evt.tick}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs font-mono text-slate-500">
                Awaiting synthetic simulation events...
              </div>
            )}
          </div>
        </div>

        {/* Quick Decision / Recommendation Widget */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-2xl border border-cyan-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2 text-cyan-400">
              <Zap className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white">AI Defence Recommendation</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              RL agent evaluates epidemic parameters and PyTorch GNN node risk to recommend precision isolation without unnecessary disruption.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-2 mb-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono">Pending Alerts:</span>
                <span className="font-mono font-bold text-amber-400">
                  {status?.pending_alerts_count || 0} Alerts Awaiting Approval
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono">Autonomous Policy:</span>
                <span className="font-mono text-emerald-400 font-bold">Deep Q-Network Active</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono">Human Sign-off:</span>
                <span className="font-mono text-cyan-300 font-bold">MANDATORY</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('defence')}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(33,212,253,0.3)] transition flex items-center justify-center space-x-2"
          >
            <span>Review Active Threats & Approve</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

