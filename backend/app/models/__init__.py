from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="operator")  # judge, admin, operator
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class DeviceModel(Base):
    __tablename__ = "devices"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    device_type = Column(String(64), nullable=False)  # desktop, laptop, server, database_server, router, gateway
    ip_address = Column(String(64), nullable=False)
    mac_address = Column(String(64), nullable=False)
    segment = Column(String(64), nullable=False)  # Administration, Computer Lab, Student Network, Server Room, Database Network
    state = Column(String(32), default="SUSCEPTIBLE")  # SUSCEPTIBLE, EXPOSED, INFECTED, RECOVERED, OFFLINE
    risk_score = Column(Float, default=0.0)
    health = Column(Float, default=100.0)
    last_activity = Column(DateTime, default=datetime.utcnow)
    pos_x = Column(Float, default=0.0)
    pos_y = Column(Float, default=0.0)
    pos_z = Column(Float, default=0.0)

class NetworkConnection(Base):
    __tablename__ = "network_connections"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(String(64), ForeignKey("devices.id"), nullable=False)
    target_id = Column(String(64), ForeignKey("devices.id"), nullable=False)
    connection_type = Column(String(32), default="LAN")  # LAN, ROUTED, GATEWAY
    bandwidth_mbps = Column(Integer, default=1000)
    is_blocked = Column(Boolean, default=False)

class SimulationSession(Base):
    __tablename__ = "simulation_sessions"

    id = Column(String(64), primary_key=True, index=True)
    scenario = Column(String(64), default="Scenario A: Single Device Infection")
    status = Column(String(32), default="IDLE")  # IDLE, RUNNING, PAUSED, COMPLETED
    seed = Column(Integer, default=42)
    speed = Column(Float, default=1.0)
    current_tick = Column(Integer, default=0)
    total_devices = Column(Integer, default=60)
    susceptible_count = Column(Integer, default=59)
    exposed_count = Column(Integer, default=0)
    infected_count = Column(Integer, default=1)
    recovered_count = Column(Integer, default=0)
    offline_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class SimulationEvent(Base):
    __tablename__ = "simulation_events"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), ForeignKey("simulation_sessions.id"))
    tick = Column(Integer, default=0)
    event_type = Column(String(64), nullable=False)
    source_device_id = Column(String(64), nullable=True)
    target_device_id = Column(String(64), nullable=True)
    description = Column(Text, nullable=False)
    severity = Column(String(32), default="INFO")  # INFO, WARNING, THREAT, CRITICAL
    timestamp = Column(DateTime, default=datetime.utcnow)

class DefenceAlert(Base):
    __tablename__ = "defence_alerts"

    id = Column(String(64), primary_key=True, index=True)
    threat_id = Column(String(64), nullable=False)
    device_id = Column(String(64), ForeignKey("devices.id"), nullable=False)
    severity = Column(String(32), default="HIGH")  # LOW, MEDIUM, HIGH, CRITICAL
    risk_score = Column(Float, default=0.85)
    predicted_spread = Column(Float, default=3.5)
    recommended_action = Column(String(64), default="RECOMMEND_ISOLATION")
    reason = Column(Text, nullable=False)
    status = Column(String(32), default="PENDING")  # PENDING, APPROVED, REJECTED, EXECUTED, RECOVERED
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(64), nullable=False)
    target_type = Column(String(64), nullable=False)
    target_id = Column(String(64), nullable=False)
    performed_by = Column(String(100), default="operator")
    details = Column(Text, nullable=False)
    success = Column(Boolean, default=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

