"""
NetWatch — Secure Network Traffic Analyzer
FastAPI backend entry point
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routes.sniff import router as sniff_router
from routes.packets import router as packets_router
from routes.stats import router as stats_router
from routes.websocket import router as ws_router
from models.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="NetWatch API",
    description="Secure Network Traffic Analysis — Packet Sniffing Backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sniff_router, prefix="/api/sniff", tags=["Sniffing"])
app.include_router(packets_router, prefix="/api/packets", tags=["Packets"])
app.include_router(stats_router, prefix="/api/stats", tags=["Stats"])
app.include_router(ws_router, prefix="/ws", tags=["WebSocket"])


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "NetWatch API v1.0.0"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
