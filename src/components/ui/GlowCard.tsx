'use client'

import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

interface GlowCardProps extends HTMLAttributes<HTMLDivElement> {
  glowColor?: 'blue' | 'purple' | 'cyan' | 'emerald' | 'amber' | 'none'
  hover?: boolean
}

const glowMap = {
  blue:    'hover:border-[#4F8EF7]/60 hover:shadow-[0_14px_45px_-10px_rgba(79,142,247,0.22)]',
  purple:  'hover:border-[#8B5CF6]/60 hover:shadow-[0_14px_45px_-10px_rgba(139,92,246,0.22)]',
  cyan:    'hover:border-[#06B6D4]/60 hover:shadow-[0_14px_45px_-10px_rgba(6,182,212,0.22)]',
  emerald: 'hover:border-[#10B981]/60 hover:shadow-[0_14px_45px_-10px_rgba(16,185,129,0.22)]',
  amber:   'hover:border-[#F59E0B]/60 hover:shadow-[0_14px_45px_-10px_rgba(245,158,11,0.22)]',
  none:    '',
}

const GlowCard = forwardRef<HTMLDivElement, GlowCardProps>(
  ({ className, glowColor = 'blue', hover = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05),0_10px_35px_-8px_rgba(0,0,0,0.04)]',
          hover && 'transition-all duration-300 hover:-translate-y-1.5 cursor-default',
          hover && glowMap[glowColor],
          className
        )}
        {...props}
      >
        {/* Inner top highlight line for crisp premium glass look */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-slate-300/70 to-transparent"
        />
        {children}
      </div>
    )
  }
)

GlowCard.displayName = 'GlowCard'

export default GlowCard
