import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import styles from './Manifesto.module.css'

/**
 * Manifesto — a big editorial statement that COLORS-IN word by word as the
 * user scrolls past it. Each word goes from concrete (gray) to linen (white)
 * with the orange "reactor" words igniting first. Pure typography. No images.
 *
 * Pattern inspired by Studio Lumio / basement.studio long-form statements.
 */
/**
 * Manifesto — distinct from Hero tagline and About statement.
 * Hero says "what I make."
 * About says "why I started."
 * THIS says "what the work actually feels like."
 */
const STATEMENT = [
  'Made in Tehran.',
  'Built for everywhere.',
  'The brief never matches the room.',
  'That is the work.',
]

/** Words that ignite to ORANGE (rest fade gray → linen). */
const ACCENT_WORDS = new Set(['Tehran', 'work'])

export function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.85', 'start 0.15'],
  })

  // Flatten lines into word units once
  const words = STATEMENT.flatMap((line, lineIdx) =>
    line.split(' ').map((w, wIdx, arr) => ({
      word: w,
      lineIdx,
      isLastInLine: wIdx === arr.length - 1,
    }))
  )
  const total = words.length

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.header}>
        <span className="t-label">Manifesto</span>
      </div>
      <p className={styles.statement}>
        {words.map((w, i) => (
          <Word
            key={`${w.lineIdx}-${i}-${w.word}`}
            word={w.word}
            scrollProgress={scrollYProgress}
            index={i}
            total={total}
            accent={ACCENT_WORDS.has(w.word.toLowerCase().replace(/[.,]/g, ''))}
            breakAfter={w.isLastInLine}
          />
        ))}
      </p>
    </section>
  )
}

function Word({
  word, scrollProgress, index, total, accent, breakAfter,
}: {
  word: string
  scrollProgress: MotionValue<number>
  index: number
  total: number
  accent: boolean
  breakAfter: boolean
}) {
  // Each word "ignites" over a tiny window of scroll progress.
  const start = index / total
  const end = (index + 1) / total
  // Use rgba interpolation via opacity overlay trick:
  // we render two color layers (dim + bright) and fade the bright in.
  const brightOpacity = useTransform(scrollProgress, [start, end], [0, 1])

  return (
    <>
      <span className={styles.wordWrap}>
        <span className={styles.wordDim}>{word}</span>
        <motion.span
          className={`${styles.wordBright} ${accent ? styles.wordAccent : ''}`}
          style={{ opacity: brightOpacity }}
        >
          {word}
        </motion.span>
      </span>
      {breakAfter ? <br /> : ' '}
    </>
  )
}
