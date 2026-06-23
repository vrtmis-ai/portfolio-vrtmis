import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Nav } from '../components/Nav'
import { useMouseInteraction } from '../hooks/useMouseInteraction'
import styles from './NotFoundPage.module.css'

/**
 * 404 — SIGNAL LOST.
 *
 * The TV wall is the site's project gallery; an address with no page is a
 * channel with no signal, so the 404 is a dead CRT playing real analog static,
 * with a drifting tracking bar and a glass vignette. Under reduced motion the
 * static video isn't autoplayed — its poster (a single noise frame) shows
 * instead, so there's no flicker.
 */
export function NotFoundPage() {
  const { cursorRef, state } = useMouseInteraction()
  const location = useLocation()
  // The dead-channel static IS the 404, so always play it. The autoplay
  // attribute alone is ignored by some mobile browsers, so nudge it on mount.
  // (If the OS hard-blocks autoplay — e.g. iOS Low Power Mode — the single
  // noise-frame poster shows instead, which still reads as a dead channel.)
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    videoRef.current?.play().catch(() => {})
  }, [])

  return (
    <>
      <title>Signal lost · Mahbod Tavassoli</title>

      {/* Same custom-cursor shell as every other route (body hides the
          native pointer, so a page without this would have no cursor). */}
      <div ref={cursorRef} className={`cursor state-${state}`} aria-hidden>
        <div className="cursor-arrow-glass" />
        <svg className="cursor-arrow-outline" viewBox="0 0 24 28">
          <path
            d="M 1 1 L 1 19 L 7 15 L 11 26 L 14 25 L 10 14 L 18 14 Z"
            fill="none"
            stroke="var(--reactor)"
            strokeWidth="1"
            strokeLinejoin="miter"
            strokeLinecap="square"
          />
        </svg>
        <div className="cursor-disc" />
      </div>
      <div className="grain-overlay" />

      <Nav />

      <main id="main" className={styles.page}>
        <video
          ref={videoRef}
          className={styles.static}
          src="/room/signal-lost.mp4"
          poster="/room/signal-lost-poster.jpg"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden
        />
        <div className={styles.trackingBar} aria-hidden />
        <div className={styles.vignette} aria-hidden />

        <span className={`t-label ${styles.channel}`}>CH 404 · No carrier</span>
        <h1 className={`t-display ${styles.title}`}>
          Signal<span className={styles.titleAccent}>.</span>
          <br />
          Lost<span className={styles.titleAccent}>.</span>
        </h1>
        <p className={`t-mono ${styles.readout}`}>
          nothing broadcasting at {location.pathname}
        </p>
        <Link to="/" className={`t-mono ${styles.homeLink}`} data-hover>
          ← Back to the studio
        </Link>
      </main>
    </>
  )
}
