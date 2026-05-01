from fastapi import APIRouter
from models.database import get_connection

router = APIRouter()


@router.get("/{session_id}")
def get_stats(session_id: str):
    conn = get_connection()

    session = conn.execute(
        "SELECT * FROM sessions WHERE id=?", (session_id,)
    ).fetchone()

    protocol_dist = conn.execute("""
        SELECT protocol, COUNT(*) as count
        FROM packets WHERE session_id=?
        GROUP BY protocol
    """, (session_id,)).fetchall()

    port_dist = conn.execute("""
        SELECT dst_port, COUNT(*) as count
        FROM packets WHERE session_id=?
        GROUP BY dst_port
        ORDER BY count DESC LIMIT 10
    """, (session_id,)).fetchall()

    risk_dist = conn.execute("""
        SELECT risk_level, COUNT(*) as count
        FROM packets WHERE session_id=?
        GROUP BY risk_level
    """, (session_id,)).fetchall()

    # Timeline: packets per 5-second bucket
    timeline = conn.execute("""
        SELECT
            CAST(captured_at / 5 AS INT) * 5 as bucket,
            SUM(CASE WHEN is_secure=1 THEN 1 ELSE 0 END) as secure,
            SUM(CASE WHEN is_secure=0 THEN 1 ELSE 0 END) as insecure
        FROM packets WHERE session_id=?
        GROUP BY bucket
        ORDER BY bucket
    """, (session_id,)).fetchall()

    conn.close()

    return {
        "session": dict(session) if session else None,
        "protocol_distribution": [dict(r) for r in protocol_dist],
        "port_distribution": [dict(r) for r in port_dist],
        "risk_distribution": [dict(r) for r in risk_dist],
        "timeline": [dict(r) for r in timeline],
    }


@router.get("/overview/all")
def overview():
    conn = get_connection()
    row = conn.execute("""
        SELECT
            COUNT(*) as total_sessions,
            SUM(total_packets) as total_packets,
            SUM(secure_count) as total_secure,
            SUM(insecure_count) as total_insecure
        FROM sessions
    """).fetchone()
    conn.close()
    return dict(row)
