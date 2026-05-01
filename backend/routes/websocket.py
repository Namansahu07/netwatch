"""
WebSocket endpoint: streams live packets for a session as JSON.
"""
import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.sniffer import register_listener, unregister_listener

router = APIRouter()


@router.websocket("/live/{session_id}")
async def live_packets(websocket: WebSocket, session_id: str):
    await websocket.accept()
    queue: asyncio.Queue = asyncio.Queue(maxsize=200)
    register_listener(session_id, queue)
    try:
        while True:
            try:
                packet = await asyncio.wait_for(queue.get(), timeout=30)
                await websocket.send_text(json.dumps(packet))
                # Check for session end signal
                if isinstance(packet, dict) and packet.get("__event__") == "session_ended":
                    break
            except asyncio.TimeoutError:
                # Send heartbeat
                await websocket.send_text(json.dumps({"__event__": "heartbeat"}))
    except WebSocketDisconnect:
        pass
    finally:
        unregister_listener(session_id, queue)
