import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { TopologyData, SimulationStatus, Scenario, Device } from '../types';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { useAuth } from './AuthContext';

interface SimulationContextType {
  topology: TopologyData | null;
  status: SimulationStatus | null;
  scenarios: Scenario[];
  selectedDevice: Device | null;
  setSelectedDevice: (device: Device | null) => void;
  isLoading: boolean;
  startSimulation: (scenario?: string, seed?: number, speed?: number) => Promise<void>;
  pauseSimulation: () => Promise<void>;
  resumeSimulation: () => Promise<void>;
  resetSimulation: (scenario?: string, seed?: number) => Promise<void>;
  stepSimulation: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [topology, setTopology] = useState<TopologyData | null>(null);
  const [status, setStatus] = useState<SimulationStatus | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshTopology = useCallback(async () => {
    try {
      const top = await api.getTopology();
      setTopology(top);
    } catch {
      // ignore
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const stat = await api.getSimulationStatus();
      setStatus(stat);
    } catch {
      // ignore
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshTopology(), refreshStatus()]);
  }, [refreshTopology, refreshStatus]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      Promise.all([
        refreshTopology(),
        refreshStatus(),
        api.getScenarios().then(setScenarios).catch(() => {})
      ]).finally(() => setIsLoading(false));

      // Subscribe to WebSocket updates
      const unsubscribe = socketService.subscribe((newStatus) => {
        setStatus(newStatus);
        // Refresh topology if counts changed or periodically
        refreshTopology();

        // Trigger confetti celebration on victory
        if (newStatus.status === 'COMPLETED' || (newStatus.infected_count === 0 && newStatus.exposed_count === 0 && newStatus.recovered_count > 0)) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      });

      return () => unsubscribe();
    }
  }, [isAuthenticated, refreshTopology, refreshStatus]);

  // Keep selected device reference updated
  useEffect(() => {
    if (selectedDevice && topology) {
      const updated = topology.devices.find((d) => d.id === selectedDevice.id);
      if (updated) setSelectedDevice(updated);
    }
  }, [topology]);

  const startSimulation = async (scenario?: string, seed?: number, speed?: number) => {
    const res = await api.startSimulation({ scenario, seed, speed });
    setStatus(res);
    await refreshTopology();
  };

  const pauseSimulation = async () => {
    const res = await api.pauseSimulation();
    setStatus(res);
  };

  const resumeSimulation = async () => {
    const res = await api.resumeSimulation();
    setStatus(res);
  };

  const resetSimulation = async (scenario?: string, seed?: number) => {
    const res = await api.resetSimulation({ scenario, seed });
    setStatus(res);
    await refreshTopology();
  };

  const stepSimulation = async () => {
    const res = await api.stepSimulation();
    setStatus(res);
    await refreshTopology();
  };

  return (
    <SimulationContext.Provider
      value={{
        topology,
        status,
        scenarios,
        selectedDevice,
        setSelectedDevice,
        isLoading,
        startSimulation,
        pauseSimulation,
        resumeSimulation,
        resetSimulation,
        stepSimulation,
        refreshAll,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};

