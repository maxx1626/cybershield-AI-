from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any

from backend.app.simulation.engine import simulation_engine
from backend.app.schemas import DefenceActionRequest, DefenceActionResponse
from backend.app.auth.security import get_current_user

router = APIRouter(prefix="/api/defence", tags=["AI Defence Center"])

@router.get("/alerts")
def get_defence_alerts(current_user: dict = Depends(get_current_user)):
    return {
        "total_alerts": len(simulation_engine.alerts),
        "pending_alerts": sum(1 for a in simulation_engine.alerts if a["status"] == "PENDING"),
        "alerts": simulation_engine.alerts
    }

@router.post("/approve", response_model=DefenceActionResponse)
def approve_defence_action(
    payload: DefenceActionRequest,
    current_user: dict = Depends(get_current_user)
):
    operator_name = current_user.get("full_name") or current_user.get("username", "Operator")
    result = simulation_engine.execute_defence_action(
        alert_id=payload.alert_id,
        device_id=payload.device_id,
        action=payload.action or "APPROVE_ISOLATION",
        operator=operator_name
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result

@router.post("/reject", response_model=DefenceActionResponse)
def reject_defence_action(
    payload: DefenceActionRequest,
    current_user: dict = Depends(get_current_user)
):
    operator_name = current_user.get("full_name") or current_user.get("username", "Operator")
    result = simulation_engine.execute_defence_action(
        alert_id=payload.alert_id,
        device_id=payload.device_id,
        action="REJECT",
        operator=operator_name
    )
    return result

@router.post("/recover", response_model=DefenceActionResponse)
def recover_device_action(
    payload: DefenceActionRequest,
    current_user: dict = Depends(get_current_user)
):
    operator_name = current_user.get("full_name") or current_user.get("username", "Operator")
    result = simulation_engine.execute_defence_action(
        alert_id=payload.alert_id,
        device_id=payload.device_id,
        action="RECOVER",
        operator=operator_name
    )
    return result

@router.get("/audit-logs")
def get_audit_logs(current_user: dict = Depends(get_current_user)):
    return {
        "total": len(simulation_engine.audit_logs),
        "logs": simulation_engine.audit_logs
    }

