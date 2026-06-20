import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'

/**
 * The currently-mounted Lenis instance, exposed module-wide so components that
 * don't own the hook (e.g. StudioRoom, which needs to LOCK scroll during its
 * camera-turn playback) can reach it without prop-drilling. Only one route is
 * mounted at a time, so a single slot is enough; it's cleared on unmount.
 */
let activeLenis: Lenis | null = null

/** Read the active Lenis instance (or null if none is mounted / destroyed). */
export function getActiveLenis(): Lenis | null {
  return activeLenis
}

/**
 * Initializes Lenis smooth scroll and returns scroll progress (0-1).
 * Also exposes the Lenis instance for external control.
 */
export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    // Honor prefers-reduced-motion: keep Lenis mounted (nav hash-scroll and
    // progress events still work) but turn the wheel smoothing off so the
    // page scrolls natively, without inertia.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reduceMotion,
    })

    lenisRef.current = lenis
    activeLenis = lenis

    lenis.on('scroll', (e: { progress: number; scroll: number }) => {
      setScrollProgress(e.progress)
      setScrollY(e.scroll)
    })

    let rafId = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    })

    return () => {
      // Cancel the loop BEFORE destroying — otherwise every route change
      // leaves a dead rAF loop running forever.
      cancelAnimationFrame(rafId)
      lenis.destroy()
      if (activeLenis === lenis) activeLenis = null
    }
  }, [])

  return { scrollProgress, scrollY, lenis: lenisRef }
}
