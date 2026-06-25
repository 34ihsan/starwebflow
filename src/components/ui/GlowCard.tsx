'use client'

import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

interface GlowCardProps extends HTMLAttributes<HTMLDivElement> {
  glowColor?: 'blue' | 'purple' | 'cyan' | 'emerald' | 'amber' | 'none'
  hover?: boolean
}

const glowMap = {
  blue:    'hover:border-[#4F8EF7]/40 hover:shadow-[0_0_40px_rgba(79,142,247,0.15)]',
  purple:  'hover:border-[#8B5CF6]/40 hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]',
  cyan:    'hover:border-[#06B6D4]/40 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]',
  emerald: 'hover:border-[#10B981]/40 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]',
  amber:   'hover:border-[#F59E0B]/40 hover:shadow-[0_0_40px_rgba(245,158,11,0.15)]',
  none:    '',
}

const GlowCard = forwardRef<HTMLDivElement, GlowCardProps>(
  ({ className, glowColor = 'blue', hover = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-2xl border border-white/[0.06] bg-[#12121F]/80',
          'backdrop-blur-sm',
          hover && 'transition-all duration-300 hover:-translate-y-1.5 cursor-default',
          hover && glowMap[glowColor],
          className
        )}
        {...props}
      >
        {/* Inner top highlight */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
          }}
        />
        {children}
      </div>
    )
  }
)

GlowCard.displayName = 'GlowCard'

export default GlowCard
