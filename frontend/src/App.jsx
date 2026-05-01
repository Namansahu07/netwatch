import { useState, useEffect } from 'react'
import Header from './components/Header.jsx'
import URLInput from './components/URLInput.jsx'
import StatsCards from './components/StatsCards.jsx'
import TrafficCharts from './components/TrafficCharts.jsx'
import PacketTable from './components/PacketTable.jsx'
import SecurityStatus from './components/SecurityStatus.jsx'
import SessionHistory from './components/SessionHistory.jsx'
import LiveMonitor from './components/LiveMonitor.jsx'
import { useSniffSession } from './hooks/useSniffSession.js'
import { api } from './utils/api.js'

export default function App() {
  const [backendOnline, setBackendOnline] = useState(false)
  const [sessions, setSessions] = useState([])
  const { session, packets, stats, status, error, start, stop, reset } = useSniffSession()

  // Health check
  useEffect(() => {
    const check = async () => {
      try {
        await api.health()
        setBackendOnline(true)
      } catch {
        setBackendOnline(false)
      }
    }
    check()
    const t = setInterval(check, 10000)
    return () => clearInterval(t)
  }, [])

  // Load session history
  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.listSessions()
        setSessions(data)
      } catch (_) {}
    }
    load()
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen bg-cyber-bg">
      <Header backendOnline={backendOnline} />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Backend offline banner */}
        {!backendOnline && (
          <div className="bg-cyber-red/10 border border-cyber-red/30 rounded-xl px-5 py-4
                          flex items-center gap-3 animate-fade-in">
            <span className="font-mono text-cyber-red text-sm">⚠ Backend offline.</span>
            <span className="font-mono text-cyber-muted text-xs">
              Run: <code className="text-cyber-yellow">cd backend && python main.py</code>
            </span>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="bg-cyber-red/10 border border-cyber-red/30 rounded-xl px-5 py-4
                          font-mono text-cyber-red text-sm animate-fade-in">
            Error: {error}
          </div>
        )}

        {/* Top row: Input + Security Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <URLInput
            status={status}
            onStart={start}
            onStop={stop}
            onReset={reset}
          />
          <SecurityStatus session={session} packets={packets} />
        </div>

        {/* Stats cards */}
        <StatsCards session={session} packets={packets} />

        {/* Live Monitor */}
        <LiveMonitor packets={packets} status={status} />

        {/* Charts */}
        {(packets.length > 0 || stats) && (
          <TrafficCharts packets={packets} stats={stats} />
        )}

        {/* Packet Table */}
        <PacketTable
          packets={packets}
          sessionId={session?.id}
        />

        {/* Session History */}
        <SessionHistory
          sessions={sessions}
          onSelect={(s) => {
            // Load historical session — just display its URL
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />

        {/* Footer */}
        <footer className="text-center py-8 border-t border-cyber-border">
          <p className="font-mono text-xs text-cyber-muted/60">
            NetWatch v1.0 — Secure Network Traffic Analyzer
            <span className="mx-3 text-cyber-border">|</span>
            Built on FastAPI · React · Scapy · AES-256
            <span className="mx-3 text-cyber-border">|</span>
            Educational use only
          </p>
        </footer>
      </main>
    </div>
  )
}
