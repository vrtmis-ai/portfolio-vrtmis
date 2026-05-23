import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { SplitText } from './SplitText'
import styles from './Disciplines.module.css'

/**
 * Core Disciplines — six skill cards, content from the artemis-site Skills section.
 * Pattern: numbered card with icon + name + tool list.
 * Hover: orange border + lift + magnetic pull (subtle).
 */

interface Discipline {
  num: string
  icon: string
  name: string
  tools: string
}

const DISCIPLINES: Discipline[] = [
  {
    num: '01',
    icon: '◢',
    name: 'Video Mapping',
    tools: 'Resolume · MadMapper · TouchDesigner · Large-scale architectural projection',
  },
  {
    num: '02',
    icon: '✦',
    name: 'VFX & Compositing',
    tools: 'After Effects · Greenscreen · Environment extension · Motion tracking',
  },
  {
    num: '03',
    icon: '◈',
    name: 'AI Visual Production',
    tools: 'ComfyUI · Stable Diffusion · Runway · Kling · Hailuo · Real-time pipelines',
  },
  {
    num: '04',
    icon: '▶',
    name: 'Motion Graphics',
    tools: 'After Effects · Cinema 4D · Animation · Title design · Brand motion',
  },
  {
    num: '05',
    icon: '◉',
    name: 'Live Visual Production',
    tools: 'Concert visuals · Real-time performance · Event production · Stage design',
  },
  {
    num: '06',
    icon: '⬡',
    name: 'Video Editing & Post',
    tools: 'Premiere Pro · DaVinci Resolve · Color grading · Delivery pipeline',
  },
]

export function Disciplines() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-15%' })

  return (
    <section ref={sectionRef} className={styles.section} id="disciplines">
      <div className={styles.header}>
        <motion.div
          className={styles.headerInner}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span className="t-label">Core Disciplines</span>
          <span className={`t-label ${styles.count}`}>06 / Stacks</span>
        </motion.div>
        <h2 className={`t-display ${styles.sectionTitle}`}>
          <SplitText trigger="inview" stagger={0.05} duration={0.9}>What I do.</SplitText>
        </h2>
      </div>

      <div className={styles.grid}>
        {DISCIPLINES.map((d, index) => (
          <DisciplineCard key={d.num} d={d} index={index} isInView={isInView} />
        ))}
      </div>
    </section>
  )
}

function DisciplineCard({ d, index, isInView }: { d: Discipline; index: number; isInView: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  /**
   * Cursor over card — drives:
   *   --mx/--my : spotlight position (CSS radial gradient)
   *   --tilt-x/y : 3D perspective tilt (subtle, ±4deg)
   * Icon stays contained because card now has overflow: hidden.
   */
  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const xPct = ((e.clientX - rect.left) / rect.width) * 100
    const yPct = ((e.clientY - rect.top) / rect.height) * 100
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.setProperty('--mx', `${xPct}%`)
    el.style.setProperty('--my', `${yPct}%`)
    el.style.setProperty('--tilt-x', `${-y * 4}deg`)
    el.style.setProperty('--tilt-y', `${x * 4}deg`)
  }

  function handleLeave() {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--tilt-x', '0deg')
    el.style.setProperty('--tilt-y', '0deg')
  }

  return (
    <motion.div
      ref={ref}
      className={styles.card}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.cardInner}>
        <span className={`t-mono ${styles.cardNum}`}>{d.num}</span>
        <span className={styles.cardIcon} aria-hidden>{d.icon}</span>
        <h3 className={styles.cardName}>{d.name}</h3>
        <p className={styles.cardTools}>{d.tools}</p>
      </div>
    </motion.div>
  )
}
