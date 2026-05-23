import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import styles from './Numbers.module.css'

interface Metric {
  /** Numeric value the counter ends on */
  to: number
  /** Suffix glyph e.g. "+" / "K" / "" */
  suffix?: string
  /** Label below the number */
  label: string
  /** Small caption to the side */
  note: string
}

const METRICS: Metric[] = [
  { to: 10, suffix: '+', label: 'Years', note: 'in motion since 2015' },
  { to: 50, suffix: '+', label: 'Projects', note: 'shipped & on-air' },
  { to: 14, suffix: '',  label: 'Clients', note: 'banks · brands · artists' },
  { to: 6,  suffix: '',  label: 'Disciplines', note: 'one head, many hands' },
]

/**
 * Numbers — counter row that ticks up from 0 when the section enters viewport.
 * Each metric counts independently, with staggered start.
 */
export function Numbers() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-25%' })

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.header}>
        <motion.span
          className="t-label"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7 }}
        >
          → By the numbers
        </motion.span>
      </div>
      <div className={styles.grid}>
        {METRICS.map((m, i) => (
          <Counter key={m.label} metric={m} index={i} active={isInView} />
        ))}
      </div>
    </section>
  )
}

function Counter({ metric, index, active }: { metric: Metric; index: number; active: boolean }) {
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!active) return
    const startDelay = 150 + index * 120
    const durationMs = 1300
    let rafId: number
    let started: number | null = null

    const tick = (now: number) => {
      if (started == null) started = now
      const t = Math.min(1, (now - started) / durationMs)
      // ease-out-expo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setN(Math.round(metric.to * eased))
      if (t < 1) rafId = requestAnimationFrame(tick)
    }

    const startId = setTimeout(() => {
      rafId = requestAnimationFrame(tick)
    }, startDelay)

    return () => {
      clearTimeout(startId)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [active, metric.to, index])

  return (
    <motion.div
      className={styles.cell}
      initial={{ opacity: 0, y: 18 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.05 + index * 0.06 }}
    >
      <div className={styles.value}>
        <span className={`t-display ${styles.number}`}>{n}</span>
        {metric.suffix ? <span className={`t-display ${styles.suffix}`}>{metric.suffix}</span> : null}
      </div>
      <div className={styles.meta}>
        <span className={`t-label ${styles.label}`}>{metric.label}</span>
        <span className={`t-mono ${styles.note}`}>{metric.note}</span>
      </div>
    </motion.div>
  )
}
