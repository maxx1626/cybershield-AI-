import pytest
from backend.app.simulation.generator import generate_network_topology
from backend.app.ai.seir import SEIRModel
from backend.app.ai.gnn import GNNPredictionService
from backend.app.ai.reinforcement_learning import CyberDefenseEnvMDP
from backend.app.simulation.engine import SimulationEngine

def test_network_generator():
    devices, connections, G = generate_network_topology()
    assert len(devices) >= 50
    assert len(connections) >= 40
    assert G.number_of_nodes() >= 50
    # Check all 5 segments are present
    segments = {d["segment"] for d in devices}
    assert "Administration" in segments
    assert "Computer Lab" in segments
    assert "Student Network" in segments
    assert "Server Room" in segments
    assert "Database Network" in segments

def test_seir_model():
    devices, connections, G = generate_network_topology()
    model = SEIRModel()
    beta, sigma, gamma, mu, r0 = model.calculate_parameters_from_network(G)
    assert beta > 0.0
    assert sigma > 0.0
    assert gamma > 0.0
    assert mu > 0.0
    assert r0 > 0.0

    trajectory = model.solve_trajectory(
        S0=55, E0=2, I0=3, R0_pop=0,
        beta=beta, sigma=sigma, gamma=gamma, mu=mu, time_steps=20
    )
    assert len(trajectory) == 21
    assert "reproduction_number_r0" in trajectory[0]
    # Total population conservation
    for pt in trajectory:
        total = pt["susceptible"] + pt["exposed"] + pt["infected"] + pt["recovered"]
        assert abs(total - 60.0) < 0.5

def test_gnn_risk_prediction():
    devices, connections, G = generate_network_topology()
    service = GNNPredictionService()
    # Mark one device infected
    devices[0]["state"] = "INFECTED"
    predictions = service.predict_device_risks(G, devices)
    assert len(predictions) == len(devices)
    # The infected device should be ranked high
    top_pred = predictions[0]
    assert top_pred["risk_score"] > 0.8
    assert top_pred["risk_category"] in ("HIGH", "CRITICAL")
    assert "confidence" in top_pred
    assert "primary_risk_factor" in top_pred

def test_rl_decision_agent():
    env = CyberDefenseEnvMDP()
    state = {
        "infected_count": 2,
        "exposed_count": 3,
        "offline_count": 0,
        "total_devices": 60,
        "r0": 1.45
    }
    target = {"id": "DEV-LAB-PC01", "state": "INFECTED", "risk_score": 0.95, "device_type": "desktop"}
    decision = env.select_action(state, target, mode="RL_POLICY")
    assert decision["selected_action"] in env.ACTIONS
    assert "reward" in decision
    assert "q_values" in decision
    assert decision["policy_confidence"] > 0.0

def test_simulation_engine():
    engine = SimulationEngine(seed=42)
    engine.reset(seed=42, scenario="Scenario A: Single Device Infection")
    initial_status = engine.get_status()
    assert initial_status["infected_count"] >= 1
    assert initial_status["total_devices"] >= 50

    # Step simulation
    engine.step()
    assert engine.current_tick == 1

    # Execute isolation
    alert_id = engine.alerts[0]["id"] if engine.alerts else "ALT-001"
    res = engine.execute_defence_action(
        alert_id=alert_id,
        device_id="DEV-LAB-PC01",
        action="APPROVE_ISOLATION"
    )
    assert res["success"] is True
    assert res["new_state"] == "OFFLINE"
    assert len(engine.audit_logs) >= 1

