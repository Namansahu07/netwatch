"""
Database layer — SQLite via sqlite3 (no ORM dependency needed)
"""
import sqlite3
import os

DB_PATH = os.getenv("DB_PATH", "netwatch.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            url TEXT NOT NULL,
            url_hash TEXT NOT NULL,
            status TEXT DEFAULT 'running',
            started_at REAL NOT NULL,
            ended_at REAL,
            total_packets INTEGER DEFAULT 0,
            secure_count INTEGER DEFAULT 0,
            insecure_count INTEGER DEFAULT 0
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS packets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            src_ip TEXT,
            dst_ip TEXT,
            protocol TEXT,
            src_port INTEGER,
            dst_port INTEGER,
            payload_size INTEGER,
            is_secure INTEGER DEFAULT 0,
            risk_level TEXT DEFAULT 'LOW',
            encrypted_data TEXT,
            captured_at REAL NOT NULL,
            FOREIGN KEY (session_id) REFERENCES sessions(id)
        )
    """)

    conn.commit()
    conn.close()
    print("[DB] Tables initialized.")
