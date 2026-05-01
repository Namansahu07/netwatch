"""
Hashing utilities — SHA-256 URL hashing for privacy preservation.
"""
import hashlib
import re
from urllib.parse import urlparse


def hash_url(url: str) -> str:
    """SHA-256 hash a URL for privacy-safe storage."""
    return hashlib.sha256(url.strip().encode()).hexdigest()


def extract_host(url: str) -> str:
    """Extract hostname from URL."""
    try:
        parsed = urlparse(url if url.startswith("http") else f"https://{url}")
        return parsed.netloc or url
    except Exception:
        return url


def is_secure_url(url: str) -> bool:
    """Check if URL uses HTTPS."""
    return url.strip().lower().startswith("https://")


def classify_port(port: int) -> dict:
    """Classify a port number and return protocol info."""
    secure_ports = {443, 8443, 993, 995, 465, 636, 989, 990}
    insecure_ports = {80, 8080, 21, 23, 25, 110, 143, 389}

    common = {
        80: ("HTTP", False, "HIGH"),
        443: ("HTTPS", True, "LOW"),
        8080: ("HTTP-Alt", False, "HIGH"),
        8443: ("HTTPS-Alt", True, "LOW"),
        21: ("FTP", False, "CRITICAL"),
        22: ("SSH", True, "LOW"),
        23: ("TELNET", False, "CRITICAL"),
        25: ("SMTP", False, "MEDIUM"),
        53: ("DNS", False, "MEDIUM"),
        110: ("POP3", False, "HIGH"),
        143: ("IMAP", False, "HIGH"),
        993: ("IMAPS", True, "LOW"),
        995: ("POP3S", True, "LOW"),
        465: ("SMTPS", True, "LOW"),
        3306: ("MySQL", False, "CRITICAL"),
        5432: ("PostgreSQL", False, "CRITICAL"),
    }

    if port in common:
        name, sec, risk = common[port]
        return {"protocol_name": name, "is_secure": sec, "risk_level": risk}

    is_sec = port in secure_ports
    return {
        "protocol_name": f"Port-{port}",
        "is_secure": is_sec,
        "risk_level": "LOW" if is_sec else "MEDIUM",
    }
