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
      'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#4F8EF7]/50 focus:ring-offset-2 focus:ring-offset-[#0A0A0F] disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: `
        bg-[#4F8EF7] text-white border border-[#4F8EF7]
        hover:bg-[#3B7DE8] hover:shadow-[0_0_25px_rgba(79,142,247,0.5),0_0_50px_rgba(79,142,247,0.2)]
        hover:-translate-y-0.5 active:translate-y-0
      `,
      secondary: `
        bg-transparent text-white border border-white/20
        hover:border-[#4F8EF7]/50 hover:bg-[#4F8EF7]/10
        hover:-translate-y-0.5 active:translate-y-0
      `,
      ghost: `
        bg-transparent text-[#94A3B8] border border-transparent
        hover:text-white hover:bg-white/5
      `,
      outline: `
        bg-transparent text-[#4F8EF7] border border-[#4F8EF7]/40
        hover:bg-[#4F8EF7]/10 hover:border-[#4F8EF7]
        hover:shadow-[0_0_20px_rgba(79,142,247,0.2)]
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
