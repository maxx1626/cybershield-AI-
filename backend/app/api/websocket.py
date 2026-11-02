import asyncio
from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json

from backend.app.simulation.engine import simulation_engine

router = APIRouter(tags=["WebSockets"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                dead_connections.append(connection)
        for dc in dead_connections:
            self.disconnect(dc)

ws_manager = ConnectionManager()

@router.websocket("/ws/simulation")
async def websocket_simulation_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Send initial status
        init_data = {
            "type": "SIMULATION_UPDATE",
            "data": simulation_engine.get_status()
        }
        await websocket.send_text(json.dumps(init_data))

        # Listen for client heartbeat or manual control messages
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                action = msg.get("action")
                if action == "STEP":
                    simulation_engine.step()
                elif action == "PAUSE":
                    simulation_engine.status = "PAUSED"
                elif action == "START":
                    simulation_engine.status = "RUNNING"
                elif action == "RESET":
                    simulation_engine.reset(seed=msg.get("seed", 42), scenario=msg.get("scenario"))
                
                # Broadcast updated status
                await ws_manager.broadcast({
                    "type": "SIMULATION_UPDATE",
                    "data": simulation_engine.get_status()
                })
            except Exception:
                pass

    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)

