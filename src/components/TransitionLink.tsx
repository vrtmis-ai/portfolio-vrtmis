import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, MouseEvent } from 'react'
import { flushSync } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { preloadRoute } from '../routes/lazyRoutes'

type TransitionLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, 'to'> & {
  /** String paths only — every internal route on this site is a string. */
  to: string
}

/**
 * TransitionLink — a react-router <Link> that navigates inside
 * document.startViewTransition(), so route changes crossfade and any pair of
 * elements sharing a `view-transition-name` (work tile ↔ case-study video)
 * morphs between pages.
 *
 * Fallbacks, in order:
 *   - modifier-click / middle-click / target=_blank → browser default
 *   - no startViewTransition support, or prefers-reduced-motion → plain navigate
 *
 * The lazy route chunk is warmed on hover AND awaited inside the transition,
 * so the incoming page never gets snapshotted as a blank Suspense fallback.
 */
export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  function TransitionLink({ to, onClick, onMouseEnter, ...rest }, ref) {
    const navigate = useNavigate()

    function handleMouseEnter(e: MouseEvent<HTMLAnchorElement>) {
      void preloadRoute(to)
      onMouseEnter?.(e)
    }

    function handleClick(e: MouseEvent<HTMLAnchorElement>) {
      onClick?.(e)
      if (e.defaultPrevented) return
      // Let the browser own new-tab / download / modified clicks.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
      if (rest.target && rest.target !== '_self') return

      e.preventDefault()

      const commit = () => {
        flushSync(() => navigate(to))
        // The new page must be snapshotted at the top — don't wait for
        // ScrollToTopOnNavigate's effect (it may land after the capture).
        window.scrollTo(0, 0)
      }

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!document.startViewTransition || reduceMotion) {
        navigate(to)
        return
      }

      document.startViewTransition(async () => {
        await preloadRoute(to)
        commit()
      })
    }

    return (
      <Link ref={ref} to={to} onClick={handleClick} onMouseEnter={handleMouseEnter} {...rest} />
    )
  },
)
