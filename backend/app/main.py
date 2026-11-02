import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from backend.app.database.session import engine, Base, SessionLocal
from backend.app.models import User
from backend.app.auth.security import get_password_hash
from backend.app.simulation.engine import simulation_engine
from backend.app.api.auth import router as auth_router
from backend.app.api.network import router as network_router
from backend.app.api.simulation import router as simulation_router
from backend.app.api.ai import router as ai_router
from backend.app.api.defence import router as defence_router
from backend.app.api.analytics import router as analytics_router
from backend.app.api.websocket import router as ws_router, ws_manager

# Background task for live simulation ticking
async def simulation_background_loop():
    while True:
        try:
            if simulation_engine.status == "RUNNING":
                simulation_engine.step()
                await ws_manager.broadcast({
                    "type": "SIMULATION_UPDATE",
                    "data": simulation_engine.get_status()
                })
            # Sleep based on simulation speed
            delay = max(0.2, 1.0 / max(0.1, simulation_engine.speed))
            await asyncio.sleep(delay)
        except Exception as e:
            await asyncio.sleep(1.0)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables
    Base.metadata.create_all(bind=engine)
    
    # Seed judge/demo account if not existing
    db = SessionLocal()
    try:
        judge_user = db.query(User).filter(User.email == "judge@cybershield.ai").first()
        if not judge_user:
            demo_user = User(
                email="judge@cybershield.ai",
                username="judge_demo",
                full_name="Distinguished Judge",
                hashed_password=get_password_hash("JudgeDemo2026!"),
                role="judge",
                is_active=True,
                created_at=datetime.utcnow()
            )
            db.add(demo_user)
            db.commit()
    finally:
        db.close()

    # Start simulation background loop
    loop_task = asyncio.create_task(simulation_background_loop())
    yield
    # Shutdown
    loop_task.cancel()

app = FastAPI(
    title="CYBERSHIELD AI - Predictive Cyber Defence Platform",
    description="Full-stack AI-powered predictive cyber defence platform integrating SEIR epidemic models, Graph Neural Networks (GNN), and Reinforcement Learning (RL).",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend Vite dev server and production builds
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(network_router)
app.include_router(simulation_router)
app.include_router(ai_router)
app.include_router(defence_router)
app.include_router(analytics_router)
app.include_router(ws_router)

@app.get("/")
def root():
    return {
        "platform": "CYBERSHIELD AI",
        "tagline": "Predict. Protect. Recover.",
        "status": "OPERATIONAL",
        "docs_url": "/docs",
        "version": "1.0.0"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "simulation_status": simulation_engine.status,
        "total_devices": len(simulation_engine.devices),
        "total_connections": len(simulation_engine.connections)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)

