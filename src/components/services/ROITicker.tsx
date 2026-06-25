'use client'

import { useEffect, useRef, useState } from 'react'

interface ROITickerProps {
  value: number
  prefix?: string
  suffix?: string
  label: string
  sublabel?: string
  accentColor: string
  duration?: number
}

function useCountUp(target: number, duration: number, started: boolean) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!started) return
    let startTime: number | null = null

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(eased * target)
      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }, [started, target, duration])

  return count
}

export default function ROITicker({
  value,
  prefix = '',
  suffix = '',
  label,
  sublabel,
  accentColor,
  duration = 2000,
}: ROITickerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)
  const count = useCountUp(value, duration, started)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.unobserve(el) } },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const formattedCount = value % 1 !== 0
    ? count.toFixed(1).replace('.', ',')
    : Math.floor(count).toLocaleString('tr-TR')

  return (
    <div ref={ref} className="text-center">
      <div
        className="text-4xl md:text-5xl font-black font-['Outfit'] mb-1"
        style={{
          background: `linear-gradient(135deg, ${accentColor} 0%, white 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {prefix}{formattedCount}{suffix}
      </div>
      <div className="text-sm text-[#94A3B8] font-medium">{label}</div>
      {sublabel && <div className="text-xs text-[#475569] mt-0.5">{sublabel}</div>}
    </div>
  )
}

