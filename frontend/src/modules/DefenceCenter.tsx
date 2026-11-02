import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  WifiOff,
  Radio,
  Clock,
  AlertTriangle,
  History,
  Lock,
  ArrowRight,
  Eye
} from 'lucide-react';
import { api } from '../services/api';
import { DefenceAlert, AuditLog } from '../types';
import { useSimulation } from '../contexts/SimulationContext';

export const DefenceCenter: React.FC = () => {
  const { status, refreshAll, setSelectedDevice, topology } = useSimulation();
  const [alerts, setAlerts] = useState<DefenceAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<DefenceAlert | null>(null);
  const [actionInProgress, setActionInProgress] = useState<boolean>(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    alert: DefenceAlert | null;
    action: string;
    title: string;
    description: string;
  }>({
    isOpen: false,
    alert: null,
    action: '',
    title: '',
    description: '',
  });

  const loadData = async () => {
    try {
      const alertRes = await api.getAlerts();
      setAlerts(alertRes.alerts);
      const auditRes = await api.getAuditLogs();
      setAuditLogs(auditRes.logs);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadData();
  }, [status?.current_tick]);

  const handleOpenConfirm = (alert: DefenceAlert, action: string) => {
    let title = 'Confirm Security Action';
    let desc = `Are you sure you want to execute ${action} on virtual host ${alert.device_id}?`;
    if (action === 'APPROVE_ISOLATION') {
      title = 'Approve Virtual Host Isolation';
      desc = `This will isolate ${alert.device_name} (${alert.device_id}) from network segment '${alert.segment}'. Its virtual network interface will be deactivated.`;
    } else if (action === 'BLOCK_CONNECTION') {
      title = 'Sever Network Links';
      desc = `Deploy firewall egress filtering to drop all packets to and from ${alert.device_id}.`;
    } else if (action === 'REJECT') {
      title = 'Dismiss AI Recommendation';
      desc = `Reject containment recommendation for ${alert.device_id}. The host will remain connected.`;
    } else if (action === 'RECOVER') {
      title = 'Initiate Automated Node Recovery';
      desc = `Flash clean image and apply zero-day patch signatures to ${alert.device_id}.`;
    }

    setConfirmDialog({
      isOpen: true,
      alert,
      action,
      title,
      description: desc,
    });
  };

  const handleExecuteAction = async () => {
    if (!confirmDialog.alert) return;
    setActionInProgress(true);
    try {
      if (confirmDialog.action === 'RECOVER') {
        await api.recoverDevice(confirmDialog.alert.id, confirmDialog.alert.device_id);
      } else if (confirmDialog.action === 'REJECT') {
        await api.rejectDefenceAction(confirmDialog.alert.id, confirmDialog.alert.device_id);
      } else {
        await api.approveDefenceAction(
          confirmDialog.alert.id,
          confirmDialog.alert.device_id,
          confirmDialog.action
        );
      }
      await refreshAll();
      await loadData();
    } catch (err: any) {
      alert(`Defence Execution Failed: ${err.message}`);
    } finally {
      setActionInProgress(false);
      setConfirmDialog({ isOpen: false, alert: null, action: '', title: '', description: '' });
    }
  };

  const pendingAlerts = alerts.filter((a) => a.status === 'PENDING');
  const resolvedAlerts = alerts.filter((a) => a.status !== 'PENDING');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-400/40 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(255,75,92,0.3)]">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                AI DEFENCE COMMAND & HUMAN APPROVAL
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500">
                GOVERNANCE ENFORCED
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Human-in-the-loop authorization required for all network quarantine and packet filtering actions
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">Awaiting Sign-off:</span>
            <span className="text-xl font-bold text-amber-400">{pendingAlerts.length} Alerts</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">Audit Actions:</span>
            <span className="text-xl font-bold text-cyan-300">{auditLogs.length} Executed</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Threats & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Threat Queue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Pending Incident Approvals ({pendingAlerts.length})</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Real-time RL Queue</span>
          </div>

          <div className="space-y-3">
            {pendingAlerts.length > 0 ? (
              pendingAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="glass-panel p-5 rounded-2xl border border-rose-500/30 hover:border-rose-400/60 transition shadow-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50">
                          {alert.severity} SEVERITY
                        </span>
                        <span className="text-xs font-bold text-white font-mono">{alert.device_name}</span>
                        <span className="text-xs text-cyan-400 font-mono">[{alert.device_id}]</span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        Segment: {alert.segment} • Threat ID: {alert.threat_id}
                      </p>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-[10px] text-slate-400 block">Risk Score</span>
                      <span className="text-sm font-bold text-rose-400">
                        {(alert.risk_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 font-mono bg-slate-950/70 p-3 rounded-xl border border-slate-800 leading-relaxed">
                    <span className="text-cyan-300 font-bold">AI Diagnosis: </span>
                    {alert.reason}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400 font-mono">Recommended:</span>
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-cyan-300">
                        {alert.recommended_action}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenConfirm(alert, 'REJECT')}
                        className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 transition"
                      >
                        Dismiss
                      </button>

                      <button
                        onClick={() => handleOpenConfirm(alert, 'BLOCK_CONNECTION')}
                        className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition"
                      >
                        Block Ports
                      </button>

                      <button
                        onClick={() => handleOpenConfirm(alert, 'APPROVE_ISOLATION')}
                        className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(255,75,92,0.4)] transition"
                      >
                        Approve Isolation
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-sm text-white">Threat Queue Clear</h4>
                <p className="text-xs text-slate-400 font-mono">
                  All active alerts have been resolved. No quarantined nodes awaiting human review.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tamper-Evident Audit Log */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Security Governance Audit Log</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">{auditLogs.length} Records</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs font-mono space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-300">{log.details}</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                    <span>Target: {log.target_id}</span>
                    <span className="text-cyan-400">By: {log.performed_by}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                Audit trail initialized. Approved actions will be permanently recorded here.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-cyan-500/40 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">{confirmDialog.title}</h3>
                <span className="text-[11px] text-slate-400 font-mono">Human-in-the-loop verification</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              {confirmDialog.description}
            </p>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setConfirmDialog({ isOpen: false, alert: null, action: '', title: '', description: '' })}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                disabled={actionInProgress}
                className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_15px_rgba(33,212,253,0.4)] transition disabled:opacity-50"
              >
                {actionInProgress ? 'Executing...' : 'Authorize Execution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

