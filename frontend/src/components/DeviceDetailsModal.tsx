import React, { useEffect, useState } from 'react';
import {
  X,
  Shield,
  ShieldAlert,
  Activity,
  Network,
  Cpu,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  Server,
  Laptop,
  Monitor,
  Database,
  Router
} from 'lucide-react';
import { Device } from '../types';
import { api } from '../services/api';
import { useSimulation } from '../contexts/SimulationContext';

interface DeviceDetailsModalProps {
  device: Device | null;
  onClose: () => void;
}

export const DeviceDetailsModal: React.FC<DeviceDetailsModalProps> = ({ device, onClose }) => {
  const { refreshAll } = useSimulation();
  const [details, setDetails] = useState<{ device: Device; neighbors: any[]; recent_events: any[] } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (device) {
      api.getDeviceDetails(device.id).then(setDetails).catch(() => {});
    } else {
      setDetails(null);
    }
  }, [device]);

  if (!device) return null;

  const handleAction = async (actionType: 'APPROVE_ISOLATION' | 'BLOCK_CONNECTION' | 'RECOVER') => {
    setActionLoading(true);
    setActionFeedback(null);
    try {
      if (actionType === 'RECOVER') {
        const res = await api.recoverDevice(`ALT-${device.id}`, device.id);
        setActionFeedback(res.message);
      } else {
        const res = await api.approveDefenceAction(`ALT-${device.id}`, device.id, actionType);
        setActionFeedback(res.message);
      }
      await refreshAll();
      const updated = await api.getDeviceDetails(device.id);
      setDetails(updated);
    } catch (err: any) {
      setActionFeedback(`Action error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getDeviceIcon = () => {
    switch (device.device_type) {
      case 'server': return Server;
      case 'database_server': return Database;
      case 'router':
      case 'gateway': return Router;
      case 'laptop': return Laptop;
      default: return Monitor;
    }
  };

  const Icon = getDeviceIcon();

  const stateColors: Record<string, string> = {
    SUSCEPTIBLE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    EXPOSED: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    INFECTED: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    RECOVERED: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    OFFLINE: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
  };

  return (
    <div className="absolute top-4 right-4 z-40 w-96 max-w-[calc(100vw-2rem)] glass-panel border border-cyan-500/30 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.7)] p-5 text-white animate-in slide-in-from-right-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white font-mono">{device.name}</h3>
            <span className="text-[11px] text-slate-400 font-mono">{device.id}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Status & Segment */}
      <div className="grid grid-cols-2 gap-2 my-3">
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">SEIR Status</span>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-mono font-bold border ${stateColors[device.state]}`}>
            {device.state}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Network Segment</span>
          <span className="text-xs font-semibold text-slate-200 mt-1 block truncate">
            {device.segment}
          </span>
        </div>
      </div>

      {/* Network Attributes */}
      <div className="space-y-1.5 text-xs font-mono bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 mb-3">
        <div className="flex justify-between">
          <span className="text-slate-400">IP Address:</span>
          <span className="text-cyan-300 font-bold">{device.ip_address}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">MAC Address:</span>
          <span className="text-slate-300">{device.mac_address}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Device Type:</span>
          <span className="text-slate-300 uppercase">{device.device_type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">3D Position:</span>
          <span className="text-slate-400">({device.pos_x}, {device.pos_y}, {device.pos_z})</span>
        </div>
      </div>

      {/* Risk and Health Gauges */}
      <div className="space-y-3 mb-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400 font-mono">Device Risk Score</span>
            <span className={`font-mono font-bold ${device.risk_score > 0.7 ? 'text-rose-400' : (device.risk_score > 0.4 ? 'text-amber-400' : 'text-emerald-400')}`}>
              {(device.risk_score * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                device.risk_score > 0.7
                  ? 'bg-rose-500'
                  : device.risk_score > 0.4
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, device.risk_score * 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400 font-mono">System Integrity / Health</span>
            <span className="font-mono text-slate-200">{device.health.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${device.health}%` }}
            />
          </div>
        </div>
      </div>

      {/* Connected Neighbors list */}
      {details?.neighbors && details.neighbors.length > 0 && (
        <div className="mb-4">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5 font-mono">
            Connected Topology Peers ({details.neighbors.length})
          </span>
          <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
            {details.neighbors.map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between px-2 py-1 rounded bg-slate-900/60 border border-slate-800 text-[11px] font-mono"
              >
                <span className="text-slate-300 truncate">{n.name}</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${stateColors[n.state]}`}>
                  {n.state}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action feedback message */}
      {actionFeedback && (
        <div className="p-2 mb-3 rounded-lg text-xs font-mono bg-cyan-950/60 border border-cyan-500/40 text-cyan-200">
          {actionFeedback}
        </div>
      )}

      {/* Interactive Defence Actions */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
        {device.state !== 'OFFLINE' ? (
          <button
            onClick={() => handleAction('APPROVE_ISOLATION')}
            disabled={actionLoading}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-rose-600/20 text-rose-300 border border-rose-500/50 hover:bg-rose-600/30 transition disabled:opacity-50"
          >
            <WifiOff className="w-3.5 h-3.5" />
            <span>Isolate Host</span>
          </button>
        ) : (
          <button
            onClick={() => handleAction('RECOVER')}
            disabled={actionLoading}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 hover:bg-cyan-500/30 transition disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Restore & Patch</span>
          </button>
        )}

        <button
          onClick={() => handleAction('BLOCK_CONNECTION')}
          disabled={actionLoading}
          className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30 transition disabled:opacity-50"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Block Ports</span>
        </button>
      </div>
    </div>
  );
};

