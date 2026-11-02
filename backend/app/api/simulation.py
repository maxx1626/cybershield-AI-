from fastapi import APIRouter, Depends, Body
from typing import Dict, Any, Optional

from backend.app.simulation.engine import simulation_engine
from backend.app.schemas import SimulationStartRequest, SimulationStatusOut
from backend.app.auth.security import get_current_user

router = APIRouter(prefix="/api/simulation", tags=["Attack Simulation Lab"])

AVAILABLE_SCENARIOS = [
    {
        "id": "Scenario A",
        "name": "Scenario A: Single Device Infection",
        "description": "Educational spear-phishing attack on a single student desktop (DEV-LAB-PC01). Evaluates early containment and zero-spread quarantine.",
        "difficulty": "Introductory",
        "primary_target": "DEV-LAB-PC01",
        "recommended_seed": 42
    },
    {
        "id": "Scenario B",
        "name": "Scenario B: Multi-Device Propagation",
        "description": "Rapid worm/SMB propagation across multiple adjacent computer lab workstations. Tests lateral movement mitigation.",
        "difficulty": "Moderate",
        "primary_target": "DEV-LAB-PC01, DEV-LAB-PC02",
        "recommended_seed": 108
    },
    {
        "id": "Scenario C",
        "name": "Scenario C: Server Network Threat",
        "description": "Targeted APT pivoting from Executive Admin PC towards Active Directory Domain Controller and Core Server Infrastructure.",
        "difficulty": "Advanced",
        "primary_target": "DEV-ADM-EXEC01 -> DEV-SRV-AD01",
        "recommended_seed": 256
    },
    {
        "id": "Scenario D",
        "name": "Scenario D: Multiple Network Segments at Risk",
        "description": "Concurrent multi-vector breach originating simultaneously in Student BYOD WiFi and Computer Lab targeting the Core Gateway.",
        "difficulty": "High",
        "primary_target": "DEV-STU-NB01, DEV-LAB-PC05",
        "recommended_seed": 512
    },
    {
        "id": "Scenario E",
        "name": "Scenario E: AI Defence and Recovery",
        "description": "Interactive showcase demonstrating early GNN anomaly detection, RL automated recommendation, human sign-off, isolation, and safe recovery.",
        "difficulty": "Demonstration (Judge Favorite)",
        "primary_target": "DEV-LAB-PC01",
        "recommended_seed": 777
    }
]

@router.get("/scenarios")
def get_scenarios(current_user: dict = Depends(get_current_user)):
    return AVAILABLE_SCENARIOS

@router.get("/status")
def get_simulation_status(current_user: dict = Depends(get_current_user)):
    return simulation_engine.get_status()

@router.post("/start")
def start_simulation(
    payload: Optional[SimulationStartRequest] = None,
    current_user: dict = Depends(get_current_user)
):
    if payload:
        if payload.scenario and payload.scenario != simulation_engine.scenario:
            simulation_engine.reset(seed=payload.seed or 42, scenario=payload.scenario)
        if payload.speed:
            simulation_engine.speed = payload.speed

    simulation_engine.status = "RUNNING"
    simulation_engine._add_event(
        event_type="SIMULATION_STARTED",
        source_id="OPERATOR",
        target_id=None,
        description=f"Simulation started by {current_user.get('username', 'operator')} at speed {simulation_engine.speed}x.",
        severity="INFO"
    )
    return simulation_engine.get_status()

@router.post("/pause")
def pause_simulation(current_user: dict = Depends(get_current_user)):
    simulation_engine.status = "PAUSED"
    simulation_engine._add_event(
        event_type="SIMULATION_PAUSED",
        source_id="OPERATOR",
        target_id=None,
        description="Simulation execution suspended.",
        severity="INFO"
    )
    return simulation_engine.get_status()

@router.post("/resume")
def resume_simulation(current_user: dict = Depends(get_current_user)):
    simulation_engine.status = "RUNNING"
    return simulation_engine.get_status()

@router.post("/reset")
def reset_simulation(
    payload: Optional[Dict[str, Any]] = Body(default=None),
    current_user: dict = Depends(get_current_user)
):
    seed = payload.get("seed", 42) if payload else 42
    scenario = payload.get("scenario", "Scenario A: Single Device Infection") if payload else "Scenario A: Single Device Infection"
    simulation_engine.reset(seed=seed, scenario=scenario)
    return simulation_engine.get_status()

@router.post("/step")
def step_simulation(current_user: dict = Depends(get_current_user)):
    simulation_engine.step()
    return simulation_engine.get_status()

@router.get("/history")
def get_simulation_history(current_user: dict = Depends(get_current_user)):
    return {
        "session_id": simulation_engine.session_id,
        "scenario": simulation_engine.scenario,
        "seed": simulation_engine.seed,
        "total_events": len(simulation_engine.events),
        "events": simulation_engine.events
    }

