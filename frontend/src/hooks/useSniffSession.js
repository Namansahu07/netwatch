import { useState, useEffect, useRef, useCallback } from 'react'
import { api, createWebSocket } from '../utils/api'

export function useSniffSession() {
  const [session, setSession] = useState(null)
  const [packets, setPackets] = useState([])
  const [stats, setStats] = useState(null)
  const [status, setStatus] = useState('idle') // idle | starting | running | completed | error
  const [error, setError] = useState(null)
  const wsRef = useRef(null)
  const sessionRef = useRef(null)
  const pollRef = useRef(null)

  const startPolling = useCallback((sessionId) => {
    pollRef.current = setInterval(async () => {
      try {
        const [s, st] = await Promise.all([
          api.getSession(sessionId),
          api.getStats(sessionId),
        ])
        setSession(s)
        setStats(st)
        if (s.status === 'completed') {
          clearInterval(pollRef.current)
          setStatus('completed')
        }
      } catch (_) {}
    }, 2000)
  }, [])

  const start = useCallback(async (url, duration) => {
    setError(null)
    setPackets([])
    setStats(null)
    setStatus('starting')

    try {
      const { session_id } = await api.startSniff(url, duration)
      sessionRef.current = session_id

      const sess = await api.getSession(session_id)
      setSession(sess)
      setStatus('running')

      // Open WebSocket for live packets
      wsRef.current = createWebSocket(
        session_id,
        (data) => {
          if (data.__event__ === 'session_ended') {
            setStatus('completed')
            return
          }
          if (data.__event__) return // heartbeat etc.
          setPackets((prev) => [data, ...prev].slice(0, 500))
        },
        () => setStatus((s) => s === 'running' ? 'completed' : s)
      )

      startPolling(session_id)
    } catch (e) {
      setError(e.message)
      setStatus('error')
    }
  }, [startPolling])

  const stop = useCallback(async () => {
    if (!sessionRef.current) return
    try {
      await api.stopSniff(sessionRef.current)
      setStatus('completed')
    } catch (_) {}
    wsRef.current?.close()
    clearInterval(pollRef.current)
  }, [])

  const reset = useCallback(() => {
    wsRef.current?.close()
    clearInterval(pollRef.current)
    setSession(null)
    setPackets([])
    setStats(null)
    setStatus('idle')
    setError(null)
    sessionRef.current = null
  }, [])

  useEffect(() => {
    return () => {
      wsRef.current?.close()
      clearInterval(pollRef.current)
    }
  }, [])

  return { session, packets, stats, status, error, start, stop, reset }
}
