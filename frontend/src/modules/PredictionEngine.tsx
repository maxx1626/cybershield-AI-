import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Activity,
  Shield,
  Layers,
  Zap,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle2,
  BrainCircuit,
  Sliders,
  Scale
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { SEIRModelResponse, GNNResponse, RecommendationsResponse } from '../types';
import { useSimulation } from '../contexts/SimulationContext';

export const PredictionEngine: React.FC = () => {
  const { status } = useSimulation();
  const [seirData, setSeirData] = useState<SEIRModelResponse | null>(null);
  const [gnnData, setGnnData] = useState<GNNResponse | null>(null);
  const [rlData, setRlData] = useState<RecommendationsResponse | null>(null);
  const [activeSection, setActiveSection] = useState<'SEIR' | 'GNN' | 'RL'>('SEIR');
  const [policyMode, setPolicyMode] = useState<'RL_POLICY' | 'RULE_BASED_BASELINE'>('RL_POLICY');
  const [timeHorizon, setTimeHorizon] = useState<number>(30);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.getSEIRModel(timeHorizon).then(setSeirData),
      api.getGNNPredictions().then(setGnnData),
      api.getRecommendations(policyMode).then(setRlData),
    ]).finally(() => setIsLoading(false));
  }, [status?.current_tick, timeHorizon, policyMode]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Engine Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-400/40 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                AI PREDICTION & EPIDEMIOLOGICAL ENGINE
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500">
                TRI-CORE AI ARCHITECTURE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              SEIR Differential Equations • PyTorch Spectral GCN • Deep Reinforcement Learning Policy
            </p>
          </div>
        </div>

        {/* Section Navigation Pills */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSection('SEIR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
              activeSection === 'SEIR'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(33,212,253,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            A. SEIR Model
          </button>
          <button
            onClick={() => setActiveSection('GNN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
              activeSection === 'GNN'
                ? 'bg-purple-500 text-slate-950 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            B. Graph Neural Network
          </button>
          <button
            onClick={() => setActiveSection('RL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
              activeSection === 'RL'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(37,217,149,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            C. Reinforcement Learning
          </button>
        </div>
      </div>

      {/* SECTION A: SEIR EPIDEMIC MODEL */}
      {activeSection === 'SEIR' && (
        <div className="space-y-6">
          {/* Explanation Banner */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Computer Network SEIR Mathematical Formulation</span>
              </h3>
              <span className="text-xs font-mono text-cyan-300">
                Basic Reproduction Number: R0 = {seirData?.parameters.reproduction_number_r0.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/30">
                <span className="font-bold text-emerald-400 block mb-1">S = Susceptible ({seirData?.current_state.susceptible})</span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Uninfected virtual endpoints with operational network stacks. dS/dt = -β · (S · I) / N
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-500/30">
                <span className="font-bold text-amber-400 block mb-1">E = Exposed ({seirData?.current_state.exposed})</span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Nodes exposed to lateral communication; payload in incubation latency (σ). dE/dt = β·(SI)/N - σE
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-500/30">
                <span className="font-bold text-rose-400 block mb-1">I = Infected ({seirData?.current_state.infected})</span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Active malicious execution; transmitting lateral probes. dI/dt = σE - (γ + μ)·I
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-cyan-500/30">
                <span className="font-bold text-cyan-400 block mb-1">R = Recovered ({seirData?.current_state.recovered})</span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Disinfected hosts with verified patched firmware and immunity. dR/dt = (γ + μ)·I
                </p>
              </div>
            </div>

            {/* Dynamic Graph Parameter Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Propagation Rate (β):</span>
                <span className="text-white font-bold">{seirData?.parameters.beta_transmission_rate} / tick</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Latency Rate (σ):</span>
                <span className="text-white font-bold">{seirData?.parameters.sigma_latency_rate} / tick</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Base Patch Rate (γ):</span>
                <span className="text-white font-bold">{seirData?.parameters.gamma_recovery_rate} / tick</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Isolation Damping (μ):</span>
                <span className="text-cyan-300 font-bold">{seirData?.parameters.mu_isolation_rate} / tick</span>
              </div>
            </div>
          </div>

          {/* Numerical Integration Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">ODE Solved Numerical Trajectory (SciPy RK45)</h4>
                <p className="text-xs text-slate-400 font-mono">
                  30-step forward integration based on graph topology density and active firewalls
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {[15, 30, 45].map((steps) => (
                  <button
                    key={steps}
                    onClick={() => setTimeHorizon(steps)}
                    className={`px-2.5 py-1 rounded text-xs font-mono ${
                      timeHorizon === steps
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
                        : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    T+{steps}s
                  </button>
                ))}
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={seirData?.trajectory || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time_label" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 60]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b1525', borderColor: '#21D4FD', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="susceptible" stroke="#25D995" strokeWidth={2.5} dot={false} name="Susceptible (S)" />
                  <Line type="monotone" dataKey="exposed" stroke="#FFAA42" strokeWidth={2.5} dot={false} name="Exposed (E)" />
                  <Line type="monotone" dataKey="infected" stroke="#FF4B5C" strokeWidth={2.5} dot={false} name="Infected (I)" />
                  <Line type="monotone" dataKey="recovered" stroke="#21D4FD" strokeWidth={2.5} dot={false} name="Recovered (R)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* SECTION B: GRAPH NEURAL NETWORK */}
      {activeSection === 'GNN' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>PyTorch Spectral Graph Convolutional Network (GCN) Risk Scoring</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Message passing over normalized adjacency Â = D̃^(-½) · Ã · D̃^(-½) with node attribute aggregation
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
                  Total Analyzed: {gnnData?.total_nodes_analyzed} Nodes
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  High Risk: {gnnData?.high_risk_count} Nodes
                </span>
              </div>
            </div>

            {/* GNN Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                    <th className="py-2.5 px-3">Device ID & Name</th>
                    <th className="py-2.5 px-3">Segment</th>
                    <th className="py-2.5 px-3">GNN Risk Score</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Model Confidence</th>
                    <th className="py-2.5 px-3">Explainable Root Cause</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {gnnData?.predictions.slice(0, 15).map((pred) => (
                    <tr key={pred.device_id} className="hover:bg-slate-900/40 transition">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-white">{pred.device_id}</div>
                        <div className="text-[10px] text-slate-400">{pred.device_name}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{pred.segment}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                pred.risk_score >= 0.7
                                  ? 'bg-rose-500'
                                  : pred.risk_score >= 0.4
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-400'
                              }`}
                              style={{ width: `${pred.risk_score * 100}%` }}
                            />
                          </div>
                          <span className="font-bold text-white">{(pred.risk_score * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            pred.risk_category === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : pred.risk_category === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : pred.risk_category === 'MODERATE'
                              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {pred.risk_category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-cyan-300 font-bold">
                        {(pred.confidence * 100).toFixed(0)}%
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 text-[11px] max-w-xs truncate">
                        {pred.primary_risk_factor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pt-2 text-[11px] font-mono text-slate-400 border-t border-slate-800">
              Note: GNN predictions model latent contagion propagation over graph topology, distinguishing early incubation risk before confirmed malware payload execution.
            </div>
          </div>
        </div>
      )}

      {/* SECTION C: REINFORCEMENT LEARNING */}
      {activeSection === 'RL' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span>RL Defense Decision Policy & Benchmark Comparison</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Markov Decision Process agent trained over 50,000 synthetic attack simulations
                </p>
              </div>

              {/* Policy Toggle */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setPolicyMode('RL_POLICY')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    policyMode === 'RL_POLICY'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Adaptive RL Policy
                </button>
                <button
                  onClick={() => setPolicyMode('RULE_BASED_BASELINE')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    policyMode === 'RULE_BASED_BASELINE'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Rule-Based Baseline
                </button>
              </div>
            </div>

            {/* Documented Reward Function Specification (Prompt Requirement) */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs font-mono">
              <span className="font-bold text-cyan-300 block">Documented MDP Reward Function:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 text-[11px]">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-emerald-400 font-bold">+12.0</span> per prevented infection spread (ΔI)
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-cyan-400 font-bold">+15.0</span> per verified healthy node recovery
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-rose-400 font-bold">-8.0</span> False-positive isolation penalty (healthy host)
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-amber-400 font-bold">-5.0</span> Operational friction penalty (disrupting gateway/router)
                </div>
              </div>
            </div>

            {/* Selected Action Card */}
            {rlData?.active_decision && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400 font-mono">Selected Action:</span>
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400 font-mono font-bold text-sm">
                      {rlData.active_decision.selected_action}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-mono">Policy Confidence:</span>
                    <span className="text-emerald-400 font-mono font-bold ml-1.5">
                      {(rlData.active_decision.policy_confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-200 font-mono leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {rlData.active_decision.reason}
                </p>

                {/* Q-Values Breakdown */}
                <div>
                  <span className="text-xs font-mono text-slate-400 block mb-2">Action Q-Values Spectrum:</span>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs font-mono">
                    {Object.entries(rlData.active_decision.q_values).map(([act, qval]) => (
                      <div
                        key={act}
                        className={`p-2 rounded-lg border text-center ${
                          act === rlData.active_decision.selected_action
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="text-[10px] block truncate">{act}</span>
                        <span className="text-sm font-bold">{qval.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

