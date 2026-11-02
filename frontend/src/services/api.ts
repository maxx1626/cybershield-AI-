import {
  TopologyData,
  SimulationStatus,
  Scenario,
  SEIRModelResponse,
  GNNResponse,
  RecommendationsResponse,
  DefenceAlert,
  AuditLog,
  AnalyticsOverview,
  User
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('cybershield_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error: ${response.status} ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Auth
  async register(data: { full_name: string; email: string; username: string; password: string }) {
    return request<{ access_token: string; token_type: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(data: { email: string; password: string }) {
    return request<{ access_token: string; token_type: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async demoLogin() {
    return request<{ access_token: string; token_type: string; user: User }>('/auth/demo', {
      method: 'POST',
    });
  },

  async getMe() {
    return request<User>('/auth/me');
  },

  async logout() {
    localStorage.removeItem('cybershield_token');
    return request<{ message: string }>('/auth/logout', { method: 'POST' });
  },

  // Network
  async getTopology() {
    return request<TopologyData>('/network/topology');
  },

  async getSegments() {
    return request<any[]>('/network/segments');
  },

  async getDeviceDetails(deviceId: string) {
    return request<{ device: any; neighbors: any[]; recent_events: any[] }>(`/network/device/${deviceId}`);
  },

  // Simulation
  async getSimulationStatus() {
    return request<SimulationStatus>('/simulation/status');
  },

  async getScenarios() {
    return request<Scenario[]>('/simulation/scenarios');
  },

  async startSimulation(data?: { scenario?: string; seed?: number; speed?: number }) {
    return request<SimulationStatus>('/simulation/start', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },

  async pauseSimulation() {
    return request<SimulationStatus>('/simulation/pause', { method: 'POST' });
  },

  async resumeSimulation() {
    return request<SimulationStatus>('/simulation/resume', { method: 'POST' });
  },

  async resetSimulation(data?: { scenario?: string; seed?: number }) {
    return request<SimulationStatus>('/simulation/reset', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },

  async stepSimulation() {
    return request<SimulationStatus>('/simulation/step', { method: 'POST' });
  },

  async getSimulationHistory() {
    return request<any>('/simulation/history');
  },

  // AI Prediction Engine
  async getSEIRModel(timeSteps: number = 30) {
    return request<SEIRModelResponse>(`/ai/seir?time_steps=${timeSteps}`);
  },

  async getGNNPredictions() {
    return request<GNNResponse>('/ai/predictions');
  },

  async getRecommendations(mode: 'RL_POLICY' | 'RULE_BASED_BASELINE' = 'RL_POLICY') {
    return request<RecommendationsResponse>(`/ai/recommendations?mode=${mode}`);
  },

  // Defence Center
  async getAlerts() {
    return request<{ total_alerts: number; pending_alerts: number; alerts: DefenceAlert[] }>('/defence/alerts');
  },

  async approveDefenceAction(alertId: string, deviceId: string, action: string = 'APPROVE_ISOLATION') {
    return request<any>('/defence/approve', {
      method: 'POST',
      body: JSON.stringify({ alert_id: alertId, device_id: deviceId, action }),
    });
  },

  async rejectDefenceAction(alertId: string, deviceId: string) {
    return request<any>('/defence/reject', {
      method: 'POST',
      body: JSON.stringify({ alert_id: alertId, device_id: deviceId, action: 'REJECT' }),
    });
  },

  async recoverDevice(alertId: string, deviceId: string) {
    return request<any>('/defence/recover', {
      method: 'POST',
      body: JSON.stringify({ alert_id: alertId, device_id: deviceId, action: 'RECOVER' }),
    });
  },

  async getAuditLogs() {
    return request<{ total: number; logs: AuditLog[] }>('/defence/audit-logs');
  },

  // Analytics
  async getAnalyticsOverview() {
    return request<AnalyticsOverview>('/analytics/overview');
  },

  async getComparisons() {
    return request<any>('/analytics/comparison');
  },

  getCsvExportUrl() {
    return `${API_BASE}/analytics/export/csv`;
  }
};

