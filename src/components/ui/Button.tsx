'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const base =
      'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: `
        bg-purple-600 text-white border border-purple-600
        hover:bg-purple-700 hover:shadow-[0_4px_20px_rgba(147,51,234,0.35)]
        hover:-translate-y-0.5 active:translate-y-0
      `,
      secondary: `
        bg-white text-slate-800 border border-slate-300
        hover:border-purple-400 hover:bg-purple-50/60 hover:text-purple-700
        hover:-translate-y-0.5 active:translate-y-0 shadow-2xs
      `,
      ghost: `
        bg-transparent text-slate-700 border border-transparent
        hover:text-slate-900 hover:bg-slate-100
      `,
      outline: `
        bg-white text-purple-600 border border-purple-300
        hover:bg-purple-50 hover:border-purple-500
        hover:shadow-sm
        hover:-translate-y-0.5 active:translate-y-0
      `,
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm gap-2',
      md: 'px-6 py-3 text-sm gap-2',
      lg: 'px-8 py-4 text-base gap-3',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
