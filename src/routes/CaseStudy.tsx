import { useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Nav } from '../components/Nav'
import { Footer } from '../components/Footer'
import { BackToTop } from '../components/BackToTop'
import { SplitText } from '../components/SplitText'
import { CTAButton } from '../components/CTAButton'
import { getProject, PROJECTS } from '../data/projects'
import { useSmoothScroll } from '../hooks/useSmoothScroll'
import { useMouseInteraction } from '../hooks/useMouseInteraction'
import styles from './CaseStudy.module.css'

/**
 * CaseStudy — /work/<slug> page for a single project.
 *
 * Layout:
 *   - Nav (shared with home)
 *   - Hero: small back link + big title + meta row
 *   - Full-bleed video with controls (poster fallback)
 *   - Long description + tags
 *   - Prev/Next project navigation
 *   - Footer
 *
 * Scroll parallax: the video scales up slightly as you scroll past it.
 */
export function CaseStudy() {
  // Mount the same global hooks the home page uses, so cursor + smooth
  // scroll + grain feel identical when navigating between pages.
  useSmoothScroll()
  const { cursorRef, state, mouse } = useMouseInteraction()

  const { slug } = useParams()
  const project = getProject(slug)

  if (!project) return <NotFound slug={slug} />

  // Prev / Next neighbours in the PROJECTS array (wraps around)
  const idx = PROJECTS.findIndex(p => p.slug === slug)
  const prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length]
  const next = PROJECTS[(idx + 1) % PROJECTS.length]

  const videoRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: videoRef,
    offset: ['start end', 'end start'],
  })
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 30 })
  const videoScale = useTransform(smooth, [0, 0.5, 1], [0.96, 1, 1.02])

  // Mouse parallax tracking for whole page (kept for future use)
  void mouse

  return (
    <>
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

      <article className={styles.page}>
        {/* ── Hero ── */}
        <header className={styles.hero}>
          <Link to="/" className={`t-label ${styles.backLink}`}>
            ← Back to all work
          </Link>

          <span className={`t-label ${styles.eyebrow}`}>
            <span className={styles.eyebrowMark} aria-hidden />
            {project.category}
          </span>

          <h1 className={`t-display ${styles.title}`}>
            <SplitText stagger={0.04} duration={1.0}>
              {project.caseStudyTitle}
            </SplitText>
          </h1>

          <dl className={styles.metaRow}>
            <div className={styles.metaItem}>
              <dt className="t-label">Client</dt>
              <dd>{project.client}</dd>
            </div>
            <div className={styles.metaItem}>
              <dt className="t-label">Year</dt>
              <dd>{project.year}</dd>
            </div>
            <div className={styles.metaItem}>
              <dt className="t-label">Discipline</dt>
              <dd>{project.category}</dd>
            </div>
          </dl>
        </header>

        {/* ── Full-bleed video ── */}
        <motion.div
          ref={videoRef}
          className={styles.videoWrap}
          style={{ scale: videoScale }}
        >
          <video
            className={styles.video}
            src={`/work/${project.slug}/video.mp4`}
            poster={`/work/${project.slug}/poster.jpg`}
            controls
            playsInline
            preload="metadata"
          />
          {/* Fallback caption — visible if video fails to load.
              The colour block underneath shows through as a graceful
              placeholder while assets are being created. */}
          <div className={styles.videoFallback} style={{ background: project.accent }}>
            <span className={`t-mono ${styles.fallbackTag}`}>[ {project.id} · VIDEO PENDING ]</span>
            <span className={`t-mono ${styles.fallbackHint}`}>
              drop /public/work/{project.slug}/video.mp4
            </span>
          </div>
        </motion.div>

        {/* ── Description ── */}
        <section className={styles.body}>
          <div className={styles.bodyInner}>
            <p className={styles.lede}>{project.description}</p>

            <p className={styles.para}>{project.longDescription}</p>

            <ul className={styles.tags}>
              {project.tags.map(tag => (
                <li key={tag} className={`t-mono ${styles.tag}`}>
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Prev / Next neighbour projects ── */}
        <nav className={styles.neighbours}>
          <Link to={`/work/${prev.slug}`} className={styles.neighbourLink}>
            <span className={`t-mono ${styles.neighbourLabel}`}>← Previous</span>
            <span className={`t-display ${styles.neighbourTitle}`}>
              {prev.caseStudyTitle}
            </span>
          </Link>
          <Link
            to={`/work/${next.slug}`}
            className={`${styles.neighbourLink} ${styles.neighbourRight}`}
          >
            <span className={`t-mono ${styles.neighbourLabel}`}>Next →</span>
            <span className={`t-display ${styles.neighbourTitle}`}>
              {next.caseStudyTitle}
            </span>
          </Link>
        </nav>

        {/* ── Closing CTA ── */}
        <section className={styles.closing}>
          <h2 className={`t-display ${styles.closingHead}`}>
            Got something
            <br />
            similar in mind?
          </h2>
          <CTAButton href="mailto:mahbodtavassoli@outlook.com">
            Start a conversation
          </CTAButton>
        </section>
      </article>

      <Footer />
      <BackToTop />
    </>
  )
}

/** 404-ish state — shown when /work/<unknown-slug> is hit */
function NotFound({ slug }: { slug: string | undefined }) {
  return (
    <>
      <Nav />
      <main className={styles.notFound}>
        <h1 className={`t-display ${styles.notFoundTitle}`}>Not found.</h1>
        <p className={styles.notFoundDetail}>
          No project at <code>/work/{slug ?? ''}</code>.
        </p>
        <Link to="/" className={`t-mono ${styles.backLink}`}>
          ← Back home
        </Link>
      </main>
    </>
  )
}
