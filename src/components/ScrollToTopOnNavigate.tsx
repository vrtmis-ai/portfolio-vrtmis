import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTopOnNavigate — forces the viewport back to (0, 0) when the route
 * changes. Without this, a fresh navigation (e.g. clicking a Work card while
 * deep in the home page) would land the user mid-scroll on the new page,
 * because Lenis preserves the previous scroll offset across renders.
 *
 * If we navigated WITH a hash (#about), let the App's hash handler scroll —
 * we only reset when no hash is present.
 */
export function ScrollToTopOnNavigate() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) return
    // Two attempts: immediate (catches synchronous renders) and on next tick
    // (catches Lenis async catch-up). Both cheap, robust together.
    window.scrollTo(0, 0)
    requestAnimationFrame(() => window.scrollTo(0, 0))
  }, [pathname, hash])
  return null
}
