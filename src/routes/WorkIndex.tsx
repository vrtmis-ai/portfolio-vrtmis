import { useRef, useState, useMemo, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Nav } from '../components/Nav'
import { TransitionLink } from '../components/TransitionLink'
import { Footer } from '../components/Footer'
import { BackToTop } from '../components/BackToTop'
import { SplitText } from '../components/SplitText'
import { VISIBLE_PROJECTS, type Project } from '../data/projects'
import { useSmoothScroll } from '../hooks/useSmoothScroll'
import { useMouseInteraction } from '../hooks/useMouseInteraction'
import styles from './WorkIndex.module.css'

/**
 * WorkIndex — /work
 *
 * The full archive of projects. Where the home page shows only 4 featured
 * cards in a horizontal scroll, this page is a vertical grid of every
 * project, with category filters at the top and live hover-preview videos
 * on each tile. Each tile clicks through to /work/:slug.
 */
export function WorkIndex() {
  useSmoothScroll()
  const { cursorRef, state } = useMouseInteraction()

  // Derive category list dynamically from the visible projects
  const allCategories = useMemo(() => {
    const set = new Set<string>()
    VISIBLE_PROJECTS.forEach(p => set.add(p.category.split(' · ')[0]))
    return ['All', ...Array.from(set)]
  }, [])

  const [filter, setFilter] = useState<string>('All')

  const visible = useMemo(() => {
    if (filter === 'All') return VISIBLE_PROJECTS
    return VISIBLE_PROJECTS.filter(p => p.category.startsWith(filter))
  }, [filter])

  return (
    <>
      {/* Cursor + grain — match the rest of the site */}
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

      {/* React 19 hoists these into <head> — per-route title/description + OG */}
      <title>All Work · Mahbod Tavassoli</title>
      <meta
        name="description"
        content="Full archive: video mapping, AI visual production, VFX, and live event visuals by Mahbod Tavassoli."
      />
      <meta property="og:title" content="All Work · Mahbod Tavassoli" />
      <meta property="og:url" content="https://vrtmis.ir/work" />
      <meta property="og:image" content="https://vrtmis.ir/og-cover.jpg" />
      <link rel="canonical" href="https://vrtmis.ir/work" />

      <Nav />

      <main id="main" className={styles.page}>
        {/* ── Header ── */}
        <header className={styles.header}>
          <TransitionLink to="/" className={`t-label ${styles.backLink}`}>
            ← Home
          </TransitionLink>
          <div className={styles.headerRow}>
            <span className="t-label">Archive</span>
            <span className={`t-label ${styles.count}`}>
              {String(VISIBLE_PROJECTS.length).padStart(2, '0')} projects
            </span>
          </div>
          <h1 className={`t-display ${styles.title}`}>
            <SplitText stagger={0.04} duration={1.0}>All work.</SplitText>
          </h1>
          <p className={styles.lede}>
            Ten years across video mapping, AI visual production, VFX,
            and live event visuals.
          </p>
        </header>

        {/* ── Category filter ── */}
        <nav className={styles.filterBar} aria-label="Filter by category">
          {allCategories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`${styles.filterBtn} ${filter === cat ? styles.filterBtnActive : ''}`}
            >
              {cat}
              <span className={styles.filterCount}>
                {cat === 'All'
                  ? VISIBLE_PROJECTS.length
                  : VISIBLE_PROJECTS.filter(p => p.category.startsWith(cat)).length}
              </span>
            </button>
          ))}
        </nav>

        {/* ── Grid ── */}
        <section className={styles.grid}>
          {visible.map((project, idx) => (
            <ProjectTile key={project.slug} project={project} index={idx} />
          ))}
        </section>

        {/* ── Closing line ── */}
        <section className={styles.closing}>
          <p className={`t-display ${styles.closingText}`}>
            Want one of these tailored for you?
          </p>
          <a href="mailto:mahbodtavassoli@outlook.com" className={`t-mono ${styles.closingLink}`}>
            mahbodtavassoli@outlook.com →
          </a>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </>
  )
}

