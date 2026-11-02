import React, { useState } from 'react';
import {
  Network,
  Search,
  Filter,
  Layers,
  RotateCw,
  Info,
  Shield,
  Eye,
  Server,
  Monitor,
  Laptop,
  Database,
  Router
} from 'lucide-react';
import { useSimulation } from '../contexts/SimulationContext';
import { NetworkCanvas3D } from '../three/NetworkCanvas3D';
import { DeviceDetailsModal } from '../components/DeviceDetailsModal';
import { Device } from '../types';

export const NetworkVisualization: React.FC = () => {
  const { topology, selectedDevice, setSelectedDevice, refreshAll } = useSimulation();

  const [filterSegment, setFilterSegment] = useState<string>('ALL');
  const [filterState, setFilterState] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showLegend, setShowLegend] = useState<boolean>(true);

  const devices = topology?.devices || [];
  const connections = topology?.connections || [];
  const segments = ['ALL', ...(topology?.segments || [])];

  const stateFilters = [
    { label: 'All States', value: 'ALL' },
    { label: 'Susceptible (Healthy)', value: 'SUSCEPTIBLE', color: '#25D995' },
    { label: 'Exposed (High Risk)', value: 'EXPOSED', color: '#FFAA42' },
    { label: 'Infected (Active)', value: 'INFECTED', color: '#FF4B5C' },
    { label: 'Recovered (Clean)', value: 'RECOVERED', color: '#21D4FD' },
    { label: 'Isolated (Offline)', value: 'OFFLINE', color: '#64748B' },
  ];

  return (
    <div className="relative w-full h-[calc(100vh-8.5rem)] rounded-3xl overflow-hidden glass-panel border border-cyan-500/30">
      {/* 3D Canvas Viewport */}
      <NetworkCanvas3D
        devices={devices}
        connections={connections}
        selectedDevice={selectedDevice}
        onSelectDevice={(dev) => setSelectedDevice(dev)}
        filterSegment={filterSegment}
        filterState={filterState}
        searchQuery={searchQuery}
      />

      {/* Top Filter and Search Control HUD */}
      <div className="absolute top-4 left-4 z-30 flex flex-wrap items-center gap-2 max-w-[calc(100%-2rem)]">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Device ID, Name, IP..."
            className="bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 font-mono w-56 shadow-lg"
          />
        </div>

        {/* Segment Selector */}
        <div className="flex items-center space-x-1 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-lg">
          <Layers className="w-3.5 h-3.5 text-slate-400 ml-2" />
          <select
            value={filterSegment}
            onChange={(e) => setFilterSegment(e.target.value)}
            className="bg-transparent text-xs text-slate-200 font-mono py-1 pr-2 pl-1 focus:outline-none cursor-pointer"
          >
            {segments.map((seg) => (
              <option key={seg} value={seg} className="bg-slate-900 text-white">
                {seg === 'ALL' ? 'All Segments (60 Nodes)' : seg}
              </option>
            ))}
          </select>
        </div>

        {/* State Filter Selector */}
        <div className="flex items-center space-x-1 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-lg">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="bg-transparent text-xs text-slate-200 font-mono py-1 pr-2 pl-1 focus:outline-none cursor-pointer"
          >
            {stateFilters.map((st) => (
              <option key={st.value} value={st.value} className="bg-slate-900 text-white">
                {st.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reload / Refresh Button */}
        <button
          onClick={() => refreshAll()}
          className="p-2.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 shadow-lg transition"
          title="Refresh 3D Topology"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Bottom Left Legend */}
      {showLegend && (
        <div className="absolute bottom-4 left-4 z-30 glass-panel p-3.5 rounded-2xl border border-slate-800 backdrop-blur-md max-w-xs text-xs font-mono space-y-2 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-slate-300 flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>3D State Legend</span>
            </span>
            <button
              onClick={() => setShowLegend(false)}
              className="text-[10px] text-slate-500 hover:text-slate-300"
            >
              Hide
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#25D995] shadow-[0_0_8px_#25D995]" />
              <span className="text-slate-300">Susceptible (Clean)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFAA42] shadow-[0_0_8px_#FFAA42]" />
              <span className="text-slate-300">Exposed (Risk)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF4B5C] shadow-[0_0_8px_#FF4B5C] animate-pulse" />
              <span className="text-slate-300">Infected (Active)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#21D4FD] shadow-[0_0_8px_#21D4FD]" />
              <span className="text-slate-300">Recovered (Safe)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#64748B]" />
              <span className="text-slate-400">Offline (Quarantine)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-0.5 bg-cyan-400" />
              <span className="text-slate-300">LAN / Gateway Edge</span>
            </div>
          </div>
          <div className="pt-1 text-[10px] text-slate-400 border-t border-slate-800">
            Click any device node to open inspection drawer.
          </div>
        </div>
      )}

      {/* Device Details Side Drawer (when a node is clicked) */}
      <DeviceDetailsModal
        device={selectedDevice}
        onClose={() => setSelectedDevice(null)}
      />
    </div>
  );
};

