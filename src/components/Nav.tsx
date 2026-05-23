import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
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
export function Nav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const onHome = location.pathname === '/'

  // Close menu on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Close the mobile menu whenever the route changes (e.g. clicking a link)
  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.hash])

  /**
   * Renders a section link with the right behaviour for the current route.
   * On home: <a href="#section"> so the hash change drives in-page scrolling.
   * Off home: <Link to="/#section"> so we navigate to home + hash.
   */
  function SectionLink({ hash, label, hover }: { hash: string; label: string; hover?: boolean }) {
    const extraProps = hover ? { 'data-hover': true } : {}
    if (onHome) {
      return <a href={`#${hash}`} onClick={() => setOpen(false)} {...extraProps}>{label}</a>
    }
    return <Link to={`/#${hash}`} onClick={() => setOpen(false)} {...extraProps}>{label}</Link>
  }

  return (
    <nav className={styles.nav}>
      {/* Logo — always navigates home */}
      <Link to="/" className={styles.logo} data-hover>
        <img src="/mt-logo.png" alt="MT" className={styles.logoMark} />
        <span className={styles.logoText}>
          MAHBOD<span className={styles.logoAccent}>.</span>TAVASSOLI
        </span>
      </Link>

      {/* Desktop links + theme toggle */}
      <div className={styles.rightCluster}>
        <ul className={`${styles.links} ${open ? styles.linksOpen : ''}`}>
          <li><SectionLink hash="work" label="Work" /></li>
          <li><SectionLink hash="about" label="About" /></li>
          <li><SectionLink hash="collaborations" label="Clients" hover /></li>
          <li><SectionLink hash="contact" label="Contact" /></li>
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
