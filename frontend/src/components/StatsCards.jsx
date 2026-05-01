import { Shield, ShieldAlert, Activity, Zap } from 'lucide-react'

function Card({ label, value, icon: Icon, color, sub }) {
  const colors = {
    green: 'text-cyber-accent border-cyber-accent/30 bg-cyber-accent/5',
    red: 'text-cyber-red border-cyber-red/30 bg-cyber-red/5',
    blue: 'text-cyber-blue border-cyber-blue/30 bg-cyber-blue/5',
    yellow: 'text-cyber-yellow border-cyber-yellow/30 bg-cyber-yellow/5',
    purple: 'text-cyber-purple border-cyber-purple/30 bg-cyber-purple/5',
  }
  const c = colors[color] || colors.blue

  return (
    <div className={`cyber-card rounded-xl p-5 border ${c} animate-slide-up`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg bg-current/10`}>
          <Icon className={`w-5 h-5 ${c.split(' ')[0]}`} />
        </div>
      </div>
      <div className={`font-display font-bold text-3xl ${c.split(' ')[0]} count-up mb-1`}>
        {value ?? '—'}
      </div>
      <div className="text-xs font-mono text-cyber-muted uppercase tracking-widest">{label}</div>
      {sub && <div className="text-xs text-cyber-muted/70 mt-1 font-mono">{sub}</div>}
    </div>
  )
}

export default function StatsCards({ session, packets }) {
  const total = session?.total_packets ?? packets.length
  const secure = session?.secure_count ?? packets.filter((p) => p.is_secure).length
  const insecure = session?.insecure_count ?? packets.filter((p) => !p.is_secure).length
  const secureRate = total > 0 ? Math.round((secure / total) * 100) : 0
  const riskLevel =
    insecure === 0 ? 'LOW' : insecure < total * 0.3 ? 'MEDIUM' : 'HIGH'

  const riskColor = { LOW: 'green', MEDIUM: 'yellow', HIGH: 'red' }[riskLevel]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        label="Total Packets"
        value={total.toLocaleString()}
        icon={Activity}
        color="blue"
        sub="captured"
      />
      <Card
        label="Secure (HTTPS)"
        value={secure.toLocaleString()}
        icon={Shield}
        color="green"
        sub={`${secureRate}% of traffic`}
      />
      <Card
        label="Insecure (HTTP)"
        value={insecure.toLocaleString()}
        icon={ShieldAlert}
        color="red"
        sub={`${100 - secureRate}% of traffic`}
      />
      <Card
        label="Risk Level"
        value={riskLevel}
        icon={Zap}
        color={riskColor}
        sub={session?.status ?? 'idle'}
      />
    </div>
  )
}
