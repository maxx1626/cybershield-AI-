import random
import time
from datetime import datetime
from typing import Dict, Any, List, Optional
import networkx as nx

from backend.app.simulation.generator import generate_network_topology
from backend.app.ai.seir import SEIRModel
from backend.app.ai.gnn import GNNPredictionService
from backend.app.ai.reinforcement_learning import CyberDefenseEnvMDP

class SimulationEngine:
    def __init__(self, seed: int = 42):
        self.seed = seed
        self.rng = random.Random(seed)
        self.seir_model = SEIRModel()
        self.gnn_service = GNNPredictionService()
        self.rl_service = CyberDefenseEnvMDP()
        
        self.session_id = "sim-session-001"
        self.scenario = "Scenario A: Single Device Infection"
        self.status = "IDLE"  # IDLE, RUNNING, PAUSED, COMPLETED
        self.speed = 1.0
        self.current_tick = 0
        self.last_tick_time = time.time()
        
        self.devices: List[Dict[str, Any]] = []
        self.connections: List[Dict[str, Any]] = []
        self.G: nx.Graph = nx.Graph()
        self.events: List[Dict[str, Any]] = []
        self.alerts: List[Dict[str, Any]] = []
        self.audit_logs: List[Dict[str, Any]] = []
        
        self.reset(seed=self.seed, scenario=self.scenario)

    def reset(self, seed: Optional[int] = None, scenario: Optional[str] = None):
        if seed is not None:
            self.seed = seed
        self.rng = random.Random(self.seed)
        if scenario:
            self.scenario = scenario
            
        self.devices, self.connections, self.G = generate_network_topology()
        self.current_tick = 0
        self.status = "IDLE"
        self.events = []
        self.alerts = []
        
        # Seed initial event
        self._add_event(
            event_type="SIMULATION_INITIALIZED",
            source_id="SYSTEM",
            target_id=None,
            description=f"Isolated synthetic simulation testbed initialized for '{self.scenario}' with random seed {self.seed}.",
            severity="INFO"
        )
        
        # Apply scenario initial conditions
        self._setup_scenario_patient_zero()

    def _setup_scenario_patient_zero(self):
        dev_map = {d["id"]: d for d in self.devices}
        
        if "Scenario A" in self.scenario:
            # Single Device Infection in Computer Lab
            target = dev_map.get("DEV-LAB-PC01")
            if target:
                target["state"] = "INFECTED"
                target["risk_score"] = 0.96
                target["health"] = 45.0
                self._add_event(
                    event_type="PHISHING_PAYLOAD_EXECUTION",
                    source_id="EXT-SIMULATED-IP",
                    target_id="DEV-LAB-PC01",
                    description="Simulated spear-phishing attachment triggered malicious macro on Lab PC 01.",
                    severity="CRITICAL"
                )
                self._create_alert(target, "RECOMMEND_ISOLATION", "Malicious remote code execution detected via macro payload.")
                
        elif "Scenario B" in self.scenario:
            # Multi-Device Propagation in Lab
            for pid in ["DEV-LAB-PC01", "DEV-LAB-PC02"]:
                if pid in dev_map:
                    dev_map[pid]["state"] = "INFECTED"
                    dev_map[pid]["risk_score"] = 0.95
                    dev_map[pid]["health"] = 40.0
            if "DEV-LAB-PC03" in dev_map:
                dev_map["DEV-LAB-PC03"]["state"] = "EXPOSED"
                dev_map["DEV-LAB-PC03"]["risk_score"] = 0.78
            self._add_event(
                event_type="WORM_PROPAGATION_ACTIVE",
                source_id="DEV-LAB-PC01",
                target_id="DEV-LAB-PC02",
                description="Rapid SMB/RPC lateral propagation detected within Computer Lab subnet.",
                severity="CRITICAL"
            )
            self._create_alert(dev_map["DEV-LAB-PC01"], "RECOMMEND_ISOLATION", "Active SMB lateral spread across student desktops.")
            
        elif "Scenario C" in self.scenario:
            # Server Network Threat
            if "DEV-ADM-EXEC01" in dev_map:
                dev_map["DEV-ADM-EXEC01"]["state"] = "INFECTED"
                dev_map["DEV-ADM-EXEC01"]["risk_score"] = 0.94
                dev_map["DEV-ADM-EXEC01"]["health"] = 50.0
            if "DEV-ADM-DC01" in dev_map:
                dev_map["DEV-ADM-DC01"]["state"] = "EXPOSED"
                dev_map["DEV-ADM-DC01"]["risk_score"] = 0.88
            self._add_event(
                event_type="CREDENTIAL_HARVESTING_ATTEMPT",
                source_id="DEV-ADM-EXEC01",
                target_id="DEV-ADM-DC01",
                description="Simulated Mimikatz-like pass-the-hash probing directed at Active Directory Domain Controller.",
                severity="CRITICAL"
            )
            self._create_alert(dev_map["DEV-ADM-EXEC01"], "RECOMMEND_ISOLATION", "Executive PC compromised; probing Domain Controller.")
            
        elif "Scenario D" in self.scenario:
            # Multiple Segments at Risk
            if "DEV-STU-NB01" in dev_map:
                dev_map["DEV-STU-NB01"]["state"] = "INFECTED"
                dev_map["DEV-STU-NB01"]["risk_score"] = 0.92
            if "DEV-LAB-PC05" in dev_map:
                dev_map["DEV-LAB-PC05"]["state"] = "INFECTED"
                dev_map["DEV-LAB-PC05"]["risk_score"] = 0.91
            if "DEV-SRV-EDGW" in dev_map:
                dev_map["DEV-SRV-EDGW"]["state"] = "EXPOSED"
                dev_map["DEV-SRV-EDGW"]["risk_score"] = 0.85
            self._add_event(
                event_type="CROSS_SEGMENT_PORT_SCAN",
                source_id="DEV-STU-NB01",
                target_id="DEV-SRV-EDGW",
                description="Coordinated cross-subnet reconnaissance targeting Core Edge Gateway.",
                severity="CRITICAL"
            )
            self._create_alert(dev_map["DEV-SRV-EDGW"], "BLOCK_CONNECTION", "Multiple rogue client subnets probing Core Gateway.")
            
        elif "Scenario E" in self.scenario:
            # AI Defence and Recovery Demo
            if "DEV-LAB-PC01" in dev_map:
                dev_map["DEV-LAB-PC01"]["state"] = "INFECTED"
                dev_map["DEV-LAB-PC01"]["risk_score"] = 0.95
            if "DEV-LAB-PC02" in dev_map:
                dev_map["DEV-LAB-PC02"]["state"] = "EXPOSED"
                dev_map["DEV-LAB-PC02"]["risk_score"] = 0.75
            self._add_event(
                event_type="ZERO_DAY_EXPLOIT_DETECTED",
                source_id="DEV-LAB-PC01",
                target_id="DEV-LAB-PC02",
                description="GNN Predictive Sensor flagged abnormal graph embedding deviation on Lab PC 01.",
                severity="THREAT"
            )
            self._create_alert(dev_map["DEV-LAB-PC01"], "RECOMMEND_ISOLATION", "GNN Anomaly + RL Policy recommends immediate quarantine.")

    def _add_event(self, event_type: str, source_id: Optional[str], target_id: Optional[str], description: str, severity: str = "INFO"):
        event = {
            "id": len(self.events) + 1,
            "tick": self.current_tick,
            "event_type": event_type,
            "source_device_id": source_id,
            "target_device_id": target_id,
            "description": description,
            "severity": severity,
            "timestamp": datetime.utcnow().isoformat()
        }
        self.events.insert(0, event)
        if len(self.events) > 100:
            self.events = self.events[:100]

    def _create_alert(self, device: Dict[str, Any], recommended_action: str, reason: str):
        alert_id = f"ALT-{self.current_tick:03d}-{device['id']}"
        # Check if active alert already exists for device
        for a in self.alerts:
            if a["device_id"] == device["id"] and a["status"] == "PENDING":
                return
        alert = {
            "id": alert_id,
            "threat_id": f"THR-{self.rng.randint(1000, 9999)}",
            "device_id": device["id"],
            "device_name": device["name"],
            "segment": device["segment"],
            "severity": "CRITICAL" if device.get("risk_score", 0) > 0.85 else "HIGH",
            "risk_score": device.get("risk_score", 0.85),
            "predicted_spread": round(float(self.rng.uniform(2.5, 6.0)), 1),
            "recommended_action": recommended_action,
            "reason": reason,
            "status": "PENDING",
            "created_at": datetime.utcnow().isoformat()
        }
        self.alerts.insert(0, alert)

    def step(self):
        """Advances the simulation by 1 discrete time tick."""
        self.current_tick += 1
        dev_map = {d["id"]: d for d in self.devices}
        
        # 1. Propagation dynamics over network edges
        infected_nodes = [d for d in self.devices if d["state"] == "INFECTED"]
        exposed_nodes = [d for d in self.devices if d["state"] == "EXPOSED"]
        
        # Exposed -> Infected transition (incubation rate sigma ~ 0.3)
        for d in exposed_nodes:
            if self.rng.random() < 0.35:
                d["state"] = "INFECTED"
                d["health"] = max(20.0, d["health"] - 35.0)
                d["risk_score"] = min(0.99, d["risk_score"] + 0.25)
                self._add_event(
                    event_type="PAYLOAD_ACTIVATED",
                    source_id=d["id"],
                    target_id=None,
                    description=f"Device {d['name']} ({d['id']}) incubation ended; malware payload is now ACTIVE.",
                    severity="CRITICAL"
                )
                self._create_alert(d, "RECOMMEND_ISOLATION", "Incubating device transitioned to active infected state.")

        # Infected -> Neighbor Contagion (rate beta)
        for inf in infected_nodes:
            neighbors = list(self.G.neighbors(inf["id"])) if inf["id"] in self.G else []
            for n_id in neighbors:
                neigh = dev_map.get(n_id)
                if not neigh or neigh["state"] in ("INFECTED", "OFFLINE", "RECOVERED"):
                    continue
                
                # Check if connection between them is blocked
                is_blocked = any(
                    (c["source_id"] == inf["id"] and c["target_id"] == n_id and c["is_blocked"]) or
                    (c["target_id"] == inf["id"] and c["source_id"] == n_id and c["is_blocked"])
                    for c in self.connections
                )
                if is_blocked:
                    continue

                # Transmission probability: higher within same segment, damped across gateways
                trans_prob = 0.30 if inf["segment"] == neigh["segment"] else 0.10
                if self.rng.random() < trans_prob:
                    if neigh["state"] == "SUSCEPTIBLE":
                        neigh["state"] = "EXPOSED"
                        neigh["health"] = max(60.0, neigh["health"] - 15.0)
                        neigh["risk_score"] = 0.72
                        self._add_event(
                            event_type="LATERAL_PROBE_DETECTED",
                            source_id=inf["id"],
                            target_id=neigh["id"],
                            description=f"Lateral communication observed from {inf['id']} targeting {neigh['name']}.",
                            severity="WARNING"
                        )
                        self._create_alert(neigh, "REQUEST_VERIFICATION", f"Exposed to lateral communication from infected host {inf['id']}.")

        # 2. Update health and timestamps
        for d in self.devices:
            if d["state"] == "INFECTED":
                d["health"] = max(10.0, d["health"] - 1.5)
                d["risk_score"] = min(0.99, d["risk_score"] + 0.01)
            d["last_activity"] = datetime.utcnow().isoformat()

        # Check completion
        counts = self.get_state_counts()
        if counts["infected"] == 0 and counts["exposed"] == 0 and self.current_tick > 5:
            self.status = "COMPLETED"
            self._add_event(
                event_type="NETWORK_SECURED",
                source_id="CYBERSHIELD_AI",
                target_id=None,
                description="Zero active threats detected. All compromised nodes isolated or recovered.",
                severity="INFO"
            )

    def get_state_counts(self) -> Dict[str, int]:
        counts = {"susceptible": 0, "exposed": 0, "infected": 0, "recovered": 0, "offline": 0}
        for d in self.devices:
            st = d["state"].lower()
            if st in counts:
                counts[st] += 1
        return counts

    def get_network_health_score(self) -> float:
        total = len(self.devices)
        if total == 0:
            return 100.0
        counts = self.get_state_counts()
        penalty = (counts["infected"] * 1.5 + counts["exposed"] * 0.8 + counts["offline"] * 0.3) / total * 100.0
        return round(max(5.0, 100.0 - penalty), 1)

    def get_status(self) -> Dict[str, Any]:
        counts = self.get_state_counts()
        health = self.get_network_health_score()
        
        # Threat level determination
        if counts["infected"] >= 3:
            threat_level = "CRITICAL DEFCON 1"
        elif counts["infected"] > 0:
            threat_level = "ELEVATED THREAT"
        elif counts["exposed"] > 0:
            threat_level = "SUSPICIOUS ACTIVITY"
        else:
            threat_level = "NORMAL SECURE"

        total_edges = max(len(self.connections), 1)
        blocked_edges = sum(1 for c in self.connections if c["is_blocked"])
        
        beta, sigma, gamma, mu, r0 = self.seir_model.calculate_parameters_from_network(
            self.G,
            isolated_nodes=counts["offline"],
            blocked_edges=blocked_edges
        )

        return {
            "session_id": self.session_id,
            "scenario": self.scenario,
            "status": self.status,
            "seed": self.seed,
            "speed": self.speed,
            "current_tick": self.current_tick,
            "total_devices": len(self.devices),
            "susceptible_count": counts["susceptible"],
            "exposed_count": counts["exposed"],
            "infected_count": counts["infected"],
            "recovered_count": counts["recovered"],
            "offline_count": counts["offline"],
            "health_score": health,
            "threat_level": threat_level,
            "propagation_rate": round(beta, 3),
            "reproduction_number_r0": round(r0, 3),
            "events": self.events[:25],
            "pending_alerts_count": sum(1 for a in self.alerts if a["status"] == "PENDING")
        }

    def execute_defence_action(self, alert_id: str, device_id: str, action: str, operator: str = "operator") -> Dict[str, Any]:
        dev_map = {d["id"]: d for d in self.devices}
        device = dev_map.get(device_id)
        if not device:
            return {"success": False, "message": f"Device {device_id} not found", "new_state": "UNKNOWN", "audit_id": 0}

        # Mark alert status if present
        for a in self.alerts:
            if a["id"] == alert_id or a["device_id"] == device_id:
                if action in ("APPROVE_ISOLATION", "ISOLATE"):
                    a["status"] = "APPROVED"
                elif action == "REJECT":
                    a["status"] = "REJECTED"
                elif action in ("RECOVER", "RECOVER_DEVICE"):
                    a["status"] = "RECOVERED"

        old_state = device["state"]
        new_state = old_state
        details = ""

        if action in ("APPROVE_ISOLATION", "ISOLATE"):
            device["state"] = "OFFLINE"
            device["risk_score"] = 0.05
            new_state = "OFFLINE"
            details = f"Device {device['name']} quarantined; software isolation profile applied."
            self._add_event(
                event_type="DEVICE_ISOLATION_EXECUTED",
                source_id="DEFENCE_COMMAND",
                target_id=device_id,
                description=f"Human approved isolation for {device['name']}. NIC disabled.",
                severity="INFO"
            )

        elif action in ("BLOCK_CONNECTION", "BLOCK_PORTS"):
            # Block connections to/from this device
            for c in self.connections:
                if c["source_id"] == device_id or c["target_id"] == device_id:
                    c["is_blocked"] = True
            new_state = device["state"]
            details = f"Network links severed for device {device['name']}."
            self._add_event(
                event_type="CONNECTION_SEVERED",
                source_id="DEFENCE_COMMAND",
                target_id=device_id,
                description=f"Firewall block rule deployed against {device['name']}.",
                severity="WARNING"
            )

        elif action in ("RECOVER", "RECOVER_DEVICE"):
            device["state"] = "RECOVERED"
            device["health"] = 100.0
            device["risk_score"] = 0.02
            new_state = "RECOVERED"
            # Unblock connections
            for c in self.connections:
                if c["source_id"] == device_id or c["target_id"] == device_id:
                    c["is_blocked"] = False
            details = f"Clean image flashed; patched vulnerabilities and verified zero backdoor traces."
            self._add_event(
                event_type="DEVICE_RESTORED",
                source_id="RECOVERY_SERVICE",
                target_id=device_id,
                description=f"Device {device['name']} successfully disinfected and rejoined cluster.",
                severity="INFO"
            )

        elif action == "REJECT":
            details = f"Operator rejected AI recommendation for device {device['name']}."
            self._add_event(
                event_type="RECOMMENDATION_REJECTED",
                source_id="OPERATOR",
                target_id=device_id,
                description=f"Isolation proposal dismissed by {operator}.",
                severity="INFO"
            )

        audit_entry = {
            "id": len(self.audit_logs) + 1,
            "action": action,
            "target_type": "DEVICE",
            "target_id": device_id,
            "performed_by": operator,
            "details": details,
            "success": True,
            "timestamp": datetime.utcnow().isoformat()
        }
        self.audit_logs.insert(0, audit_entry)

        return {
            "success": True,
            "message": details,
            "affected_device_id": device_id,
            "new_state": new_state,
            "audit_id": audit_entry["id"]
        }

# Global singleton instance for simulation runtime
simulation_engine = SimulationEngine()

