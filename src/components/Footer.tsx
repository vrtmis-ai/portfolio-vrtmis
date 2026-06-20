import { useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { TransitionLink } from './TransitionLink'
import styles from './Footer.module.css'

/**
 * Footer — rich closer with three rows:
 *   1. Big "Built in Tehran" wordmark + live local time
 *   2. Link columns (Navigate · Contact · Elsewhere)
 *   3. Bottom strip — copyright + version + back-to-top
 *
 * Every link has a clear hover state. The clock updates once per minute.
 */

/** Format current time in Tehran (Asia/Tehran, IRST) — HH:MM, 24h */
function tehranTime() {
  return new Date().toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Tehran',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function Footer() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [now, setNow] = useState(tehranTime())

  /** Live clock — tick every minute */
  useEffect(() => {
    const interval = setInterval(() => setNow(tehranTime()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const year = new Date().getFullYear()

  return (
    <footer ref={ref} className={styles.footer}>
      {/* ── Row 1: massive wordmark + clock ── */}
      <div className={styles.row1}>
        <motion.h2
          className={`t-display ${styles.wordmark}`}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          BUILT IN
          <br />
          <span className={styles.wordmarkAccent}>TEHRAN</span>.
        </motion.h2>

        <motion.div
          className={styles.clock}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <span className={`t-label ${styles.clockLabel}`}>Local time</span>
          <span className={styles.clockTime}>{now}</span>
          <span className={`t-mono ${styles.clockMeta}`}>IRST · UTC+03:30</span>
          <span className={`t-mono ${styles.clockDot}`}>● Open to commissions</span>
        </motion.div>
      </div>

      {/* ── Row 2: link columns ── */}
      <div className={styles.row2}>
        <FooterColumn title="Navigate">
          <a href="#top" data-hover>Top</a>
          <TransitionLink to="/work">Work</TransitionLink>
          <a href="#about">About</a>
          <a href="#collaborations" data-hover>Clients</a>
          <TransitionLink to="/contact">Contact</TransitionLink>
        </FooterColumn>

        <FooterColumn title="Contact">
          <a href="mailto:mahbodtavassoli@outlook.com">
            mahbodtavassoli@outlook.com
          </a>
          <a href="tel:+989909270038" data-hover>+98 990 927 0038</a>
          <a href="https://artemis.studio" target="_blank" rel="noreferrer" data-hover>
            artemis.studio ↗
          </a>
        </FooterColumn>

        <FooterColumn title="Elsewhere">
          <a href="https://instagram.com/thvrtmis" target="_blank" rel="noreferrer" data-hover>Instagram ↗</a>
          <a href="https://t.me/vrtmis" target="_blank" rel="noreferrer" data-hover>Telegram ↗</a>
          <a href="https://linkedin.com/in/mahbod-tavassoli-thvrtmis" target="_blank" rel="noreferrer" data-hover>LinkedIn ↗</a>
        </FooterColumn>

        <FooterColumn title="Studio">
          <span className={styles.studioLine}>artemis.studio</span>
          <span className={styles.studioLine}>Tehran, Iran</span>
          <span className={styles.studioLine}>Est. 2015</span>
          <span className={styles.studioLine}>Mahbod Tavassoli</span>
        </FooterColumn>
      </div>

      {/* ── Row 3: bottom strip ── */}
      <div className={styles.row3}>
        <span className="t-label">&copy; {year} Mahbod Tavassoli</span>
        <span className={`t-label ${styles.signature}`}>
          A study in <span className={styles.sigAccent}>light · code · room</span>
        </span>
        <span className={`t-label ${styles.version}`}>v.0.6 · {year}</span>
      </div>
    </footer>
  )
}

/** A single titled column of links */
function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.column}>
      <span className={`t-label ${styles.columnTitle}`}>{title}</span>
      <div className={styles.columnLinks}>{children}</div>
    </div>
  )
}
