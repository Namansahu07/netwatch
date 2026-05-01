import { useState } from 'react'
import { Download, Filter, ShieldCheck, ShieldAlert } from 'lucide-react'
import { api } from '../utils/api'

const RISK_COLORS = {
  LOW: 'text-cyber-accent bg-cyber-accent/10',
  MEDIUM: 'text-cyber-yellow bg-cyber-yellow/10',
  HIGH: 'text-cyber-red bg-cyber-red/10',
  CRITICAL: 'text-cyber-purple bg-cyber-purple/10',
}

export default function PacketTable({ packets, sessionId }) {
  const [filter, setFilter] = useState('all') // all | secure | insecure

  const filtered = packets.filter((p) => {
    if (filter === 'secure') return p.is_secure
    if (filter === 'insecure') return !p.is_secure
    return true
  })

  const handleExport = () => {
    if (!sessionId) return
    window.open(api.exportUrl(sessionId), '_blank')
  }

  return (
    <div className="cyber-card rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-cyber-border">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyber-muted" />
          <span className="font-display text-xs tracking-widest text-cyber-muted uppercase">
            Packet Logs
          </span>
          <span className="font-mono text-xs text-cyber-muted/60">
            ({filtered.length.toLocaleString()} shown)
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter tabs */}
          <div className="flex border border-cyber-border rounded-lg overflow-hidden">
            {[['all', 'All'], ['secure', 'Secure'], ['insecure', 'Insecure']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`px-3 py-1.5 text-xs font-mono transition-colors
                  ${filter === val
                    ? 'bg-cyber-accent/10 text-cyber-accent'
                    : 'text-cyber-muted hover:text-cyber-text'}`}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Export */}
          <button
            onClick={handleExport}
            disabled={!sessionId || packets.length === 0}
            className="flex items-center gap-1.5 text-xs font-mono text-cyber-muted
                       border border-cyber-border hover:border-cyber-accent/40
                       hover:text-cyber-accent px-3 py-1.5 rounded-lg
                       transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-96">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-cyber-muted font-mono text-sm">
            {packets.length === 0 ? 'No packets captured yet...' : 'No packets match filter'}
          </div>
        ) : (
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-cyber-border bg-cyber-surface sticky top-0">
                {['Status', 'Src IP', 'Dst IP', 'Protocol', 'Src Port', 'Dst Port', 'Size', 'Risk', 'Time'].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-cyber-muted tracking-wider uppercase text-[10px] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr
                  key={p.id ?? i}
                  className="border-b border-cyber-border/50 hover:bg-cyber-surface/50 transition-colors packet-row"
                >
                  <td className="px-4 py-2.5">
                    {p.is_secure ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-cyber-accent" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5 text-cyber-red" />
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-cyber-blue">{p.src_ip || '—'}</td>
                  <td className="px-4 py-2.5 text-cyber-text">{p.dst_ip || '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-cyber-purple">{p.protocol || '—'}</span>
                  </td>
                  <td className="px-4 py-2.5 text-cyber-muted">{p.src_port || '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className={p.dst_port === 443 || p.dst_port === 8443
                      ? 'text-cyber-accent' : 'text-cyber-red'}>
                      {p.dst_port || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-cyber-muted">
                    {p.payload_size ? `${p.payload_size}B` : '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${RISK_COLORS[p.risk_level] || 'text-cyber-muted'}`}>
                      {p.risk_level || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-cyber-muted/70 whitespace-nowrap">
                    {p.captured_at
                      ? new Date(p.captured_at * 1000).toLocaleTimeString()
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
