from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from models.database import get_connection
import csv
import io

router = APIRouter()


@router.get("/{session_id}")
def get_packets(
    session_id: str,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    conn = get_connection()
    rows = conn.execute("""
        SELECT id, session_id, src_ip, dst_ip, protocol,
               src_port, dst_port, payload_size,
               is_secure, risk_level, captured_at
        FROM packets
        WHERE session_id = ?
        ORDER BY captured_at DESC
        LIMIT ? OFFSET ?
    """, (session_id, limit, offset)).fetchall()
    total = conn.execute(
        "SELECT COUNT(*) FROM packets WHERE session_id=?", (session_id,)
    ).fetchone()[0]
    conn.close()

    packets = []
    for r in rows:
        d = dict(r)
        d["is_secure"] = bool(d["is_secure"])
        packets.append(d)

    return {"packets": packets, "total": total}


@router.get("/{session_id}/export")
def export_packets(session_id: str):
    conn = get_connection()
    rows = conn.execute("""
        SELECT id, src_ip, dst_ip, protocol, src_port, dst_port,
               payload_size, is_secure, risk_level, captured_at
        FROM packets WHERE session_id=?
        ORDER BY captured_at
    """, (session_id,)).fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Src IP", "Dst IP", "Protocol", "Src Port",
                     "Dst Port", "Payload Size", "Secure", "Risk Level", "Captured At"])
    for r in rows:
        row = list(r)
        row[7] = "Yes" if row[7] else "No"
        writer.writerow(row)

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=netwatch_{session_id[:8]}.csv"},
    )
