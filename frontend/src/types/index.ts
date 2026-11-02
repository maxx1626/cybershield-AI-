export type DeviceState = 'SUSCEPTIBLE' | 'EXPOSED' | 'INFECTED' | 'RECOVERED' | 'OFFLINE';

export type DeviceType = 'desktop' | 'laptop' | 'server' | 'database_server' | 'router' | 'gateway';

export interface Device {
  id: string;
  name: string;
  device_type: DeviceType;
  ip_address: string;
  mac_address: string;
  segment: string;
  state: DeviceState;
  risk_score: number;
  health: number;
  last_activity: string;
  pos_x: number;
  pos_y: number;
  pos_z: number;
}

export interface NetworkConnection {
  source_id: string;
  target_id: string;
  connection_type: 'LAN' | 'ROUTED' | 'GATEWAY';
  bandwidth_mbps: number;
  is_blocked: boolean;
}

export interface SegmentMetadata {
  color: string;
  center: [number, number, number];
  radius: number;
  subnet: string;
  description: string;
}

export interface TopologyData {
  devices: Device[];
  connections: NetworkConnection[];
  segments: string[];
  segment_metadata: Record<string, SegmentMetadata>;
  stats: {
    total_devices: number;
    total_connections: number;
    susceptible: number;
    exposed: number;
    infected: number;
    recovered: number;
    offline: number;
    health_score: number;
  };
}

export interface SimulationEvent {
  id: number;
  tick: number;
  event_type: string;
  source_device_id: string | null;
  target_device_id: string | null;
  description: string;
  severity: 'INFO' | 'WARNING' | 'THREAT' | 'CRITICAL';
  timestamp: string;
}

export interface SimulationStatus {
  session_id: string;
  scenario: string;
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  seed: number;
  speed: number;
  current_tick: number;
  total_devices: number;
  susceptible_count: number;
  exposed_count: number;
  infected_count: number;
  recovered_count: number;
  offline_count: number;
  health_score: number;
  threat_level: string;
  propagation_rate: number;
  reproduction_number_r0: number;
  events: SimulationEvent[];
  pending_alerts_count: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  primary_target: string;
  recommended_seed: number;
}

export interface SEIRDataPoint {
  tick: number;
  time_label: string;
  susceptible: number;
  exposed: number;
  infected: number;
  recovered: number;
  reproduction_number_r0: number;
}

export interface SEIRModelResponse {
  parameters: {
    beta_transmission_rate: number;
    sigma_latency_rate: number;
    gamma_recovery_rate: number;
    mu_isolation_rate: number;
    reproduction_number_r0: number;
    epidemic_state: string;
  };
  current_state: {
    susceptible: number;
    exposed: number;
    infected: number;
    recovered: number;
    offline: number;
  };
  trajectory: SEIRDataPoint[];
  summary: {
    estimated_propagation_speed: string;
    critical_containment_threshold: string;
    current_r0: number;
    active_containment_reduction: string;
  };
}

export interface GNNPrediction {
  device_id: string;
  device_name: string;
  segment: string;
  device_type: DeviceType;
  risk_score: number;
  risk_category: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  confidence: number;
  primary_risk_factor: string;
  connected_neighbors: string[];
  is_currently_infected: boolean;
}

export interface GNNResponse {
  model_architecture: string;
  total_nodes_analyzed: number;
  high_risk_count: number;
  average_network_risk: number;
  predictions: GNNPrediction[];
}

export interface RLDecision {
  selected_action: 'CONTINUE_MONITORING' | 'REQUEST_VERIFICATION' | 'RECOMMEND_ISOLATION' | 'BLOCK_CONNECTION' | 'RECOMMEND_RECOVERY';
  target_device_id: string | null;
  policy_type: string;
  reward: number;
  cumulative_reward: number;
  reason: string;
  q_values: Record<string, number>;
  policy_confidence: number;
  state_regime?: string;
}

export interface RecommendationsResponse {
  active_decision: RLDecision;
  baseline_comparison: RLDecision;
  active_threats_count: number;
  reward_metric_documentation: Record<string, string>;
}

export interface DefenceAlert {
  id: string;
  threat_id: string;
  device_id: string;
  device_name: string;
  segment: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  predicted_spread: number;
  recommended_action: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'RECOVERED';
  created_at: string;
}

export interface AuditLog {
  id: number;
  action: string;
  target_type: string;
  target_id: string;
  performed_by: string;
  details: string;
  success: boolean;
  timestamp: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: string;
}

export interface BenchmarkComparison {
  method: string;
  detection_accuracy: number;
  prediction_accuracy: number;
  avg_detection_time_sec: number;
  avg_containment_time_sec: number;
  false_alarm_rate: number;
  infections_prevented: number;
  network_disruption_index: number;
  model_type: string;
}

export interface AnalyticsOverview {
  kpi_metrics: {
    detection_accuracy_pct: number;
    prediction_accuracy_pct: number;
    avg_detection_time_sec: number;
    avg_containment_time_sec: number;
    false_alarm_rate_pct: number;
    infections_prevented_count: number;
    avg_recovery_time_sec: number;
  };
  session_summary: {
    scenario: string;
    current_tick: number;
    health_score: number;
    r0: number;
    actions_executed: number;
    threat_level: string;
  };
  comparisons: BenchmarkComparison[];
  methodology_note: string;
}

