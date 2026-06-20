import { lazy } from 'react'

/**
 * Route-level code-split: /work and /work/:slug load on demand, keeping the
 * home bundle lean. Lives outside main.tsx so the entry file stays
 * component-free (react-refresh rule).
 */
export const WorkIndex = lazy(() =>
  import('./WorkIndex').then(m => ({ default: m.WorkIndex })),
)

export const CaseStudy = lazy(() =>
  import('./CaseStudy').then(m => ({ default: m.CaseStudy })),
)

export const NotFoundPage = lazy(() =>
  import('./NotFoundPage').then(m => ({ default: m.NotFoundPage })),
)

export const ContactPage = lazy(() =>
  import('./ContactPage').then(m => ({ default: m.ContactPage })),
)

/**
 * Warm a lazy route's chunk before navigating to it. Used by TransitionLink:
 * on hover (so the chunk is usually cached by click time) and again inside
 * the view transition (so the new page never snapshots as a blank fallback).
 * React.lazy caches the module promise, so calling this repeatedly is free.
 */
export function preloadRoute(path: string): Promise<unknown> {
  const pathname = path.split(/[?#]/)[0] || '/'
  if (pathname.startsWith('/work/')) return import('./CaseStudy')
  if (pathname === '/work') return import('./WorkIndex')
  if (pathname === '/contact') return import('./ContactPage')
  if (pathname === '/') return Promise.resolve() // home is in the main bundle
  return import('./NotFoundPage')
}
