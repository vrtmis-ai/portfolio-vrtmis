import { useEffect, useState, useCallback } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'mt-theme'

/**
 * Read the initial theme: localStorage > system preference > 'dark' default.
 * Runs synchronously on first render so there's no FOUC.
 */
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'

  const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null
  if (stored === 'dark' || stored === 'light') return stored

  // System preference fallback
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
  return 'dark'
}

/**
 * useTheme — manages the document's data-theme attribute and persists choice.
 *
 * The site is DESIGNED dark-first, so dark stays the default. Light mode is
 * a user-controlled override (handled by the lightness-flipped token block
 * in index.css under [data-theme="light"]).
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  // Sync the attribute on the <html> element + persist
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* localStorage may be blocked — fail silently, still applies in-session */
    }
  }, [theme])

  const toggle = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggle, setTheme }
}
