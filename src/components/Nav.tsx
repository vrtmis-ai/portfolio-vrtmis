import { useState, useEffect } from 'react'
import { ThemeToggle } from './ThemeToggle'
import styles from './Nav.module.css'

/**
 * Top navigation — backdrop-blur over content.
 * Pattern adopted from the user's previous artemis site.
 *
 * Links use an animated underline (width 0 → 100%) on hover.
 * Mobile: hamburger that toggles the link panel.
 */
export function Nav() {
  const [open, setOpen] = useState(false)

  // Close menu on Escape, on route change feel
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <nav className={styles.nav}>
      <a href="#top" className={styles.logo} data-hover>
        <img src="/mt-logo.png" alt="MT" className={styles.logoMark} />
        <span className={styles.logoText}>
          MAHBOD<span className={styles.logoAccent}>.</span>TAVASSOLI
        </span>
      </a>

      {/* Desktop links + theme toggle */}
      <div className={styles.rightCluster}>
        <ul className={`${styles.links} ${open ? styles.linksOpen : ''}`}>
          <li><a href="#work" onClick={() => setOpen(false)}>Work</a></li>
          <li><a href="#about" onClick={() => setOpen(false)}>About</a></li>
          <li><a href="#collaborations" data-hover onClick={() => setOpen(false)}>Clients</a></li>
          <li><a href="#contact" onClick={() => setOpen(false)}>Contact</a></li>
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
