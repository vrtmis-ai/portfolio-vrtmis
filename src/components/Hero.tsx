import { motion } from 'framer-motion'
import { SplitText } from './SplitText'
import { CTAButton } from './CTAButton'
import styles from './Hero.module.css'

interface HeroProps {
  scrollProgress: number
}

/**
 * Hero — title card. Adopts the user's previous artemis-site patterns:
 *   - Bottom-aligned content (justify-content: flex-end)
 *   - Hero-tag with leading line ::before
 *   - Scanlines overlay (subtle CRT)
 *   - Orange CTA with fill-on-hover
 *
 * The scenes (studio, craft, on-site, AI) come right after this — owned by
 * ScrollChapters. The hero is the title card, nothing more.
 */
export function Hero({ scrollProgress }: HeroProps) {
  return (
    <section id="top" className={styles.hero}>
      {/* Scanlines — subtle CRT field over the whole hero */}
      <div className={styles.scanlines} aria-hidden />

      {/* Bottom-gradient overlay so content sits on a dimmer base */}
      <div className={styles.overlay} aria-hidden />

      {/* Top-right metadata block */}
      <motion.div
        className={styles.topRight}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <span className="t-label">Tehran, IR</span>
        <span className={`t-label ${styles.muted}`}>EST · 2015</span>
      </motion.div>

      {/* Hero content stack — sits at bottom of viewport */}
      <div className={styles.content}>
        <motion.div
          className={styles.tag}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          <span className={styles.tagLine} />
          Visual Artist &amp; AI Creative
        </motion.div>

        {/* Single H1 on the page (the previous two h1s violated SEO + a11y).
            Visible name is split across two lines; the orange line is a styled
            span, not a separate heading. */}
        <h1 className={`t-display ${styles.name}`}>
          <span className={styles.nameLine}>
            <SplitText delay={0.6} stagger={0.045} duration={1.1}>Mahbod</SplitText>
          </span>
          <span className={`${styles.nameLine} ${styles.nameAccent}`}>
            <SplitText delay={0.9} stagger={0.045} duration={1.1}>Tavassoli</SplitText>
          </span>
        </h1>

        <div className={styles.subRow}>
          <motion.p
            className={styles.subline}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            VFX <strong>·</strong> Video Mapping <strong>·</strong> AI Production <strong>·</strong> Motion <strong>·</strong> Live Visual
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.7 }}
          >
            <CTAButton href="#work">See Work</CTAButton>
          </motion.div>
        </div>
      </div>

      {/* Bottom scroll cue */}
      <motion.div
        className={styles.scrollCue}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        style={{ opacity: Math.max(0, 1 - scrollProgress * 10) }}
      >
        <span className="t-label">Scroll</span>
        <div className={styles.scrollLine} />
      </motion.div>
    </section>
  )
}
