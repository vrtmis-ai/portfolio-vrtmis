import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { ProcessDiagram } from './ProcessDiagram'
import styles from './Process.module.css'

/**
 * Process — sticky-pin two-column section.
 *
 * LEFT (pinned): title + lede + scroll-reactive SVG diagram (ProcessDiagram).
 *                The diagram draws a connecting line through 4 stage-nodes
 *                as the user scrolls — fills the empty space with meaning.
 *
 * RIGHT (scrolling): 4 stage cards that scroll past the pin.
 */

const STAGES = [
  {
    n: '01',
    name: 'Brief & Frame',
    body: 'Listen first. Map constraints — venue, audience, projector count, deadline. Decide what the piece is and what it isn\'t. Cut the rest.',
  },
  {
    n: '02',
    name: 'Pipeline',
    body: 'Pick tools that fit, not the trendy ones. AI agents for repetitive passes, classic compositing where humans still do it better. Build the pipeline once, run it many times.',
  },
  {
    n: '03',
    name: 'Production',
    body: 'Long render queues. Hours of trial. Iterate on-site whenever possible — a real wall, a real projector, real ambient light. The screen lies; the wall tells the truth.',
  },
  {
    n: '04',
    name: 'Show',
    body: 'On the night, nothing matters except the cue list. Cool head, calm hands, redundant systems. Walk the room before doors open. Then press play.',
  },
]

interface ProcessProps {
  mouse: { x: number; y: number }
}

export function Process({ mouse }: ProcessProps) {
  const sectionRef = useRef<HTMLElement>(null)

  /** Track scroll progress through the entire section */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 90, damping: 30 })

  return (
    <section ref={sectionRef} className={styles.section} id="process">
      <div className={styles.sticky}>
        {/* LEFT — pinned title + diagram */}
        <div className={styles.left}>
          <motion.span
            className="t-label"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            How I work
          </motion.span>
          <h2 className={`t-display ${styles.title}`}>
            The Process<span className={styles.titleDot}>.</span>
          </h2>
          <p className={styles.lede}>
            Four stages, in this order. Every project. Adapted, never skipped.
          </p>

          {/* Scroll-reactive SVG diagram fills the empty left space */}
          <div className={styles.diagram}>
            <ProcessDiagram scrollProgress={smoothScroll} mouse={mouse} total={STAGES.length} />
          </div>
        </div>

        {/* RIGHT — scrolling stage cards */}
        <div className={styles.right}>
          {STAGES.map((s, i) => (
            <Stage key={s.n} stage={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Stage({ stage, index }: { stage: typeof STAGES[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <motion.div
      ref={ref}
      className={styles.stage}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-15%' }}
      transition={{ duration: 0.8, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.stageHead}>
        <span className={`t-mono ${styles.stageNum}`}>{stage.n}</span>
        <h3 className={styles.stageName}>{stage.name}</h3>
      </div>
      <p className={styles.stageBody}>{stage.body}</p>
    </motion.div>
  )
}
