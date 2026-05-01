import { Terminal } from 'lucide-react'

export default function LiveMonitor({ packets, status }) {
  const lines = packets.slice(0, 80).reverse()

  return (
    <div className="cyber-card rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-cyber-border bg-cyber-surface">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyber-accent" />
          <span className="font-mono text-xs text-cyber-muted uppercase tracking-wider">
            Live Monitor
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${status === 'running' ? 'bg-cyber-accent pulse-dot' : 'bg-cyber-border'}`} />
          <span className="font-mono text-[10px] text-cyber-muted uppercase">
            {status === 'running' ? 'CAPTURING' : status.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="h-48 overflow-y-auto bg-cyber-bg/80 p-4 font-mono text-xs terminal-text">
        {lines.length === 0 ? (
          <div className="text-cyber-muted">
            <span className="text-cyber-accent">&gt;</span> Waiting for packets
            <span className="animate-blink">_</span>
          </div>
        ) : (
          lines.map((p, i) => (
            <div key={p.id ?? i} className={`mb-0.5 ${i === 0 ? 'animate-fade-in' : ''}`}>
              <span className="text-cyber-muted/60">
                {new Date(p.captured_at * 1000).toLocaleTimeString()}
              </span>
              {' '}
              <span className={p.is_secure ? 'text-cyber-accent' : 'text-cyber-red'}>
                {p.is_secure ? '[SECURE]' : '[INSECURE]'}
              </span>
              {' '}
              <span className="text-cyber-blue">{p.src_ip}</span>
              <span className="text-cyber-muted"> → </span>
              <span className="text-cyber-text">{p.dst_ip}</span>
              <span className="text-cyber-muted"> :{p.dst_port} </span>
              <span className="text-cyber-purple">{p.protocol}</span>
              <span className="text-cyber-muted"> {p.payload_size}B</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}