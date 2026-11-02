from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime

# --- AUTH SCHEMAS ---
class UserRegister(BaseModel):
    full_name: str
    email: str
    username: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

# --- NETWORK SCHEMAS ---
class DeviceBase(BaseModel):
    id: str
    name: str
    device_type: str
    ip_address: str
    mac_address: str
    segment: str
    state: str
    risk_score: float
    health: float
    last_activity: datetime
    pos_x: float
    pos_y: float
    pos_z: float

class ConnectionBase(BaseModel):
    source_id: str
    target_id: str
    connection_type: str
    bandwidth_mbps: int
    is_blocked: bool

class NetworkTopologyOut(BaseModel):
    devices: List[DeviceBase]
    connections: List[ConnectionBase]
    segments: List[str]
    stats: Dict[str, Any]

# --- SIMULATION SCHEMAS ---
class SimulationStartRequest(BaseModel):
    scenario: str = "Scenario A: Single Device Infection"
    seed: Optional[int] = 42
    speed: Optional[float] = 1.0

class SimulationStatusOut(BaseModel):
    session_id: str
    scenario: str
    status: str
    seed: int
    speed: float
    current_tick: int
    total_devices: int
    susceptible_count: int
    exposed_count: int
    infected_count: int
    recovered_count: int
    offline_count: int
    health_score: float
    threat_level: str
    propagation_rate: float
    events: List[Dict[str, Any]]

class SimulationActionRequest(BaseModel):
    action: str  # start, pause, resume, reset, step
    speed: Optional[float] = None
    scenario: Optional[str] = None
    seed: Optional[int] = None

# --- AI & SEIR SCHEMAS ---
class SEIRDataPoint(BaseModel):
    tick: int
    time_label: str
    susceptible: float
    exposed: float
    infected: float
    recovered: float
    reproduction_number_r0: float

class SEIRModelOut(BaseModel):
    beta: float
    sigma: float
    gamma: float
    mu: float
    r0: float
    estimated_propagation_rate: float
    containment_threshold: float
    trajectory: List[SEIRDataPoint]
    summary: Dict[str, Any]

class GNNPredictionItem(BaseModel):
    device_id: str
    device_name: str
    segment: str
    device_type: str
    risk_score: float
    risk_category: str  # LOW, MODERATE, HIGH, CRITICAL
    confidence: float
    primary_risk_factor: str
    connected_neighbors: List[str]
    is_currently_infected: bool

class GNNPredictionOut(BaseModel):
    model_architecture: str
    total_nodes_analyzed: int
    high_risk_count: int
    average_risk_score: float
    predictions: List[GNNPredictionItem]

class RLActionOut(BaseModel):
    step: int
    selected_action: str
    target_device_id: Optional[str]
    reward: float
    cumulative_reward: float
    reason: str
    q_values: Dict[str, float]
    policy_confidence: float
    state_metrics: Dict[str, float]

# --- DEFENCE SCHEMAS ---
class DefenceActionRequest(BaseModel):
    alert_id: str
    device_id: str
    action: str  # APPROVE_ISOLATION, REJECT, BLOCK_CONNECTION, RECOVER_DEVICE, MONITOR
    notes: Optional[str] = None

class DefenceActionResponse(BaseModel):
    success: bool
    message: str
    affected_device_id: str
    new_state: str
    audit_id: int
