import { Clock, ChevronRight } from 'lucide-react'

export default function SessionHistory({ sessions, onSelect }) {
  if (!sessions || sessions.length === 0) return null

  return (
    <div className="cyber-card rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-cyber-border flex items-center gap-2">
        <Clock className="w-4 h-4 text-cyber-muted" />
        <span className="font-display text-xs tracking-widest text-cyber-muted uppercase">
          Recent Sessions
        </span>
      </div>
      <div className="divide-y divide-cyber-border/50">
        {sessions.slice(0, 5).map((s) => {
          const secRate = s.total_packets > 0
            ? Math.round((s.secure_count / s.total_packets) * 100)
            : 0
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className="w-full flex items-center gap-4 px-5 py-3 hover:bg-cyber-surface/50
                         transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm text-cyber-text truncate">{s.url}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-mono text-xs text-cyber-muted">
                    {new Date(s.started_at * 1000).toLocaleDateString()}
                  </span>
                  <span className="font-mono text-xs text-cyber-muted">
                    {s.total_packets} pkts
                  </span>
                  <span className={`font-mono text-xs ${
                    secRate >= 80 ? 'text-cyber-accent' :
                    secRate >= 50 ? 'text-cyber-yellow' : 'text-cyber-red'
                  }`}>
                    {secRate}% secure
                  </span>
                </div>
              </div>
              <div className={`px-2 py-0.5 rounded text-[10px] font-mono
                ${s.status === 'running' ? 'text-cyber-accent bg-cyber-accent/10' :
                  'text-cyber-muted bg-cyber-border/30'}`}>
                {s.status.toUpperCase()}
              </div>
              <ChevronRight className="w-4 h-4 text-cyber-muted/50 flex-shrink-0" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
