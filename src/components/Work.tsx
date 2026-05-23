import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SplitText } from './SplitText'
import { HorizonMedia } from './HorizonMedia'
import { FEATURED_PROJECTS, PROJECTS, type Project } from '../data/projects'
import styles from './Work.module.css'

/** Home Work section shows ONLY the featured subset (4 hero projects).
 *  The full list lives on the /work index page. */
const HOME_PROJECTS = FEATURED_PROJECTS

/**
 * Configure the closing-frame media here.
 *  Drop a file at /public/work/ and update HORIZON_SRC.
 *  Extension is auto-detected:
 *    .mp4 / .webm  → video
 *    .gif          → animated image (always loops, browser default)
 *    .jpg / .webp  → static still
 *  HORIZON_LOOP applies to videos only. Default false = play once + freeze last frame.
 */
const HORIZON_SRC = '/work/horizon.mp4'
const HORIZON_LOOP = false

/**
 * Work — horizontal-scroll editorial showcase.
 * As you scroll vertically, the project track moves horizontally.
 * Sticky-pin approach: viewport stays, content slides sideways.
 * Each project is a big color block with title + meta — basement.studio energy.
 */
export function Work() {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  // Scroll progress through the section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 30 })

  /**
   * Track now holds 4 featured cards + 1 endCap-link + 1 horizon = 6 slots.
   * Total track width ≈ 4×450 + 400 + 400 + gaps ≈ 2700px on desktop.
   * Viewport ~1300px → travel needed ≈ 1400px ≈ 52% of track.
   * Set max shift to -50% so horizon settles in the right third without
   * the user having to scroll a 320vh tunnel.
   */
  const x = useTransform(smoothProgress, [0, 0.85, 1], ['0%', '-50%', '-50%'])

  return (
    <section className={styles.work} id="work">
      {/* Header — sticky at top of section */}
      <div className={styles.header}>
        <motion.div
          className={styles.headerInner}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="t-label">Selected Work</span>
          <span className={`t-label ${styles.count}`}>
            0{HOME_PROJECTS.length} of {PROJECTS.length}
          </span>
        </motion.div>
        <h2 className={`t-display ${styles.sectionTitle}`}>
          <SplitText trigger="inview" stagger={0.05} duration={1.0}>
            Work
          </SplitText>
        </h2>
      </div>

      {/* Horizontal scroll container — vertical scroll drives horizontal motion */}
      <div ref={containerRef} className={styles.scrollContainer}>
        <div className={styles.sticky}>
          <motion.div ref={trackRef} className={styles.track} style={{ x }}>
            {HOME_PROJECTS.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            {/* Trailing footer — link to the full /work index */}
            <Link to="/work" className={styles.endCap}>
              <span className="t-mono">/ {PROJECTS.length - HOME_PROJECTS.length}+ more</span>
              <p className={`t-display ${styles.endText}`}>
                See all
                <br />
                <span className={styles.endUnderline}>work.</span>
              </p>
              <span className="t-mono">View archive →</span>
            </Link>

            {/*
              Horizon — the final frame of the horizontal scroll.
              Foreground media (mp4 / gif / jpg auto-detected by HorizonMedia)
              sits over a permanent placeholder backdrop. If the file 404s,
              the placeholder shows through.
            */}
            <div className={styles.horizon}>
              {/* Placeholder backdrop — visible when no asset is in place */}
              <div className={styles.horizonOverlay} aria-hidden>
                <span className={`t-mono ${styles.horizonTag}`}>[ HORIZON ]</span>
                <span className={`t-label ${styles.horizonHint}`}>
                  drop /public/work/horizon.(mp4 · gif · jpg)
                </span>
              </div>

              {/* Foreground asset — only renders if file exists */}
              <HorizonMedia src={HORIZON_SRC} loop={HORIZON_LOOP} />

              {/* Caption — always visible above the media */}
              <div className={styles.horizonCaption}>
                <span className="t-label">Until next show</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/**
 * ProjectCard — clickable link to /work/<slug>.
 *
 *   - 3D tilt on cursor (±12°, perspective 800px) via CSS vars
 *   - Hover-preview video: lazy-loaded video lives in the visual area.
 *     On mouse-enter, the video plays muted, looped. On mouse-leave, it
 *     pauses and the poster (or accent colour) shows again.
 *   - Whole card is a <Link> — clicking anywhere navigates to the case study.
 */
function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoReady, setVideoReady] = useState(false)

  /**
   * Lazy-prime the video when the card scrolls within ~400px of the viewport.
   * preload="none" until then, so off-screen cards add zero bandwidth on load.
   */
  useEffect(() => {
    const card = cardRef.current
    const video = videoRef.current
    if (!card || !video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Prime the metadata so play() is instant on hover
          video.preload = 'metadata'
          observer.disconnect()
        }
      },
      { rootMargin: '400px' }
    )
    observer.observe(card)
    return () => observer.disconnect()
  }, [])

  function handleMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.setProperty('--tilt-x', `${-y * 12}deg`)
    el.style.setProperty('--tilt-y', `${x * 12}deg`)
  }

  function handleEnter() {
    const v = videoRef.current
    if (!v) return
    v.play().catch(() => {
      // autoplay may be blocked or file missing — silently fall back to poster
    })
  }

  function handleLeave() {
    const el = cardRef.current
    if (el) {
      el.style.setProperty('--tilt-x', '0deg')
      el.style.setProperty('--tilt-y', '0deg')
    }
    const v = videoRef.current
    if (v) {
      v.pause()
      v.currentTime = 0
    }
  }

  return (
    <Link
      to={`/work/${project.slug}`}
      ref={cardRef as unknown as React.RefObject<HTMLAnchorElement>}
      className={styles.card}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      aria-label={`Open ${project.caseStudyTitle}`}
    >
      <div className={styles.cardInner}>
        {/* Visual area: colour block + hover-preview video on top */}
        <div className={styles.visual} style={{ background: project.accent }}>
          {/* Hover-preview = the 7s brutalist teaser. The case-study page
              uses the longer video.mp4 — different file. */}
          <video
            ref={videoRef}
            className={styles.cardVideo}
            src={`/work/${project.slug}/preview.mp4`}
            poster={`/work/${project.slug}/poster.jpg`}
            muted
            loop
            playsInline
            preload="none"
            onLoadedData={() => setVideoReady(true)}
            onError={() => setVideoReady(false)}
          />
          <span
            className={`t-mono ${styles.cardNumber}`}
            style={{ color: videoReady ? '#fff' : '#000' }}
          >
            {project.id}
          </span>
        </div>

        <div className={styles.cardMeta}>
          <span className={`t-mono ${styles.cardCategory}`}>{project.category}</span>
          <span className={`t-mono ${styles.cardYear}`}>{project.year}</span>
        </div>

        <h3 className={`t-display ${styles.cardTitle}`}>
          {project.title.split('\n').map((line, i) => (
            <span key={i} className={styles.cardTitleLine}>{line}</span>
          ))}
        </h3>

        <p className={`t-body ${styles.cardDesc}`}>{project.description}</p>
        <span className={`t-mono ${styles.cardClient}`}>{project.client}</span>
      </div>
    </Link>
  )
}
