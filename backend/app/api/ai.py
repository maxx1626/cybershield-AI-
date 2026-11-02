from fastapi import APIRouter, Depends, Query
from typing import Dict, Any, Optional

from backend.app.simulation.engine import simulation_engine
from backend.app.auth.security import get_current_user

router = APIRouter(prefix="/api/ai", tags=["AI Prediction Engine"])

@router.get("/seir")
def get_seir_model(
    time_steps: int = Query(default=30, ge=10, le=60),
    current_user: dict = Depends(get_current_user)
):
    counts = simulation_engine.get_state_counts()
    total_edges = max(len(simulation_engine.connections), 1)
    blocked_edges = sum(1 for c in simulation_engine.connections if c["is_blocked"])

    beta, sigma, gamma, mu, r0 = simulation_engine.seir_model.calculate_parameters_from_network(
        simulation_engine.G,
        isolated_nodes=counts["offline"],
        blocked_edges=blocked_edges,
        active_firewall=True
    )

    trajectory = simulation_engine.seir_model.solve_trajectory(
        S0=counts["susceptible"],
        E0=counts["exposed"],
        I0=counts["infected"],
        R0_pop=counts["recovered"],
        beta=beta,
        sigma=sigma,
        gamma=gamma,
        mu=mu,
        time_steps=time_steps
    )

    return {
        "parameters": {
            "beta_transmission_rate": round(beta, 3),
            "sigma_latency_rate": round(sigma, 3),
            "gamma_recovery_rate": round(gamma, 3),
            "mu_isolation_rate": round(mu, 3),
            "reproduction_number_r0": round(r0, 3),
            "epidemic_state": "EPIDEMIC SPREAD (R0 > 1)" if r0 >= 1.0 else "CONTAINED DECAY (R0 < 1)"
        },
        "current_state": counts,
        "trajectory": trajectory,
        "summary": {
            "estimated_propagation_speed": f"{round(beta * 100, 1)}% per tick",
            "critical_containment_threshold": "R0 < 1.00",
            "current_r0": round(r0, 3),
            "active_containment_reduction": f"-{round(mu / (gamma + mu) * 100, 1)}%"
        }
    }

@router.get("/predictions")
def get_gnn_predictions(current_user: dict = Depends(get_current_user)):
    """
    Executes PyTorch Graph Convolutional Network (GCN) inference over the active topology.
    Distinguishes model confidence from verified infection status.
    """
    predictions = simulation_engine.gnn_service.predict_device_risks(
        simulation_engine.G,
        simulation_engine.devices
    )

    high_risk = sum(1 for p in predictions if p["risk_score"] >= 0.70)
    avg_risk = sum(p["risk_score"] for p in predictions) / max(len(predictions), 1)

    return {
        "model_architecture": "PyTorch 2-Layer Spectral Graph Convolutional Network (GCN)",
        "total_nodes_analyzed": len(predictions),
        "high_risk_count": high_risk,
        "average_network_risk": round(avg_risk, 3),
        "predictions": predictions
    }

@router.get("/recommendations")
def get_defence_recommendations(
    mode: str = Query(default="RL_POLICY", description="RL_POLICY or RULE_BASED_BASELINE"),
    current_user: dict = Depends(get_current_user)
):
    counts = simulation_engine.get_state_counts()
    status = simulation_engine.get_status()

    # Find highest risk device from GNN
    predictions = simulation_engine.gnn_service.predict_device_risks(
        simulation_engine.G,
        simulation_engine.devices
    )
    top_pred = predictions[0] if predictions else None

    top_device = None
    if top_pred:
        dev_map = {d["id"]: d for d in simulation_engine.devices}
        top_device = dev_map.get(top_pred["device_id"])

    decision = simulation_engine.rl_service.select_action(
        state_metrics={
            "infected_count": counts["infected"],
            "exposed_count": counts["exposed"],
            "offline_count": counts["offline"],
            "total_devices": len(simulation_engine.devices),
            "r0": status["reproduction_number_r0"]
        },
        top_risk_device=top_device,
        mode=mode
    )

    # Also compute baseline comparison for transparency
    baseline_decision = simulation_engine.rl_service.select_action(
        state_metrics={
            "infected_count": counts["infected"],
            "exposed_count": counts["exposed"],
            "offline_count": counts["offline"],
            "total_devices": len(simulation_engine.devices),
            "r0": status["reproduction_number_r0"]
        },
        top_risk_device=top_device,
        mode="RULE_BASED_BASELINE"
    )

    return {
        "active_decision": decision,
        "baseline_comparison": baseline_decision,
        "active_threats_count": len(simulation_engine.alerts),
        "reward_metric_documentation": {
            "containment_reward": "+12.0 per suppressed contagion delta",
            "recovery_reward": "+15.0 per verified node restoration",
            "false_positive_penalty": "-8.0 for quarrantining low-risk asset",
            "disruption_penalty": "-5.0 for vital infrastructure downtime"
        }
    }

