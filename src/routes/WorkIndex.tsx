import { useRef, useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Nav } from '../components/Nav'
import { Footer } from '../components/Footer'
import { BackToTop } from '../components/BackToTop'
import { SplitText } from '../components/SplitText'
import { PROJECTS, type Project } from '../data/projects'
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

  // Derive category list dynamically from PROJECTS data
  const allCategories = useMemo(() => {
    const set = new Set<string>()
    PROJECTS.forEach(p => set.add(p.category.split(' · ')[0]))
    return ['All', ...Array.from(set)]
  }, [])

  const [filter, setFilter] = useState<string>('All')

  const visible = useMemo(() => {
    if (filter === 'All') return PROJECTS
    return PROJECTS.filter(p => p.category.startsWith(filter))
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

      <Nav />

      <main className={styles.page}>
        {/* ── Header ── */}
        <header className={styles.header}>
          <Link to="/" className={`t-label ${styles.backLink}`}>
            ← Home
          </Link>
          <div className={styles.headerRow}>
            <span className="t-label">Archive</span>
            <span className={`t-label ${styles.count}`}>
              {String(PROJECTS.length).padStart(2, '0')} projects
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
              {cat !== 'All' && (
                <span className={styles.filterCount}>
                  {PROJECTS.filter(p => p.category.startsWith(cat)).length}
                </span>
              )}
              {cat === 'All' && (
                <span className={styles.filterCount}>{PROJECTS.length}</span>
              )}
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

  function handleEnter() {
    videoRef.current?.play().catch(() => {})
  }
  function handleLeave() {
    const v = videoRef.current
    if (!v) return
    v.pause()
    v.currentTime = 0
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.6, delay: (index % 6) * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/work/${project.slug}`}
        ref={tileRef}
        className={styles.tile}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        aria-label={`Open ${project.caseStudyTitle}`}
      >
        <div className={styles.visual} style={{ background: project.accent }}>
          <video
            ref={videoRef}
            className={styles.tileVideo}
            src={`/work/${project.slug}/preview.mp4`}
            poster={`/work/${project.slug}/poster.jpg`}
            muted
            loop
            playsInline
            preload="none"
          />
          <span className={`t-mono ${styles.tileNumber}`}>{project.id}</span>
          <span className={`t-mono ${styles.tileYear}`}>{project.year}</span>
        </div>
        <div className={styles.meta}>
          <span className={`t-mono ${styles.metaCategory}`}>{project.category}</span>
          <h3 className={`t-display ${styles.tileTitle}`}>
            {project.title.replace(/\n/g, ' ')}
          </h3>
          <p className={styles.tileDesc}>{project.description}</p>
          <span className={`t-mono ${styles.tileClient}`}>{project.client}</span>
        </div>
      </Link>
    </motion.div>
  )
}
