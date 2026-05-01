import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend,
  BarChart, Bar,
} from 'recharts'

const RADIAN = Math.PI / 180

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#e6edf3" textAnchor="middle" dominantBaseline="central"
          fontSize={11} fontFamily="JetBrains Mono">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

function Panel({ title, children }) {
  return (
    <div className="cyber-card rounded-xl p-5">
      <h3 className="font-display text-xs tracking-widest text-cyber-muted uppercase mb-5">
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function TrafficCharts({ packets, stats }) {
  // Secure vs insecure pie
  const pieData = [
    { name: 'HTTPS / Secure', value: packets.filter((p) => p.is_secure).length },
    { name: 'HTTP / Insecure', value: packets.filter((p) => !p.is_secure).length },
  ].filter((d) => d.value > 0)

  // Protocol bar
  const protoMap = {}
  packets.forEach((p) => {
    protoMap[p.protocol || 'OTHER'] = (protoMap[p.protocol || 'OTHER'] || 0) + 1
  })
  const protoData = Object.entries(protoMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  // Timeline area chart from stats or built from packets
  let timelineData = stats?.timeline ?? []
  if (!timelineData.length && packets.length > 0) {
    const buckets = {}
    packets.forEach((p) => {
      const bucket = Math.floor(p.captured_at / 5) * 5
      if (!buckets[bucket]) buckets[bucket] = { t: bucket, secure: 0, insecure: 0 }
      p.is_secure ? buckets[bucket].secure++ : buckets[bucket].insecure++
    })
    timelineData = Object.values(buckets)
      .sort((a, b) => a.t - b.t)
      .map((b) => ({ ...b, time: new Date(b.t * 1000).toLocaleTimeString() }))
  } else {
    timelineData = timelineData.map((b) => ({
      ...b,
      time: new Date(b.bucket * 1000).toLocaleTimeString(),
    }))
  }

  const PIE_COLORS = ['#00ff88', '#ff4757']
  const CHART_STYLE = {
    fontFamily: 'JetBrains Mono',
    fontSize: 11,
  }

  if (packets.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {['Secure vs Insecure', 'Protocol Distribution'].map((t) => (
          <Panel key={t} title={t}>
            <div className="h-48 flex items-center justify-center text-cyber-muted font-mono text-sm">
              Waiting for packets...
            </div>
          </Panel>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Timeline */}
      {timelineData.length > 1 && (
        <Panel title="Traffic Timeline">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={timelineData} style={CHART_STYLE}>
              <defs>
                <linearGradient id="secGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="insecGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff4757" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff4757" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="time" stroke="#8b949e" tick={{ fontSize: 10 }} />
              <YAxis stroke="#8b949e" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8 }}
                labelStyle={{ color: '#e6edf3' }}
              />
              <Legend />
              <Area type="monotone" dataKey="secure" name="Secure" stroke="#00ff88" fill="url(#secGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="insecure" name="Insecure" stroke="#ff4757" fill="url(#insecGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie chart */}
        <Panel title="Security Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={CustomPieLabel}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8 }}
                formatter={(val, name) => [val.toLocaleString(), name]}
              />
              <Legend
                formatter={(val) => <span style={{ color: '#8b949e', fontSize: 11 }}>{val}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        {/* Protocol bar */}
        <Panel title="Protocol Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={protoData} style={CHART_STYLE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="name" stroke="#8b949e" tick={{ fontSize: 10 }} />
              <YAxis stroke="#8b949e" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8 }}
              />
              <Bar dataKey="count" name="Packets" fill="#58a6ff" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  )
}
