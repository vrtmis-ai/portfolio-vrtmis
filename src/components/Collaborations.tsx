import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import type { MouseEvent } from 'react'
import styles from './Collaborations.module.css'

/**
 * Per-tile mouse handler: drives 3D tilt + spotlight position via CSS vars.
 * Lives at module scope so it doesn't allocate on every render.
 */
function tileMouseHandler(e: MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget
  const rect = el.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  el.style.setProperty('--tilt-x', `${-y * 3}deg`) // ±3deg — subtle for small tiles
  el.style.setProperty('--tilt-y', `${x * 3}deg`)
  el.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`)
  el.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`)
}

function tileMouseLeave(e: MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget
  el.style.setProperty('--tilt-x', '0deg')
  el.style.setProperty('--tilt-y', '0deg')
}

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
 * Collaborations — bold typographic grid of client names.
 * No logos. Just names. Confident, editorial.
 */
export function Collaborations() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className={styles.section} id="collaborations">
      <div className={styles.header}>
        <motion.div
          className={styles.headerRow}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span className="t-label">Collaborations &amp; Clients</span>
          <span className={`t-label ${styles.count}`}>20+ · Selected</span>
        </motion.div>
      </div>

      <div className={styles.grid}>
        {BRANDS.map((brand, index) => (
          <motion.div
            key={brand}
            className={styles.brand}
            onMouseMove={tileMouseHandler}
            onMouseLeave={tileMouseLeave}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.6,
              delay: index * 0.04,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <span className={`t-heading ${styles.brandName}`}>{brand}</span>
          </motion.div>
        ))}

        {/* Final tile — closes the grid with a confident "+ many more" */}
        <motion.div
          className={`${styles.brand} ${styles.brandMore}`}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.6,
            delay: BRANDS.length * 0.04,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <span className={`t-heading ${styles.brandName}`}>+ many more</span>
        </motion.div>
      </div>
    </section>
  )
}
