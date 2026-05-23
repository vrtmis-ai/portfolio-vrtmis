import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useRef } from 'react'
import { SplitText } from './SplitText'
import { HorizonMedia } from './HorizonMedia'
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

interface Project {
  id: string
  title: string
  client: string
  category: string
  year: string
  description: string
  /** Hue used for the project's color block placeholder */
  accent: string
}

/** Real projects from CV — color blocks instead of placeholder photos. */
const PROJECTS: Project[] = [
  {
    id: '01',
    title: 'Alireza\nGhorbani',
    client: 'Live Concert',
    category: 'Architectural Mapping',
    year: '2024',
    description: 'Large-scale architectural video mapping for major live concert.',
    accent: '#ff3d00',
  },
  {
    id: '02',
    title: 'Oliver\nTwist',
    client: 'Mr. Parsaei · Theatre',
    category: 'AI Teaser + Stage Mapping',
    year: '2024',
    description: 'AI-generated teaser combined with live stage mapping for theatre production.',
    accent: '#3d5aff',
  },
  {
    id: '03',
    title: 'My\nBaby',
    client: 'Product Launch',
    category: 'Architectural Mapping',
    year: '2024',
    description: 'Architectural video mapping for live product launch event.',
    accent: '#ffffff',
  },
  {
    id: '04',
    title: 'Tehran\nUniv. of Art',
    client: 'Student Day',
    category: 'Video Mapping · Workshop',
    year: '2023',
    description: '1,000+ audience · 48hr delivery · Free workshop on real-time visual systems.',
    accent: '#ffb300',
  },
  {
    id: '05',
    title: 'Music\nVideo VFX',
    client: 'Various',
    category: 'Greenscreen · CGI · AI',
    year: '2023',
    description: 'Greenscreen compositing, CGI integration, and AI visual pipeline.',
    accent: '#a0ff00',
  },
]

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

function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLDivElement>(null)

  /**
   * Mouse-react 3D tilt — sets --tilt-x / --tilt-y CSS vars based on the cursor
   * position over the card. CSS reads these vars to drive a perspective-rotated
   * transform on .cardInner. Spring-eased via cubic-bezier(0.32, 0.72, 0, 1).
   */
  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    // ±12deg max tilt — strong, theatrical. Cards feel like they have weight
    // and respond physically to the cursor, not just a hint of motion.
    el.style.setProperty('--tilt-x', `${-y * 12}deg`)
    el.style.setProperty('--tilt-y', `${x * 12}deg`)
  }

  function handleLeave() {
    const el = cardRef.current
    if (!el) return
    el.style.setProperty('--tilt-x', '0deg')
    el.style.setProperty('--tilt-y', '0deg')
  }

  return (
    <div
      ref={cardRef}
      className={styles.card}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {/* cardInner gets the 3D transform; card outer stays flat to keep
          its layout slot in the horizontal track stable */}
      <div className={styles.cardInner}>
        {/* Color block — placeholder for project visual */}
        <div className={styles.visual} style={{ background: project.accent }}>
          <span className={`t-mono ${styles.cardNumber}`} style={{ color: '#000' }}>
            {project.id}
          </span>
        </div>

        {/* Meta row */}
        <div className={styles.cardMeta}>
          <span className={`t-mono ${styles.cardCategory}`}>{project.category}</span>
          <span className={`t-mono ${styles.cardYear}`}>{project.year}</span>
        </div>

        {/* Title */}
        <h3 className={`t-display ${styles.cardTitle}`}>
          {project.title.split('\n').map((line, i) => (
            <span key={i} className={styles.cardTitleLine}>{line}</span>
          ))}
        </h3>

        {/* Description */}
        <p className={`t-body ${styles.cardDesc}`}>{project.description}</p>
        <span className={`t-mono ${styles.cardClient}`}>{project.client}</span>
      </div>
    </div>
  )
}
