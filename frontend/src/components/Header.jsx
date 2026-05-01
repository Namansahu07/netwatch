import { Shield, Activity, Wifi } from 'lucide-react'

export default function Header({ backendOnline }) {
  return (
    <header className="border-b border-cyber-border bg-cyber-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Shield className="w-8 h-8 text-cyber-accent" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyber-accent rounded-full pulse-dot" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-cyber-text tracking-wider">
              NET<span className="text-cyber-accent">WATCH</span>
            </h1>
            <p className="text-[10px] text-cyber-muted font-mono tracking-widest uppercase">
              Secure Traffic Analyzer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-cyber-muted">
            <Activity className="w-3.5 h-3.5" />
            <span>v1.0.0</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-cyber-accent pulse-dot' : 'bg-cyber-red'}`} />
            <span className={`text-xs font-mono ${backendOnline ? 'text-cyber-accent' : 'text-cyber-red'}`}>
              {backendOnline ? 'BACKEND ONLINE' : 'BACKEND OFFLINE'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
