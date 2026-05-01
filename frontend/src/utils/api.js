const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  health: () => request('/health'),

  startSniff: (url, duration = 60) =>
    request('/sniff/start', {
      method: 'POST',
      body: JSON.stringify({ url, duration }),
    }),

  stopSniff: (sessionId) =>
    request(`/sniff/stop/${sessionId}`, { method: 'POST' }),

  getSession: (sessionId) => request(`/sniff/session/${sessionId}`),

  listSessions: () => request('/sniff/sessions'),

  getPackets: (sessionId, limit = 100, offset = 0) =>
    request(`/packets/${sessionId}?limit=${limit}&offset=${offset}`),

  getStats: (sessionId) => request(`/stats/${sessionId}`),

  getOverview: () => request('/stats/overview/all'),

  exportUrl: (sessionId) => `${BASE}/packets/${sessionId}/export`,
}

export function createWebSocket(sessionId, onMessage, onClose) {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const host = window.location.host
const ws = new WebSocket(`${protocol}://localhost:8000/ws/live/${sessionId}`)

  ws.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data)
      onMessage(data)
    } catch (_) {}
  }
  ws.onclose = onClose || (() => {})
  ws.onerror = (e) => console.error('WS error', e)

  return ws
}
