from fastapi import APIRouter, HTTPException
from models.schemas import StartSniffRequest, SessionOut
from models.database import get_connection
from services.sniffer import start_session, stop_session

router = APIRouter()


@router.post("/start", response_model=dict)
def start_sniffing(req: StartSniffRequest):
    if not req.url.strip():
        raise HTTPException(status_code=400, detail="URL cannot be empty")
    duration = max(10, min(req.duration, 300))  # clamp 10–300s
    session_id = start_session(req.url.strip(), duration)
    return {"session_id": session_id, "message": "Sniffing started", "duration": duration}


@router.post("/stop/{session_id}")
def stop_sniffing(session_id: str):
    ok = stop_session(session_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Session not found or already stopped")
    return {"message": "Session stopped", "session_id": session_id}


@router.get("/session/{session_id}", response_model=dict)
def get_session(session_id: str):
    conn = get_connection()
    row = conn.execute("SELECT * FROM sessions WHERE id=?", (session_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Session not found")
    return dict(row)


@router.get("/sessions")
def list_sessions():
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM sessions ORDER BY started_at DESC LIMIT 20"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]
