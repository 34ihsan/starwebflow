'use client'

import { useEffect, useState, useRef } from 'react'
import { Terminal, ChevronDown, ChevronUp } from 'lucide-react'
import { TerminalLog } from './ServiceLayout'

interface ExpertTerminalProps {
  logs: TerminalLog[]
}

const typeColors = {
  info:    { label: 'INFO',    color: '#4F8EF7' },
  success: { label: 'SUCCESS', color: '#10B981' },
  warn:    { label: 'WARN',    color: '#F59E0B' },
  error:   { label: 'ERROR',   color: '#EF4444' },
}

export default function ExpertTerminal({ logs }: ExpertTerminalProps) {
  const [visibleLogs, setVisibleLogs] = useState<(TerminalLog & { id: number; ts: string })[]>([])
  const [expanded, setExpanded] = useState(false)
  const [showAfterScroll, setShowAfterScroll] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef(0)

  // Show terminal after user scrolls 400px
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 400) setShowAfterScroll(true)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Rotate logs every 2.5s
  useEffect(() => {
    if (!showAfterScroll) return
    const logsExtended = [...logs, ...logs, ...logs]
    let idx = 0
    const interval = setInterval(() => {
      const log = logsExtended[idx % logsExtended.length]
      const now = new Date()
      const ts = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      setVisibleLogs(prev => {
        const updated = [...prev, { ...log, id: ++counterRef.current, ts }]
        return updated.slice(-6) // keep last 6
      })
      idx++
    }, 2500)
    return () => clearInterval(interval)
  }, [showAfterScroll, logs])

  // Auto-scroll log container
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [visibleLogs])

  if (!showAfterScroll) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-40 transition-all duration-500"
      style={{ maxWidth: expanded ? '380px' : '320px' }}
    >
      <div className="glass rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] cursor-pointer"
          style={{ background: 'rgba(10,10,15,0.9)' }}
          onClick={() => setExpanded(e => !e)}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            </div>
            <Terminal className="w-3.5 h-3.5 text-[#4F8EF7]" />
            <span className="text-xs font-mono text-[#64748B]">starwebflow-ai ~ system</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-[#475569]" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-[#475569]" />
            )}
          </div>
        </div>

        {/* Logs */}
        <div
          ref={logRef}
          className="overflow-y-auto scrollbar-none"
          style={{
            background: 'rgba(8,8,14,0.95)',
            maxHeight: expanded ? '200px' : '130px',
            transition: 'max-height 0.3s ease',
          }}
        >
          <div className="p-3 space-y-1.5">
            {visibleLogs.map((log) => {
              const meta = typeColors[log.type]
              return (
                <div
                  key={log.id}
                  className="flex items-start gap-2 text-xs font-mono"
                  style={{ animation: 'fadeInLeft 0.3s ease both' }}
                >
                  <span className="text-[#334155] shrink-0">{log.ts}</span>
                  <span
                    className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold"
                    style={{ color: meta.color, background: `${meta.color}15` }}
                  >
                    {meta.label}
                  </span>
                  <span className="text-[#64748B] leading-relaxed">{log.text}</span>
                </div>
              )
            })}
            {visibleLogs.length === 0 && (
              <div className="text-[#334155] text-xs font-mono">Başlatılıyor...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
