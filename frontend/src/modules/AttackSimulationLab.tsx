import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  FastForward,
  Shield,
  Activity,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  Sliders,
  FileText
} from 'lucide-react';
import { useSimulation } from '../contexts/SimulationContext';
import { StatCard } from '../components/StatCard';

export const AttackSimulationLab: React.FC = () => {
  const {
    status,
    scenarios,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
    stepSimulation,
  } = useSimulation();

  const [selectedScenario, setSelectedScenario] = useState<string>(
    status?.scenario || 'Scenario A: Single Device Infection'
  );
  const [speed, setSpeed] = useState<number>(status?.speed || 1.0);
  const [seed, setSeed] = useState<number>(status?.seed || 42);

  const handleScenarioChange = async (scName: string) => {
    setSelectedScenario(scName);
    const targetSc = scenarios.find((s) => s.name === scName);
    const newSeed = targetSc?.recommended_seed || 42;
    setSeed(newSeed);
    await resetSimulation(scName, newSeed);
  };

  const handleStart = async () => {
    await startSimulation(selectedScenario, seed, speed);
  };

  const handleReset = async () => {
    await resetSimulation(selectedScenario, seed);
  };

  const currentScObj = scenarios.find((s) => s.name === selectedScenario);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controls Console */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(33,212,253,0.3)]">
              <Play className="w-6 h-6 fill-cyan-400/20" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  CYBER ATTACK SIMULATION LAB
                </h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    status?.status === 'RUNNING'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500 animate-pulse'
                      : status?.status === 'PAUSED'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {status?.status || 'IDLE'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Safe, isolated virtual testbed • Zero external network packets • Reproducible seeded pseudorandom engine
              </p>
            </div>
          </div>

          {/* Interactive Playback Control Buttons */}
          <div className="flex items-center space-x-2">
            {status?.status === 'RUNNING' ? (
              <button
                onClick={pauseSimulation}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition shadow-lg"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(37,217,149,0.4)] transition"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{status?.status === 'PAUSED' ? 'Resume' : 'Start Simulation'}</span>
              </button>
            )}

            <button
              onClick={stepSimulation}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition"
              title="Advance 1 Tick"
            >
              <StepForward className="w-4 h-4" />
              <span>Step</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white transition"
              title="Reset Simulation"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Configuration Bar: Scenario Selector, Seed, Speed */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Scenario Selector */}
          <div className="md:col-span-6 space-y-1.5">
            <label className="block text-xs font-mono text-slate-300">
              Select Simulation Scenario:
            </label>
            <select
              value={selectedScenario}
              onChange={(e) => handleScenarioChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.name} className="bg-slate-900">
                  {sc.name} ({sc.difficulty})
                </option>
              ))}
            </select>
          </div>

          {/* Random Seed for Reproducibility */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-xs font-mono text-slate-300">
              Random Seed (Reproducibility):
            </label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(parseInt(e.target.value) || 42)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Simulation Speed */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-xs font-mono text-slate-300">
              Playback Speed: <span className="text-cyan-300 font-bold">{speed}x</span>
            </label>
            <div className="flex items-center space-x-1">
              {[0.5, 1.0, 2.0, 5.0].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                    speed === s
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Scenario Briefing Card */}
        {currentScObj && (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start space-x-3 text-xs font-mono">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 mt-0.5">
              <FileText className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">{currentScObj.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-300 border border-slate-700">
                  Target: {currentScObj.primary_target}
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">{currentScObj.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Attack Timeline Visualization (Requirement) */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Simulation Attack Progression Timeline</h3>
          </div>
          <span className="text-xs font-mono text-cyan-300 font-bold">
            Current Tick: #{status?.current_tick || 0}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-rose-500/40 text-xs font-mono space-y-1">
            <span className="text-[10px] text-rose-400 font-bold uppercase block">1. Patient Zero</span>
            <span className="text-white font-bold block truncate">{currentScObj?.primary_target || 'DEV-LAB-PC01'}</span>
            <span className="text-slate-400 text-[11px] block">Initial compromise vector</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-amber-500/40 text-xs font-mono space-y-1">
            <span className="text-[10px] text-amber-400 font-bold uppercase block">2. Exposed Nodes</span>
            <span className="text-white font-bold block">{status?.exposed_count ?? 0} Incubating</span>
            <span className="text-slate-400 text-[11px] block">Lateral SYN/RPC discovery</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-purple-500/40 text-xs font-mono space-y-1">
            <span className="text-[10px] text-purple-400 font-bold uppercase block">3. GNN High-Risk</span>
            <span className="text-white font-bold block">Graph Embeddings</span>
            <span className="text-slate-400 text-[11px] block">Message passing warning</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-cyan-500/40 text-xs font-mono space-y-1">
            <span className="text-[10px] text-cyan-400 font-bold uppercase block">4. Containment</span>
            <span className="text-white font-bold block">{status?.offline_count ?? 0} Quarantined</span>
            <span className="text-slate-400 text-[11px] block">RL Isolation approved</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-500/40 text-xs font-mono space-y-1">
            <span className="text-[10px] text-emerald-400 font-bold uppercase block">5. Restored Clean</span>
            <span className="text-white font-bold block">{status?.recovered_count ?? 0} Recovered</span>
            <span className="text-slate-400 text-[11px] block">Disinfected & patched</span>
          </div>
        </div>
      </div>

      {/* Complete Event Stream History */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Complete Event Stream History ({status?.events?.length || 0})</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Recorded Seed: {status?.seed || 42}
          </span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {status?.events && status.events.length > 0 ? (
            status.events.map((evt) => (
              <div
                key={evt.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start justify-between text-xs font-mono"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : evt.severity === 'WARNING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      {evt.severity}
                    </span>
                    <span className="font-bold text-white">{evt.event_type}</span>
                    <span className="text-slate-500">[{evt.timestamp}]</span>
                  </div>
                  <p className="text-slate-300">{evt.description}</p>
                </div>
                <span className="text-slate-500 font-bold whitespace-nowrap pl-3">
                  Tick #{evt.tick}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs font-mono">
              Simulation event log initialized. Start simulation to generate live telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

