import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SimulationProvider } from './contexts/SimulationContext';
import { AuthPortal } from './pages/AuthPortal';
import { Navbar } from './components/Navbar';
import { CommandCenter } from './modules/CommandCenter';
import { NetworkVisualization } from './modules/NetworkVisualization';
import { AttackSimulationLab } from './modules/AttackSimulationLab';
import { PredictionEngine } from './modules/PredictionEngine';
import { DefenceCenter } from './modules/DefenceCenter';
import { AnalyticsReports } from './modules/AnalyticsReports';
import { JudgeDemoGuide } from './components/JudgeDemoGuide';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('command');
  const [isJudgeDemoOpen, setIsJudgeDemoOpen] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050B16] flex items-center justify-center text-cyan-400 font-mono text-sm">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>INITIALIZING CYBERSHIELD AI SECURITY ENVIRONMENT...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPortal />;
  }

  return (
    <SimulationProvider>
      <div className="min-h-screen bg-[#050B16] text-[#F4F8FF] flex flex-col">
        {/* Navigation Header */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenJudgeDemo={() => setIsJudgeDemoOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-16">
          {activeTab === 'command' && <CommandCenter onNavigateTab={setActiveTab} />}
          {activeTab === 'network' && <NetworkVisualization />}
          {activeTab === 'simulation' && <AttackSimulationLab />}
          {activeTab === 'prediction' && <PredictionEngine />}
          {activeTab === 'defence' && <DefenceCenter />}
          {activeTab === 'analytics' && <AnalyticsReports />}
        </main>

        {/* Judge Demo Interactive Guided Walkthrough */}
        <JudgeDemoGuide
          isOpen={isJudgeDemoOpen}
          onClose={() => setIsJudgeDemoOpen(false)}
          setActiveTab={setActiveTab}
        />
      </div>
    </SimulationProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
