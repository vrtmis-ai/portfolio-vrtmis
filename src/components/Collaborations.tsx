import { motion, useInView } from 'framer-motion'
import { Fragment, useRef } from 'react'
import styles from './Collaborations.module.css'

/** Real brand collaborations from Mahbod's CV. */
const BRANDS = [
  'Mammut',
  'Shuttle',
  'Alireza Ghorbani',
  'U Bank',
  'Lucano',
  'Caspian',
  'Shibaba',
  'Jashnavare Fajr',
  'Bank Saman',
  'Kerman Khodro',
  'Filter Serkan',
  'Khashayar Media',
  'Dr. Abidi',
  'Iran Novin',
]

/**
 * Trusted by — full-bleed editorial marquee of client names.
 * No boxes, no logos, no inflated count: just the names, scrolling.
 * Hovering the strip pauses it; hovering a name tints it reactor-orange.
 */
export function Collaborations() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className={styles.section} id="collaborations">
      <motion.div
        className={styles.header}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <span className="t-label">Trusted by</span>
      </motion.div>

      <motion.div
        className={styles.marquee}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        {/* Two identical rows back-to-back → seamless translateX(-50%) loop.
            The second is aria-hidden so SR users hear the names only once. */}
        <div className={styles.track}>
          {[0, 1].map(copy => (
            <span
              key={copy}
              className={styles.row}
              aria-hidden={copy === 1 || undefined}
            >
              {BRANDS.map(brand => (
                <Fragment key={brand}>
                  <span className={`t-heading ${styles.name}`}>{brand}</span>
                  <span className={styles.dot} aria-hidden>
                    ·
                  </span>
                </Fragment>
              ))}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
