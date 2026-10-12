'use client'

import React, { createContext, useContext, useEffect } from 'react'

export type Theme = 'light'
export type ResolvedTheme = 'light'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  resolvedTheme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
})

const STORAGE_KEY = 'starwebflow-theme'

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode
  defaultTheme?: string
}) {
  // Always enforce pure light theme on mount and throughout the app
  useEffect(() => {
    try {
      const root = document.documentElement
      root.classList.remove('dark')
      root.classList.add('light')
      root.setAttribute('data-theme', 'light')
      root.style.colorScheme = 'light'
      localStorage.setItem(STORAGE_KEY, 'light')
      document.cookie = `${STORAGE_KEY}=light; path=/; max-age=31536000; SameSite=Lax`
    } catch {
      // ignore
    }
  }, [])

  return (
    <ThemeContext.Provider
      value={{
        theme: 'light',
        resolvedTheme: 'light',
        setTheme: () => {},
        toggleTheme: () => {},
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
