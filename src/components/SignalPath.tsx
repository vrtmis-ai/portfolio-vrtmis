import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import styles from './SignalPath.module.css'

/**
 * SignalPath — a slim node-wire "pipeline" diagram under the Disciplines
 * heading: the path the work travels, Concept → Build → Render → Project.
 *
 * The rail draws itself left-to-right on scroll-in (framer scaleX); the four
 * nodes pop in staggered; then a reactor-orange pulse travels the wire forever
 * — a real Houdini effect: it animates a registered `--signal-pos` custom
 * property (a <percentage>), which lets the browser tween a gradient color-stop
 * position smoothly. Browsers without @property simply show a static wire.
 *
 * Labels are placeholders — rename or drop nodes freely; it's decorative
 * (aria-hidden), so it adds no noise for screen readers.
 */

const NODES = [
  { n: '01', label: 'Concept' },
  { n: '02', label: 'Build' },
  { n: '03', label: 'Render' },
  { n: '04', label: 'Project' },
]

export function SignalPath() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15%' })

  return (
    <div ref={ref} className={styles.wrap} aria-hidden>
      <div className={styles.inner}>
        {/* Base wire — draws in from the left */}
        <motion.div
          className={styles.rail}
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Travelling pulse — fades in once the wire is drawn */}
        <motion.div
          className={styles.pulse}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.1 }}
        />
        <div className={styles.nodes}>
          {NODES.map((node, i) => (
            <motion.div
              key={node.n}
              className={styles.node}
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.35 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className={styles.dot} />
              <span className={`t-mono ${styles.nodeNum}`}>{node.n}</span>
              <span className={`t-mono ${styles.nodeLabel}`}>{node.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
