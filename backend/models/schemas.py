from pydantic import BaseModel
from typing import Optional


class StartSniffRequest(BaseModel):
    url: str
    duration: int = 30  # seconds


class SessionOut(BaseModel):
    id: str
    url: str
    url_hash: str
    status: str
    started_at: float
    ended_at: Optional[float]
    total_packets: int
    secure_count: int
    insecure_count: int


class PacketOut(BaseModel):
    id: int
    session_id: str
    src_ip: Optional[str]
    dst_ip: Optional[str]
    protocol: Optional[str]
    src_port: Optional[int]
    dst_port: Optional[int]
    payload_size: Optional[int]
    is_secure: bool
    risk_level: str
    captured_at: float
