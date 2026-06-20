import { useEffect, useRef, useState } from 'react'

/**
 * useMouseInteraction — single global mousemove listener that powers BOTH:
 *
 *   - `cursorRef`            — attach to the cursor DOM element
 *   - `state` 'idle'|'hover' — toggled when entering/leaving links/buttons
 *
 * The cursor position is driven entirely through refs + a rAF transform write —
 * NO React state updates on mousemove, so moving the mouse never re-renders the
 * component tree. (`state` only flips on idle↔hover transitions, which are
 * rare.) An earlier version also `setState`d a normalized parallax position on
 * every move; nothing consumed it, so it just re-rendered the whole page on
 * every pixel of movement — removed.
 *
 * Listeners are registered with `{ passive: true }` so the browser knows we
 * never call preventDefault — keeps scroll/touch threads unblocked.
 */
export type CursorState = 'idle' | 'hover'

export function useMouseInteraction() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<CursorState>('idle')

  /** Smoothed cursor position (lerped each rAF tick) */
  const pos = useRef({ x: 0, y: 0 })
  /** Raw target (set on every mousemove) */
  const target = useRef({ x: 0, y: 0 })

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      // Raw target for the cursor lerp — a ref, so no re-render on move.
      target.current = { x: e.clientX, y: e.clientY }
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

  return { cursorRef, state }
}
