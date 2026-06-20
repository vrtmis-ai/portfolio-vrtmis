import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { TransitionLink } from './TransitionLink'
import styles from './Nav.module.css'

/**
 * Top navigation — works on both home (/) and case-study (/work/:slug) routes.
 *
 *   - Logo always links to "/" (clicking it from a case study returns home).
 *   - Section links (Work, About, Clients, Contact):
 *       on home  → plain anchor jump (#work) so Lenis can smooth-scroll
 *       on a case-study → Link to "/#work" so we navigate home first, then
 *                          the hash handler in App scrolls to the section.
 */

/**
 * A nav section link, with the right behaviour for the current route.
 * On home: <a href="#section"> so the hash change drives in-page scrolling.
 * Off home: <Link to="/#section"> so we navigate to home + hash.
 * Declared at module scope so it isn't recreated on every Nav render.
 */
function SectionLink({
  hash,
  label,
  hover,
  onHome,
  onNavigate,
}: {
  hash: string
  label: string
  hover?: boolean
  onHome: boolean
  onNavigate: () => void
}) {
  const extraProps = hover ? { 'data-hover': true } : {}
  if (onHome) {
    return <a href={`#${hash}`} onClick={onNavigate} {...extraProps}>{label}</a>
  }
  return <TransitionLink to={`/#${hash}`} onClick={onNavigate} {...extraProps}>{label}</TransitionLink>
}

export function Nav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const onHome = location.pathname === '/'
  const closeMenu = () => setOpen(false)

  // Close the mobile menu whenever the route changes (clicks, back/forward).
  // Render-time reset (not an effect) so it can't trigger a cascading render.
  const routeKey = location.pathname + location.hash
  const [seenRoute, setSeenRoute] = useState(routeKey)
  if (routeKey !== seenRoute) {
    setSeenRoute(routeKey)
    setOpen(false)
  }

  // Close menu on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <nav className={styles.nav}>
      {/* Keyboard users can jump straight past the nav to the content.
          Visually hidden until focused (styles in index.css). */}
      <a href="#main" className="skip-link">Skip to content</a>

      {/* Logo — always navigates home */}
      <TransitionLink to="/" className={styles.logo} data-hover>
        <img src="/mt-logo.png" alt="MT" className={styles.logoMark} />
        <span className={styles.logoText}>
          MAHBOD<span className={styles.logoAccent}>.</span>TAVASSOLI
        </span>
      </TransitionLink>

      {/* Desktop links + theme toggle */}
      <div className={styles.rightCluster}>
        <ul className={`${styles.links} ${open ? styles.linksOpen : ''}`}>
          {/* Work is now its own route — full archive at /work */}
          <li>
            <TransitionLink to="/work" onClick={closeMenu}>Work</TransitionLink>
          </li>
          <li><SectionLink hash="about" label="About" onHome={onHome} onNavigate={closeMenu} /></li>
          <li><SectionLink hash="collaborations" label="Clients" hover onHome={onHome} onNavigate={closeMenu} /></li>
          {/* Contact is its own page now, not a scroll-to section */}
          <li><TransitionLink to="/contact" onClick={closeMenu}>Contact</TransitionLink></li>
        </ul>
        <ThemeToggle />
      </div>

      {/* Mobile hamburger */}
      <button
        className={`${styles.hamburger} ${open ? styles.hamburgerOpen : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>
    </nav>
  )
}
