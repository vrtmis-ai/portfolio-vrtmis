import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SplitText } from './SplitText'
import { HorizonMedia } from './HorizonMedia'
import { PROJECTS, type Project } from '../data/projects'
import styles from './Work.module.css'

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
   * Translate the track horizontally based on vertical scroll.
   *
   * Calibration: at scrollProgress = 1 the HORIZON tile must land CLEARLY
   * in the right side of the viewport — not at the centre, not crossing it.
   *   shift  -55% → horizon left edge sits around 70% across the viewport
   *   final card body fills the right third while project cards are visible
   *   on the left two-thirds.
   * Long hold (0.80 → 1) so the user gets to dwell on the closing frame.
   */
  const x = useTransform(smoothProgress, [0, 0.80, 1], ['0%', '-55%', '-55%'])

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
          <span className={`t-label ${styles.count}`}>05 / Projects</span>
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
            {PROJECTS.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            {/* Trailing footer — "more upon request" with CTA */}
            <div className={styles.endCap}>
              <span className="t-mono">/ END</span>
              <p className={`t-display ${styles.endText}`}>
                More
                <br />
                <span className={styles.endUnderline}>upon request.</span>
              </p>
              <a
                href="mailto:mahbodtavassoli@outlook.com"
                className="t-mono"
              >
                Get in touch →
              </a>
            </div>

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
          {/* Hover-preview video — sits over the colour block.
              If video.mp4 doesn't exist, error silently and the colour shows. */}
          <video
            ref={videoRef}
            className={styles.cardVideo}
            src={`/work/${project.slug}/video.mp4`}
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
