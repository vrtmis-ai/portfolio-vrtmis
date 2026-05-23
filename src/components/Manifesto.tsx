import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import styles from './Manifesto.module.css'

/**
 * Manifesto — editorial statement that COLOURS-IN word by word as the user
 * scrolls past it (the gpt-taste "scrubbing text reveal" pattern).
 *
 * Plus, an INLINE typography pill image embedded in the first line — a small
 * urban-feeling pill inside "Made in [image] Tehran." The pill image lives
 * on the text baseline, mid-sentence — premium magazine-editorial move.
 *
 * Drop a real photo at /public/inline/tehran.jpg to replace the placeholder
 * (currently from picsum.photos so it has SOMETHING on first load).
 */

/** A token in the manifesto: either a word or an inline image */
type Token =
  | { kind: 'word'; text: string }
  | { kind: 'image'; src: string; alt: string }

/** The manifesto, line-by-line, where one of the words is replaced by an image */
const LINES: Token[][] = [
  [
    { kind: 'word', text: 'Made' },
    { kind: 'word', text: 'in' },
    { kind: 'image', src: '/inline/tehran.jpg', alt: 'Tehran skyline' },
    { kind: 'word', text: 'Tehran.' },
  ],
  [
    { kind: 'word', text: 'Built' },
    { kind: 'word', text: 'for' },
    { kind: 'word', text: 'everywhere.' },
  ],
  [
    { kind: 'word', text: 'The' },
    { kind: 'word', text: 'brief' },
    { kind: 'word', text: 'never' },
    { kind: 'word', text: 'matches' },
    { kind: 'word', text: 'the' },
    { kind: 'word', text: 'room.' },
  ],
  [
    { kind: 'word', text: 'That' },
    { kind: 'word', text: 'is' },
    { kind: 'word', text: 'the' },
    { kind: 'word', text: 'work.' },
  ],
]

/** Words that ignite to ORANGE when revealed (rest go gray → linen). */
const ACCENT_WORDS = new Set(['tehran', 'work'])

/** Flatten lines into a single token stream with line + last-in-line metadata */
type FlatToken = Token & { lineIdx: number; isLastInLine: boolean; flatIdx: number }
const FLAT: FlatToken[] = LINES.flatMap((line, lineIdx) =>
  line.map((token, tokenIdx) => ({
    ...token,
    lineIdx,
    isLastInLine: tokenIdx === line.length - 1,
    flatIdx: 0, // placeholder, filled below
  }))
).map((t, i) => ({ ...t, flatIdx: i }))

const TOTAL = FLAT.length

export function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.85', 'start 0.15'],
  })

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.header}>
        <span className="t-label">Manifesto</span>
      </div>
      <p className={styles.statement}>
        {FLAT.map((token, i) => {
          if (token.kind === 'image') {
            return (
              <span key={`img-${i}`}>
                <InlineImage src={token.src} alt={token.alt} />
                {token.isLastInLine ? <br /> : ' '}
              </span>
            )
          }
          // Word token
          const accent = ACCENT_WORDS.has(token.text.toLowerCase().replace(/[.,]/g, ''))
          return (
            <Word
              key={`w-${i}`}
              word={token.text}
              scrollProgress={scrollYProgress}
              index={token.flatIdx}
              total={TOTAL}
              accent={accent}
              breakAfter={token.isLastInLine}
            />
          )
        })}
      </p>
    </section>
  )
}

/** Inline typography pill — a small urban-feeling image on the text baseline */
function InlineImage({ src, alt }: { src: string; alt: string }) {
  return (
    <span
      className={styles.inlineImg}
      style={{ backgroundImage: `url(${src})` }}
      role="img"
      aria-label={alt}
    />
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
  // Each word ignites over a tiny window of scroll progress
  const start = index / total
  const end = (index + 1) / total
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
