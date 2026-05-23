import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { SplitText } from './SplitText'
import styles from './About.module.css'

/**
 * About — three layers, in order:
 *
 *   1. DOSSIER     — brutalist labelled-field block. Facts, no prose.
 *   2. NARRATIVE   — long-form personal voice, with one big PULL QUOTE.
 *   3. TIMELINE    — chronicle of 6 career milestones.
 *
 * The sections are visually separated by horizontal rules + spacing.
 * No tool lists here — Disciplines owns that.
 */

interface DossierField {
  label: string
  value: string
}

/**
 * Dossier fields — six total, laid out in a 2-column passport grid.
 * "Based" was removed (redundant with Born + Studio in nav/footer).
 */
const DOSSIER: DossierField[] = [
  { label: 'Name',       value: 'Mahbod Tavassoli' },
  { label: 'Discipline', value: 'Visual Artist & AI Creative' },
  { label: 'Born',       value: 'Tehran, Iran' },
  { label: 'Years',      value: '10+ in motion since 2015' },
  { label: 'Languages',  value: 'Persian (Native) · English (B2)' },
  { label: 'Education',  value: 'B.Sc. Urban Engineering' },
]

interface Milestone {
  year: string
  what: string
  where: string
}

const TIMELINE: Milestone[] = [
  { year: '2015', what: 'First camera. First Premiere project.', where: 'Tehran' },
  { year: '2018', what: 'Motion + editing intern.',              where: 'Raimon Media' },
  { year: '2020', what: 'Motion Graphics + VFX Artist.',         where: 'Particle Studio' },
  { year: '2023', what: 'Senior Editor & Compositor.',           where: 'Studio Serkan' },
  { year: '2024', what: 'Solo. AI compositing pipelines.',       where: 'artemis.studio' },
  { year: 'Now',  what: 'Stage mapping. AI for film. Live shows.', where: 'Tehran → World' },
]

export function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section ref={sectionRef} className={styles.about} id="about">
      {/* Header */}
      <div className={styles.header}>
        <motion.span
          className="t-label"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          About
        </motion.span>
        <motion.h2
          className={`t-display ${styles.sectionTitle}`}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.1 }}
        >
          <SplitText trigger="inview" stagger={0.05} duration={0.9}>Profile</SplitText>
        </motion.h2>
      </div>

      {/* ── 1. DOSSIER — passport-style 2-column grid, compact ── */}
      <motion.div
        className={styles.dossier}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <span className={`t-label ${styles.dossierTag}`}>I / DOSSIER</span>
        <dl className={styles.dossierList}>
          {DOSSIER.map(field => (
            <div key={field.label} className={styles.dossierRow}>
              <dt className={`t-label ${styles.dossierLabel}`}>{field.label}</dt>
              <dd className={`${styles.dossierValue}`}>{field.value}</dd>
            </div>
          ))}
        </dl>
      </motion.div>

      {/* ── 2. NARRATIVE — personal essay with pull quote ── */}
      <div className={styles.narrative}>
        <motion.span
          className={`t-label ${styles.narrativeTag}`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          II / IN HIS OWN WORDS
        </motion.span>

        <motion.p
          className={styles.lede}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          First job, 2018. A music video for a Tehran rapper. Greenscreen on a borrowed laptop. The render took eight hours. I watched it loop and somewhere in that loop I knew this was the work.
        </motion.p>

        <motion.p
          className={styles.para}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Ten years later the toolset has tripled and the deadlines have shrunk. AI sits at my desk like a second pair of hands. The question stays the same: can we make this real?
        </motion.p>

        {/* PULL QUOTE */}
        <motion.blockquote
          className={styles.pullQuote}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={styles.pullMark}>“</span>
          I don't fall in love with tools. I fall in love with what they make possible.
          <span className={styles.pullMark}>”</span>
        </motion.blockquote>

        <motion.p
          className={styles.para}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          The work moves between rooms. A render farm at three in the morning. A stage at nine at night. A meeting at noon in a language that isn't mine. The constant is the wall — there's always a wall somewhere that's about to light up.
        </motion.p>
      </div>

      {/* ── 3. TIMELINE — chronicle of milestones ── */}
      <div className={styles.timelineWrap}>
        <motion.span
          className={`t-label ${styles.timelineTag}`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          III / TRAJECTORY
        </motion.span>
        <ol className={styles.timeline}>
          {TIMELINE.map((m, index) => (
            <motion.li
              key={m.year}
              className={styles.milestone}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className={`t-mono ${styles.milestoneYear}`}>{m.year}</span>
              <div className={styles.milestoneBody}>
                <span className={styles.milestoneWhat}>{m.what}</span>
                <span className={`t-mono ${styles.milestoneWhere}`}>{m.where}</span>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
