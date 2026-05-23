import { useEffect, useRef, useState } from 'react'

/**
 * useMouseInteraction — single global mousemove listener that powers BOTH:
 *
 *   1. Custom cursor:
 *      - `cursorRef`         — attach to the cursor DOM element
 *      - `state` 'idle'|'hover' — toggled when entering/leaving links/buttons
 *
 *   2. Mouse position (normalized -1..+1 on each axis) for parallax:
 *      - `mouse.x / mouse.y`  — passed to scenes, cards, 3D, etc.
 *
 * Replaces the previous two hooks (useCursor + useMousePosition) which each
 * registered their own global `mousemove` handler — twice the work on every
 * frame for the same input event. Now one listener, both consumers.
 *
 * Listeners are registered with `{ passive: true }` so the browser knows we
 * never call preventDefault — keeps scroll/touch threads unblocked.
 */
export type CursorState = 'idle' | 'hover'

export function useMouseInteraction() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<CursorState>('idle')
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  /** Smoothed cursor position (lerped each rAF tick) */
  const pos = useRef({ x: 0, y: 0 })
  /** Raw target (set on every mousemove) */
  const target = useRef({ x: 0, y: 0 })

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      // Raw target for the cursor lerp
      target.current = { x: e.clientX, y: e.clientY }

      // Normalized -1..+1 for parallax (Y inverted to match WebGL convention)
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      })
    }

    function handleOver(e: MouseEvent) {
      const el = (e.target as HTMLElement | null)?.closest('a, button, [data-hover]')
      if (el) setState('hover')
    }

    function handleOut(e: MouseEvent) {
      const el = (e.target as HTMLElement | null)?.closest('a, button, [data-hover]')
      if (el) setState('idle')
    }

    // PASSIVE listeners — browser knows we won't preventDefault.
    // No scroll/touch jank from these hot-path events.
    window.addEventListener('mousemove', handleMove, { passive: true })
    document.addEventListener('mouseover', handleOver, { passive: true })
    document.addEventListener('mouseout', handleOut, { passive: true })

    let raf: number
    function animate() {
      // Lerp toward target — gives the cursor physical weight
      pos.current.x += (target.current.x - pos.current.x) * 0.2
      pos.current.y += (target.current.y - pos.current.y) * 0.2
      if (cursorRef.current) {
        cursorRef.current.style.transform =
          `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`
      }
      raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mouseout', handleOut)
      cancelAnimationFrame(raf)
    }
  }, [])

  return { cursorRef, state, mouse }
}
