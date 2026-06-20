import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Nav } from '../components/Nav'
import { TransitionLink } from '../components/TransitionLink'
import { Footer } from '../components/Footer'
import { BackToTop } from '../components/BackToTop'
import { SplitText } from '../components/SplitText'
import { CTAButton } from '../components/CTAButton'
import { getProject, PROJECTS } from '../data/projects'
import { useSmoothScroll } from '../hooks/useSmoothScroll'
import { useMouseInteraction } from '../hooks/useMouseInteraction'
import { NotFoundPage } from './NotFoundPage'
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
  const { cursorRef, state } = useMouseInteraction()

  const { slug } = useParams()

  // Scroll parallax for the full-bleed video. These hooks must run on EVERY
  // render — before any early return — so the hook order stays stable even
  // when the slug is unknown and we fall back to <NotFound/>.
  const videoRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: videoRef,
    offset: ['start end', 'end start'],
  })
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 30 })
  const videoScale = useTransform(smooth, [0, 0.5, 1], [0.96, 1, 1.02])

  const project = getProject(slug)
  if (!project) return <NotFoundPage />

  // Prev / Next neighbours in the PROJECTS array (wraps around)
  const idx = PROJECTS.findIndex(p => p.slug === slug)
  const prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length]
  const next = PROJECTS[(idx + 1) % PROJECTS.length]

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
        <svg className="cursor-hand" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5M11 11.5v-2a1.5 1.5 0 0 1 3 0v2.5M14 10.5a1.5 1.5 0 0 1 3 0v1.5M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1 -6 6h-2a6 6 0 0 1 -5 -2.7c-.2-.3-1.4-2.4-3.3-5.7a1.5 1.5 0 0 1 .5-2 1.9 1.9 0 0 1 2.3.3l1.5 1.5"
            stroke="var(--reactor)"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="cursor-disc" />
      </div>

      <div className="grain-overlay" />

      {/* React 19 hoists these into <head> — per-project title/description +
          the social link-preview card (OG + Twitter) using this project's own
          poster, so sharing a /work/<slug> link shows that project's cover.
          Absolute URLs are required by scrapers. */}
      <title>{`${project.caseStudyTitle} · Mahbod Tavassoli`}</title>
      <meta name="description" content={project.description} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={`${project.caseStudyTitle} · Mahbod Tavassoli`} />
      <meta property="og:description" content={project.description} />
      <meta property="og:url" content={`https://artemis.studio/work/${project.slug}`} />
      <meta property="og:image" content={`https://artemis.studio/work/${project.slug}/poster.jpg`} />
      <meta property="og:image:width" content="1080" />
      <meta property="og:image:height" content="1080" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${project.caseStudyTitle} · Mahbod Tavassoli`} />
      <meta name="twitter:description" content={project.description} />
      <meta name="twitter:image" content={`https://artemis.studio/work/${project.slug}/poster.jpg`} />
      <link rel="canonical" href={`https://artemis.studio/work/${project.slug}`} />

      <Nav />

      <article id="main" className={styles.page}>
        {/* ── Hero ── */}
        <header className={styles.hero}>
          <TransitionLink to="/work" className={`t-label ${styles.backLink}`}>
            ← Back to all work
          </TransitionLink>

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
          style={{
            scale: videoScale,
            // Pairs with the /work tile (and home TV hotspot) of the same
            // slug — the clicked element morphs into this video block.
            viewTransitionName: `work-${project.slug}`,
          }}
        >
          {/* Blurred fill behind the video — for portrait (9:16) clips it fills
              the 16:9 stage on the sides instead of dead black bars. */}
          <img
            className={styles.videoBackdrop}
            src={`/work/${project.slug}/poster.jpg`}
            alt=""
            aria-hidden
          />
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
          <TransitionLink to={`/work/${prev.slug}`} className={styles.neighbourLink}>
            <span className={`t-mono ${styles.neighbourLabel}`}>← Previous</span>
            <span className={`t-display ${styles.neighbourTitle}`}>
              {prev.caseStudyTitle}
            </span>
          </TransitionLink>
          <TransitionLink
            to={`/work/${next.slug}`}
            className={`${styles.neighbourLink} ${styles.neighbourRight}`}
          >
            <span className={`t-mono ${styles.neighbourLabel}`}>Next →</span>
            <span className={`t-display ${styles.neighbourTitle}`}>
              {next.caseStudyTitle}
            </span>
          </TransitionLink>
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