/**
 * Single tile — clickable link to /work/<slug>.
 * Same hover-preview video pattern as the home cards, scaled for a grid.
 */
function ProjectTile({ project, index }: { project: Project; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const tileRef = useRef<HTMLAnchorElement>(null)
  const posterRef = useRef<HTMLImageElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  // Flipped false when the poster 404s → the tile renders the deliberate
  // "in production" slate instead of a broken image over a flat accent.
  const [hasMedia, setHasMedia] = useState(true)
  // Blur-up: a ~1 KB 24px thumb shows instantly; the sharp poster fades in
  // over it once decoded, so tiles never pop from a flat color block.
  const [posterLoaded, setPosterLoaded] = useState(false)

  // Cached posters can finish before React attaches the onLoad listener —
  // sample `complete` once after mount so those don't stay blurred forever.
  useEffect(() => {
    const img = posterRef.current
    if (img && img.complete && img.naturalWidth > 0) setPosterLoaded(true)
  }, [])

  // Lazy-prime the video when the tile scrolls near the viewport
  useEffect(() => {
    const tile = tileRef.current
    const video = videoRef.current
    if (!tile || !video) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.preload = 'metadata'
          observer.disconnect()
        }
      },
      { rootMargin: '400px' }
    )
    observer.observe(tile)
    return () => observer.disconnect()
  }, [])

  const handleEnter = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.play().then(() => setIsPlaying(true)).catch(() => {})
  }, [])

  const handleLeave = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.pause()
    v.currentTime = 0
    setIsPlaying(false)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.6, delay: (index % 6) * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <TransitionLink
        to={`/work/${project.slug}`}
        ref={tileRef}
        className={styles.tile}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        aria-label={`Open ${project.caseStudyTitle}`}
      >
        <div
          className={styles.visual}
          style={{
            // Morph target: pairs with the case-study video wrap that
            // carries the same view-transition-name.
            viewTransitionName: `work-${project.slug}`,
            ...(hasMedia ? { background: project.accent } : null),
          }}
        >
          {hasMedia ? (
            <>
              <video
                ref={videoRef}
                className={styles.tileVideo}
                src={`/work/${project.slug}/preview.mp4`}
                muted
                loop
                playsInline
                preload="none"
              />
              <img
                className={`${styles.tileBlur} ${posterLoaded ? styles.tileBlurHidden : ''}`}
                src={`/work/${project.slug}/blur.jpg`}
                alt=""
                aria-hidden
              />
              <img
                ref={posterRef}
                className={`${styles.tilePoster} ${posterLoaded ? '' : styles.tilePosterLoading} ${isPlaying ? styles.tilePosterHidden : ''}`}
                src={`/work/${project.slug}/poster.jpg`}
                alt=""
                loading="lazy"
                onLoad={() => setPosterLoaded(true)}
                onError={() => setHasMedia(false)}
              />
              <span className={`t-mono ${styles.tileYear}`}>{project.year}</span>
            </>
          ) : (
            <span className={styles.tilePending}>
              <span className={`t-display ${styles.tilePendingId}`} aria-hidden>
                {project.id}
              </span>
              <span className={`t-mono ${styles.tilePendingTag}`}>In production</span>
              <span className={`t-mono ${styles.tilePendingHint}`}>
                Film coming soon · {project.year}
              </span>
            </span>
          )}
        </div>
        <div className={styles.meta}>
          <span className={`t-mono ${styles.metaCategory}`}>{project.category}</span>
          <h3 className={`t-display ${styles.tileTitle}`}>
            {project.title.replace(/\n/g, ' ')}
          </h3>
          <p className={styles.tileDesc}>{project.description}</p>
          <span className={`t-mono ${styles.tileClient}`}>{project.client}</span>
        </div>
      </TransitionLink>
    </motion.div>
  )
}
