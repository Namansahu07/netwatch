import { Shield, ShieldAlert, ShieldOff, AlertTriangle } from 'lucide-react'

export default function SecurityStatus({ session, packets }) {
  const total = session?.total_packets ?? packets.length
  const secure = session?.secure_count ?? packets.filter((p) => p.is_secure).length
  const insecure = session?.insecure_count ?? packets.filter((p) => !p.is_secure).length
  const secureRate = total > 0 ? (secure / total) * 100 : null

  let level, Icon, color, borderColor, glowClass, message

  if (secureRate === null) {
    level = 'AWAITING'
    Icon = Shield
    color = 'text-cyber-muted'
    borderColor = 'border-cyber-border'
    glowClass = ''
    message = 'Start an analysis to see the security status of your target.'
  } else if (secureRate >= 90) {
    level = 'SECURE'
    Icon = Shield
    color = 'text-cyber-accent'
    borderColor = 'border-cyber-accent/40'
    glowClass = 'border-glow-green'
    message = 'Traffic is predominantly encrypted. Low risk of interception.'
  } else if (secureRate >= 60) {
    level = 'MODERATE'
    Icon = ShieldAlert
    color = 'text-cyber-yellow'
    borderColor = 'border-cyber-yellow/40'
    glowClass = ''
    message = 'Mixed traffic detected. Some unencrypted communication observed.'
  } else {
    level = 'INSECURE'
    Icon = ShieldOff
    color = 'text-cyber-red'
    borderColor = 'border-cyber-red/40'
    glowClass = 'border-glow-red'
    message = 'WARNING: High volume of unencrypted traffic. Sensitive data is at risk.'
  }

  return (
    <div className={`cyber-card rounded-xl p-5 border ${borderColor} ${glowClass}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl border ${borderColor} flex-shrink-0`}>
          <Icon className={`w-7 h-7 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-display text-xs tracking-widest text-cyber-muted uppercase">
              Security Status
            </span>
          </div>
          <div className={`font-display text-2xl font-bold ${color} mb-2`}>
            {level}
          </div>
          <p className="text-xs text-cyber-muted leading-relaxed font-mono">{message}</p>

          {secureRate !== null && (
            <div className="mt-3">
              <div className="flex justify-between text-xs font-mono text-cyber-muted mb-1">
                <span>Encryption coverage</span>
                <span className={color}>{secureRate.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-cyber-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    secureRate >= 90 ? 'bg-cyber-accent' :
                    secureRate >= 60 ? 'bg-cyber-yellow' : 'bg-cyber-red'
                  }`}
                  style={{ width: `${secureRate}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {insecure > 0 && (
        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-cyber-red/80
                        bg-cyber-red/5 border border-cyber-red/20 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{insecure} insecure packets detected — data transmitted in plain text</span>
        </div>
      )}
    </div>
  )
}
