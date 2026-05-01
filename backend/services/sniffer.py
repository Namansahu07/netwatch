"""
Packet sniffing service.
Simulation mode for Mac/dev environments.
"""
import time
import uuid
import json
import random
import asyncio
import threading
from typing import Dict, Optional

from models.database import get_connection
from utils.crypto import encrypt
from utils.hashing import hash_url, extract_host, classify_port

# Active sessions: session_id -> {"thread": ..., "stop_event": ..., "status": ...}
_active: Dict[str, dict] = {}
# Live packet broadcast callbacks: session_id -> list of async queues
_listeners: Dict[str, list] = {}

SIMULATED_IPS = [
    "142.250.80.46", "104.16.132.229", "151.101.1.140",
    "13.107.42.14",  "52.114.128.15", "185.199.108.153",
    "34.160.111.0",  "172.217.14.206","93.184.216.34",
    "140.82.114.4",  "199.232.68.25", "203.0.113.5",
]


def _broadcast(session_id: str, packet_dict: dict):
    """Push a packet dict to all registered async queues for this session."""
    queues = _listeners.get(session_id, [])
    for q in queues:
        try:
            q.put_nowait(packet_dict)
        except Exception:
            pass


def register_listener(session_id: str, queue):
    _listeners.setdefault(session_id, []).append(queue)


def unregister_listener(session_id: str, queue):
    if session_id in _listeners:
        try:
            _listeners[session_id].remove(queue)
        except ValueError:
            pass


def _store_packet(session_id: str, pkt_data: dict) -> int:
    """Persist a packet to SQLite with AES-encrypted raw payload."""
    conn = get_connection()
    c = conn.cursor()

    raw_json = json.dumps(pkt_data)
    encrypted = encrypt(raw_json)

    c.execute("""
        INSERT INTO packets
            (session_id, src_ip, dst_ip, protocol, src_port, dst_port,
             payload_size, is_secure, risk_level, encrypted_data, captured_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
    """, (
        session_id,
        pkt_data.get("src_ip"),
        pkt_data.get("dst_ip"),
        pkt_data.get("protocol"),
        pkt_data.get("src_port"),
        pkt_data.get("dst_port"),
        pkt_data.get("payload_size"),
        1 if pkt_data.get("is_secure") else 0,
        pkt_data.get("risk_level", "MEDIUM"),
        encrypted,
        pkt_data.get("captured_at", time.time()),
    ))
    packet_id = c.lastrowid

    col = "secure_count" if pkt_data.get("is_secure") else "insecure_count"
    c.execute(f"""
        UPDATE sessions
        SET total_packets = total_packets + 1,
            {col} = {col} + 1
        WHERE id = ?
    """, (session_id,))

    conn.commit()
    conn.close()
    return packet_id


def _simulated_sniff(session_id: str, url: str, duration: int, stop_event: threading.Event):
    """
    Realistic packet simulation.
    Mimics real traffic patterns for the given URL's security posture.
    """
    is_https = url.lower().startswith("https://")

    port_weights = (
        [443] * 7 + [80] * 1 + [53] * 2 if is_https
        else [80] * 6 + [443] * 1 + [53] * 2 + [8080] * 1
    )

    target_ip = random.choice(SIMULATED_IPS)
    local_ip = f"192.168.1.{random.randint(2, 254)}"

    start = time.time()

    while not stop_event.is_set() and (time.time() - start) < duration:
        burst_size = random.randint(1, 5)
        for _ in range(burst_size):
            if stop_event.is_set():
                break

            dst_port = random.choice(port_weights)
            src_port = random.randint(49152, 65535)
            proto_info = classify_port(dst_port)

            pkt = {
                "src_ip": local_ip,
                "dst_ip": target_ip,
                "protocol": "TCP" if dst_port != 53 else "UDP",
                "src_port": src_port,
                "dst_port": dst_port,
                "payload_size": random.randint(40, 1460),
                "is_secure": proto_info["is_secure"],
                "risk_level": proto_info["risk_level"],
                "protocol_name": proto_info["protocol_name"],
                "captured_at": time.time(),
            }

            pkt_id = _store_packet(session_id, pkt)
            pkt["id"] = pkt_id
            pkt["session_id"] = session_id
            _broadcast(session_id, pkt)

        time.sleep(random.uniform(0.3, 1.2))

    _finalize_session(session_id)


def _real_sniff(session_id: str, url: str, duration: int, stop_event: threading.Event):
    """Force simulation mode on Mac/dev environments."""
    print("[Sniff] Starting simulation mode.")
    _simulated_sniff(session_id, url, duration, stop_event)


def _finalize_session(session_id: str):
    conn = get_connection()
    c = conn.cursor()
    c.execute(
        "UPDATE sessions SET status='completed', ended_at=? WHERE id=?",
        (time.time(), session_id)
    )
    conn.commit()
    conn.close()
    if session_id in _active:
        _active[session_id]["status"] = "completed"
    _broadcast(session_id, {"__event__": "session_ended", "session_id": session_id})


def start_session(url: str, duration: int) -> str:
    """Create a DB session and launch sniffing thread. Returns session_id."""
    session_id = str(uuid.uuid4())
    url_hash = hash_url(url)

    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        INSERT INTO sessions (id, url, url_hash, status, started_at)
        VALUES (?, ?, ?, 'running', ?)
    """, (session_id, url, url_hash, time.time()))
    conn.commit()
    conn.close()

    stop_event = threading.Event()
    thread = threading.Thread(
        target=_real_sniff,
        args=(session_id, url, duration, stop_event),
        daemon=True,
    )
    thread.start()

    _active[session_id] = {
        "thread": thread,
        "stop_event": stop_event,
        "status": "running",
    }
    return session_id


def stop_session(session_id: str) -> bool:
    """Signal a running session to stop."""
    if session_id not in _active:
        return False
    _active[session_id]["stop_event"].set()
    _active[session_id]["status"] = "stopped"
    _finalize_session(session_id)
    return True


def get_session_status(session_id: str) -> Optional[str]:
    if session_id in _active:
        return _active[session_id]["status"]
    return None