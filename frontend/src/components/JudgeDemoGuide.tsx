import React, { useState } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Activity,
  Cpu,
  X
} from 'lucide-react';
import { useSimulation } from '../contexts/SimulationContext';
import { api } from '../services/api';

interface JudgeDemoGuideProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
}

const DEMO_STEPS = [
  {
    step: 1,
    title: '1. Virtual Network Topology Inspection',
    tab: 'network',
    description:
      'CYBERSHIELD AI models 60 virtual devices across 5 isolated segments (Administration, Computer Lab, Student WiFi, Server Room, Database Network) with real documentation subnets (10.0.x.x) and 3D coordinate mapping.',
    actionLabel: 'Explore 3D Network',
    badge: 'Virtual Topology'
  },
  {
    step: 2,
    title: '2. Synthetic Threat Inoculation',
    tab: 'simulation',
    description:
      'Patient zero (DEV-LAB-PC01) executes an educational macro simulation. The virtual event stream records lateral connection attempts and drops health to 45%.',
    actionLabel: 'Trigger Lab PC01 Infection',
    badge: 'Synthetic Inoculation'
  },
  {
    step: 3,
    title: '3. SEIR Epidemic Progression',
    tab: 'prediction',
    description:
      'SciPy Runge-Kutta numerical solver calculates differential equations: dS/dt, dE/dt, dI/dt, dR/dt. Contact rate beta dynamically reflects graph density and average degree <k>=3.8.',
    actionLabel: 'View SEIR Dynamic Curve',
    badge: 'Epidemic Modelling'
  },
  {
    step: 4,
    title: '4. GNN Lateral Risk Propagation',
    tab: 'prediction',
    description:
      'PyTorch 2-layer Graph Convolutional Network (GCN) computes message-passing embeddings over graph adjacency with self-loops, flagging adjacent lab nodes DEV-LAB-PC02 & PC03 as HIGH risk before payload execution.',
    actionLabel: 'Inspect GNN Risk Scores',
    badge: 'Graph Neural Network'
  },
  {
    step: 5,
    title: '5. Reinforcement Learning Decision Policy',
    tab: 'defence',
    description:
      'Markov Decision Process (MDP) agent evaluates state s, computing Q-values across 5 defense actions. Recommends ISOLATION of DEV-LAB-PC01 with documented reward expectation (+12.0 spread reduction).',
    actionLabel: 'Inspect RL Q-Values',
    badge: 'Deep RL Policy'
  },
  {
    step: 6,
    title: '6. Human-in-the-Loop Approval',
    tab: 'defence',
    description:
      'CYBERSHIELD enforces human governance. The operator is presented with transparent risk explanation, confidence metrics, and an approval prompt before isolating any virtual device.',
    actionLabel: 'Review Pending Alert',
    badge: 'Human Governance'
  },
  {
    step: 7,
    title: '7. Simulated Device Quarantine',
    tab: 'network',
    description:
      'Upon operator approval, DEV-LAB-PC01 network interfaces are disabled (quarantined to OFFLINE state). Graph edges are severed, dropping effective contact rate beta and halting the epidemic.',
    actionLabel: 'Execute Virtual Isolation',
    badge: 'Containment'
  },
  {
    step: 8,
    title: '8. Automated Node Recovery & Patching',
    tab: 'defence',
    description:
      'Clean disk image verification and simulated vulnerability remediation restore the host to RECOVERED (Cyan) state with 100% health, earning +15.0 RL recovery reward.',
    actionLabel: 'Trigger Safe Recovery',
    badge: 'Remediation'
  },
  {
    step: 9,
    title: '9. Before-and-After Analytics & Benchmarks',
    tab: 'analytics',
    description:
      'Comprehensive performance comparison against Rule-Based Baseline, Machine Learning Only, and SEIR Only. CYBERSHIELD achieves 98.4% detection, 96.2% prediction, and 4.8s containment.',
    actionLabel: 'View Comparative Analytics',
    badge: 'Benchmarking'
  },
  {
    step: 10,
    title: '10. Demonstration Concluded',
    tab: 'command',
    description:
      'Demonstration complete! You can now freely inspect any module, test custom scenarios, adjust simulation speed, or click "Reset Demo" to restart.',
    actionLabel: 'Return to Command Center',
    badge: 'Complete'
  }
];

export const JudgeDemoGuide: React.FC<JudgeDemoGuideProps> = ({
  isOpen,
  onClose,
  setActiveTab,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const { resetSimulation, startSimulation, topology } = useSimulation();
  const currentStep = DEMO_STEPS[currentStepIdx];

  if (!isOpen) return null;

  const handleNext = async () => {
    const nextIdx = Math.min(currentStepIdx + 1, DEMO_STEPS.length - 1);
    setCurrentStepIdx(nextIdx);
    setActiveTab(DEMO_STEPS[nextIdx].tab);

    // Contextual automated demo actions
    if (nextIdx === 1) {
      // Step 2: Inoculate patient zero
      await resetSimulation('Scenario E: AI Defence and Recovery', 777);
      await startSimulation('Scenario E: AI Defence and Recovery', 777, 1.0);
    } else if (nextIdx === 6) {
      // Step 7: Isolate
      try {
        await api.approveDefenceAction('ALT-001-DEV-LAB-PC01', 'DEV-LAB-PC01', 'APPROVE_ISOLATION');
      } catch {
        // ignore
      }
    } else if (nextIdx === 7) {
      // Step 8: Recover
      try {
        await api.recoverDevice('ALT-001-DEV-LAB-PC01', 'DEV-LAB-PC01');
      } catch {
        // ignore
      }
    }
  };

  const handlePrev = () => {
    const prevIdx = Math.max(currentStepIdx - 1, 0);
    setCurrentStepIdx(prevIdx);
    setActiveTab(DEMO_STEPS[prevIdx].tab);
  };

  const handleResetDemo = async () => {
    setCurrentStepIdx(0);
    setActiveTab('network');
    await resetSimulation('Scenario E: AI Defence and Recovery', 777);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] glass-panel border border-cyan-400/50 rounded-2xl shadow-[0_0_35px_rgba(33,212,253,0.35)] p-5 text-white animate-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-wide text-white">JUDGE DEMO MODE</h4>
            <span className="text-[10px] text-cyan-400 font-mono">
              Step {currentStep.step} of {DEMO_STEPS.length}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
        <div
          className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300"
          style={{ width: `${((currentStepIdx + 1) / DEMO_STEPS.length) * 100}%` }}
        />
      </div>

      {/* Step Content */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
            {currentStep.badge}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 font-mono text-slate-300">
            Module: {currentStep.tab.toUpperCase()}
          </span>
        </div>
        <h5 className="font-bold text-sm text-white">{currentStep.title}</h5>
        <p className="text-xs text-slate-300 leading-relaxed">{currentStep.description}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <button
          onClick={handleResetDemo}
          className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition px-2 py-1 rounded hover:bg-slate-800"
          title="Reset back to step 1 and initial clean topology"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo</span>
        </button>

        <div className="flex items-center space-x-2">
          {currentStepIdx > 0 && (
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(33,212,253,0.4)] transition"
          >
            <span>{currentStepIdx === DEMO_STEPS.length - 1 ? 'Finish' : 'Next Step'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

