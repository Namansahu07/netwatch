import { useState } from 'react'
import { Search, Play, Square, RotateCcw, Lock, Unlock, Clock } from 'lucide-react'

const QUICK_URLS = [
  'https://google.com',
  'https://github.com',
  'http://example.com',
  'https://cloudflare.com',
]

export default function URLInput({ status, onStart, onStop, onReset }) {
  const [url, setUrl] = useState('')
  const [duration, setDuration] = useState(60)

  const isSecure = url.toLowerCase().startsWith('https://')
  const isRunning = status === 'running'
  const isStarting = status === 'starting'
  const isDone = status === 'completed' || status === 'error'

  const handleStart = () => {
    if (!url.trim()) return
    const finalUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`
    onStart(finalUrl, duration)
  }

  return (
    <div className="cyber-card rounded-xl p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-5">
        <Search className="w-4 h-4 text-cyber-accent" />
        <h2 className="font-display text-sm tracking-widest text-cyber-text uppercase">
          Target Analysis
        </h2>
      </div>

      {/* URL Input */}
      <div className="relative mb-4">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
          {isSecure ? (
            <Lock className="w-4 h-4 text-cyber-accent" />
          ) : (
            <Unlock className="w-4 h-4 text-cyber-red" />
          )}
        </div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isRunning && !isStarting && handleStart()}
          placeholder="https://target-url.com"
          disabled={isRunning || isStarting}
          className="w-full bg-cyber-surface border border-cyber-border rounded-lg pl-10 pr-4 py-3.5
                     font-mono text-sm text-cyber-text placeholder-cyber-muted/50
                     focus:outline-none focus:border-cyber-accent/60 focus:shadow-[0_0_0_1px_#00ff8830]
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        />
        <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono px-2 py-0.5 rounded
          ${isSecure ? 'text-cyber-accent bg-cyber-accent/10' : url ? 'text-cyber-red bg-cyber-red/10' : 'text-cyber-muted'}`}>
          {url ? (isSecure ? 'HTTPS' : 'HTTP') : 'URL'}
        </div>
      </div>

      {/* Quick URLs */}
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="text-xs text-cyber-muted font-mono">Quick:</span>
        {QUICK_URLS.map((u) => (
          <button
            key={u}
            onClick={() => setUrl(u)}
            disabled={isRunning || isStarting}
            className="text-xs font-mono text-cyber-muted hover:text-cyber-blue px-2 py-0.5
                       border border-cyber-border hover:border-cyber-blue/40 rounded
                       transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {u.replace('https://', '').replace('http://', '')}
          </button>
        ))}
      </div>

      {/* Duration */}
      <div className="flex items-center gap-3 mb-5">
        <Clock className="w-4 h-4 text-cyber-muted flex-shrink-0" />
        <span className="text-xs font-mono text-cyber-muted">Duration:</span>
        <input
          type="range"
          min={15}
          max={300}
          step={15}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          disabled={isRunning || isStarting}
          className="flex-1 accent-[#00ff88] disabled:opacity-50"
        />
        <span className="text-xs font-mono text-cyber-accent w-14 text-right">
          {duration >= 60 ? `${duration / 60}m` : `${duration}s`}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {!isRunning && !isStarting ? (
          <button
            onClick={handleStart}
            disabled={!url.trim() || isDone}
            className="flex-1 flex items-center justify-center gap-2 bg-cyber-accent text-cyber-bg
                       font-display text-sm font-bold py-3 px-6 rounded-lg
                       hover:bg-cyber-accent/90 active:scale-[0.98]
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all shadow-[0_0_20px_#00ff8840]"
          >
            <Play className="w-4 h-4" />
            START ANALYSIS
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex-1 flex items-center justify-center gap-2 bg-cyber-red/90 text-white
                       font-display text-sm font-bold py-3 px-6 rounded-lg
                       hover:bg-cyber-red active:scale-[0.98]
                       transition-all shadow-[0_0_20px_#ff475740]"
          >
            <Square className="w-4 h-4 fill-current" />
            STOP CAPTURE
          </button>
        )}

        {(isDone || isRunning) && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 border border-cyber-border text-cyber-muted
                       font-mono text-sm py-3 px-4 rounded-lg
                       hover:border-cyber-muted hover:text-cyber-text
                       transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>

      {/* Status bar */}
      {(isRunning || isStarting) && (
        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-cyber-accent">
          <span className="w-2 h-2 bg-cyber-accent rounded-full pulse-dot" />
          {isStarting ? 'Initializing capture engine...' : 'Capturing live traffic...'}
        </div>
      )}
    </div>
  )
}
