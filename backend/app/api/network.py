from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any

from backend.app.simulation.engine import simulation_engine
from backend.app.simulation.generator import SEGMENT_METADATA
from backend.app.auth.security import get_current_user

router = APIRouter(prefix="/api/network", tags=["Network Topology"])

@router.get("/devices")
def get_all_devices(current_user: dict = Depends(get_current_user)):
    return {
        "total": len(simulation_engine.devices),
        "devices": simulation_engine.devices
    }

@router.get("/topology")
def get_network_topology(current_user: dict = Depends(get_current_user)):
    counts = simulation_engine.get_state_counts()
    return {
        "devices": simulation_engine.devices,
        "connections": simulation_engine.connections,
        "segments": list(SEGMENT_METADATA.keys()),
        "segment_metadata": SEGMENT_METADATA,
        "stats": {
            "total_devices": len(simulation_engine.devices),
            "total_connections": len(simulation_engine.connections),
            "susceptible": counts["susceptible"],
            "exposed": counts["exposed"],
            "infected": counts["infected"],
            "recovered": counts["recovered"],
            "offline": counts["offline"],
            "health_score": simulation_engine.get_network_health_score()
        }
    }

@router.get("/segments")
def get_network_segments(current_user: dict = Depends(get_current_user)):
    segments_summary = []
    devs = simulation_engine.devices

    for seg_name, meta in SEGMENT_METADATA.items():
        seg_devs = [d for d in devs if d["segment"] == seg_name]
        inf_count = sum(1 for d in seg_devs if d["state"] == "INFECTED")
        exp_count = sum(1 for d in seg_devs if d["state"] == "EXPOSED")
        avg_health = sum(d["health"] for d in seg_devs) / max(len(seg_devs), 1)

        segments_summary.append({
            "name": seg_name,
            "subnet": meta["subnet"],
            "color": meta["color"],
            "description": meta["description"],
            "total_devices": len(seg_devs),
            "infected": inf_count,
            "exposed": exp_count,
            "health": round(avg_health, 1),
            "status": "CRITICAL" if inf_count > 0 else ("WARNING" if exp_count > 0 else "HEALTHY")
        })

    return segments_summary

@router.get("/device/{device_id}")
def get_device_details(device_id: str, current_user: dict = Depends(get_current_user)):
    dev_map = {d["id"]: d for d in simulation_engine.devices}
    dev = dev_map.get(device_id)
    if not dev:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")

    # Find connected neighbors
    neighbors = list(simulation_engine.G.neighbors(device_id)) if device_id in simulation_engine.G else []
    neighbor_details = []
    for nid in neighbors:
        ndev = dev_map.get(nid)
        if ndev:
            # Check if edge is blocked
            is_blocked = any(
                (c["source_id"] == device_id and c["target_id"] == nid and c["is_blocked"]) or
                (c["target_id"] == device_id and c["source_id"] == nid and c["is_blocked"])
                for c in simulation_engine.connections
            )
            neighbor_details.append({
                "id": ndev["id"],
                "name": ndev["name"],
                "state": ndev["state"],
                "risk_score": ndev["risk_score"],
                "device_type": ndev["device_type"],
                "is_blocked": is_blocked
            })

    # Find recent device events
    device_events = [
        e for e in simulation_engine.events
        if e.get("source_device_id") == device_id or e.get("target_device_id") == device_id
    ][:10]

    return {
        "device": dev,
        "neighbors": neighbor_details,
        "recent_events": device_events
    }

