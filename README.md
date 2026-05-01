# 🛡️ NetWatch — Secure Network Traffic Analyzer

> Full-stack cybersecurity dashboard for real-time network packet analysis.  
> Built for: Secure Network Traffic Analysis Using Packet Sniffing  
> Jaypee Institute of Information Technology, Noida — Information Security Project

---

## 📐 Architecture Overview

```
netwatch/
├── backend/                   # FastAPI Python backend
│   ├── main.py                # App entry point + CORS + routing
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables
│   ├── routes/
│   │   ├── sniff.py           # Start/stop/list sessions
│   │   ├── packets.py         # Fetch packets + CSV export
│   │   ├── stats.py           # Aggregated analytics
│   │   └── websocket.py       # WS live streaming
│   ├── services/
│   │   └── sniffer.py         # Core sniffing engine (Scapy + simulation fallback)
│   ├── models/
│   │   ├── database.py        # SQLite init + connection
│   │   └── schemas.py         # Pydantic models
│   └── utils/
│       ├── crypto.py          # AES-256 encryption (PyCryptodome)
│       └── hashing.py         # SHA-256 URL hashing + port classification
│
└── frontend/                  # React + Vite + Tailwind
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx            # Root layout + orchestration
        ├── index.css          # Global dark theme + animations
        ├── main.jsx
        ├── components/
        │   ├── Header.jsx         # Nav + backend status
        │   ├── URLInput.jsx       # Target input + duration slider
        │   ├── StatsCards.jsx     # 4 live KPI cards
        │   ├── SecurityStatus.jsx # SECURE / MODERATE / INSECURE badge
        │   ├── LiveMonitor.jsx    # Terminal-style live feed
        │   ├── TrafficCharts.jsx  # Pie + Area + Bar charts (Recharts)
        │   ├── PacketTable.jsx    # Filterable packet log + CSV export
        │   └── SessionHistory.jsx # Past session list
        ├── hooks/
        │   └── useSniffSession.js # WS + polling state management
        └── utils/
            └── api.js             # Typed API client
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

---

### 1. Clone / Unzip the project

```bash
cd netwatch
```

---

### 2. Backend Setup

```bash
cd backend
```

**Create virtual environment (recommended):**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

**Install dependencies:**
```bash
pip install -r requirements.txt
```

**Configure environment:**
```bash
# .env is already pre-filled. Optionally edit AES_SECRET_KEY:
cp .env .env.local
```

**Run the backend:**
```bash
python main.py
```

Backend will start at: **http://localhost:8000**  
API docs available at: **http://localhost:8000/docs**

---

### 3. Frontend Setup

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend will start at: **http://localhost:5173**

---

### 4. Permissions for Real Packet Sniffing

Real Scapy sniffing requires root/admin access to capture raw packets.

**Linux/macOS:**
```bash
sudo python main.py
# OR grant capability to python:
sudo setcap cap_net_raw=eip $(which python3)
python main.py
```

**Windows:**
- Run terminal as Administrator
- Then: `python main.py`

> **No root?** The backend automatically falls back to a realistic **simulation mode** that generates statistically accurate traffic patterns — the UI works identically.

---

### 5. How to Use

1. Open **http://localhost:5173**
2. Enter a URL (e.g., `https://google.com` or `http://example.com`)
3. Set capture duration (15s – 5min)
4. Click **START ANALYSIS**
5. Watch live packets stream in:
   - Terminal-style live monitor
   - Real-time KPI cards updating
   - Security status badge changing
6. View charts after ~5s of data
7. Filter/export packet logs as CSV
8. Click **STOP CAPTURE** anytime

---

## 🔐 Security Implementation

| Feature | Implementation |
|---------|---------------|
| Packet capture | Scapy (raw socket) with simulation fallback |
| Data encryption | AES-256-CBC (PyCryptodome) |
| URL privacy | SHA-256 hashing before DB storage |
| Port classification | 20+ port → protocol/risk mappings |
| HTTPS detection | Port 443/8443 → SECURE, Port 80/8080 → INSECURE |
| Storage | SQLite with encrypted `encrypted_data` column |
| CORS | FastAPI middleware (configurable origins) |
| WS streaming | FastAPI WebSocket with async queue per session |

---

## 🌐 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Backend status |
| POST | `/api/sniff/start` | Start sniffing session |
| POST | `/api/sniff/stop/{id}` | Stop session |
| GET | `/api/sniff/session/{id}` | Get session details |
| GET | `/api/sniff/sessions` | List all sessions |
| GET | `/api/packets/{id}` | Get packets (paginated) |
| GET | `/api/packets/{id}/export` | Download CSV |
| GET | `/api/stats/{id}` | Get analytics |
| WS | `/ws/live/{id}` | Live packet stream |

---

## 🧪 Troubleshooting

**Backend won't start:**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Scapy import error on Windows:**
```bash
pip install scapy
# Also install Npcap from https://npcap.com/
```

**CORS error in browser:**
- Ensure backend is running on port 8000
- Check `vite.config.js` proxy settings

**No packets appearing:**
- Check backend console — look for `[Sniff]` logs
- If no root: simulation mode starts automatically
- Check WebSocket connection in browser DevTools → Network → WS

**Port already in use:**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9   # macOS/Linux
netstat -ano | findstr :8000    # Windows
```

---

## 📚 Technologies

**Backend:** FastAPI · Uvicorn · Scapy · PyCryptodome · SQLite  
**Frontend:** React 18 · Vite · Tailwind CSS · Recharts · Lucide Icons  
**Security:** AES-256-CBC · SHA-256 · HTTPS classification · Risk scoring

---

*This project is strictly for educational purposes. Only analyze traffic on networks you own or have explicit permission to monitor.*
