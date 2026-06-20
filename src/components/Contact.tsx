import { motion, useInView, type Variants } from 'framer-motion'
import { useRef } from 'react'
import { SplitText } from './SplitText'
import styles from './Contact.module.css'

/**
 * Contact — editorial split with a dossier card.
 *
 * Left:  CTA headline + availability subtext.
 * Right: "Double-Bezel" dossier card — outer shell → inner core — containing
 *        a status badge, email hero, channel rows, and social pills.
 *
 * Principles applied:
 *   high-end-visual-design §4A (nested architecture / Double-Bezel)
 *   interaction-design §2    (timing: 200-300ms small, 300-500ms medium)
 *   ui-ux-pro-max §7         (spring physics, stagger 30-50ms, scale feedback)
 *   HIG-layout               (clear hierarchy, spatial consistency)
 *   HIG-status               (availability indicator with pulsing dot)
 */

type Channel = { label: string; value: string; href?: string; external?: boolean }

const CHANNELS: readonly Channel[] = [
  { label: 'Phone', value: '+98 990 927 0038', href: 'tel:+989909270038' },
  { label: 'Location', value: 'Tehran, Iran' },
  { label: 'Studio', value: 'artemis.studio', href: 'https://artemis.studio', external: true },
]

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com/thvrtmis' },
  { label: 'Telegram', href: 'https://t.me/vrtmis' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/mahbod-tavassoli-thvrtmis' },
] as const

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })

  return (
    <section ref={sectionRef} className={styles.contact} id="contact">
      <div className={styles.split}>
        {/* ── Left: CTA ── */}
        <div className={styles.left}>
          <motion.span
            className={`t-label ${styles.eyebrow}`}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
          >
            Contact
          </motion.span>

          <h1 className={`t-display ${styles.cta}`}>
            <SplitText stagger={0.04} duration={0.9} trigger="inview">Let's make</SplitText>
            <br />
            <SplitText stagger={0.04} duration={0.9} delay={0.2} trigger="inview">something</SplitText>
            <br />
            <SplitText stagger={0.04} duration={0.9} delay={0.4} trigger="inview">real.</SplitText>
          </h1>

          <motion.p
            className={styles.subtext}
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Open to commissions, collaborations, and conversations
            about light, code, and room.
          </motion.p>
        </div>

        {/* ── Right: stacked cards ── */}
        <div className={styles.right}>
          {/* Dossier card (Double-Bezel) */}
          <motion.div
            className={styles.cardShell}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.cardCore}>
              <div className={styles.statusBadge}>
                <span className={styles.statusDot} />
                <span className={`t-label ${styles.statusText}`}>Available for work</span>
              </div>

              <motion.div
                className={styles.emailBlock}
                variants={stagger}
                initial="hidden"
                animate={isInView ? 'show' : 'hidden'}
              >
                <motion.span className={`t-label ${styles.fieldLabel}`} variants={fadeUp}>
                  Email
                </motion.span>
                <motion.a
                  href="mailto:mahbodtavassoli@outlook.com"
                  className={styles.email}
                  data-hover
                  variants={fadeUp}
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  mahbodtavassoli@outlook.com
                </motion.a>
              </motion.div>

              <motion.div
                className={styles.divider}
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />

              <motion.div
                className={styles.channels}
                variants={stagger}
                initial="hidden"
                animate={isInView ? 'show' : 'hidden'}
              >
                {CHANNELS.map(ch => (
                  <motion.div key={ch.label} className={styles.row} variants={fadeUp}>
                    <span className={`t-label ${styles.fieldLabel}`}>{ch.label}</span>
                    {ch.href ? (
                      <motion.a
                        href={ch.href}
                        className={styles.fieldValue}
                        data-hover
                        whileHover={{ x: 4 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        {...(ch.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                      >
                        {ch.value}
                        {ch.external ? <span className={styles.arrow}> ↗</span> : null}
                      </motion.a>
                    ) : (
                      <span className={styles.fieldValue}>{ch.value}</span>
                    )}
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className={styles.divider}
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />

              <motion.div
                className={styles.socials}
                variants={stagger}
                initial="hidden"
                animate={isInView ? 'show' : 'hidden'}
              >
                <motion.span className={`t-label ${styles.fieldLabel}`} variants={fadeUp}>
                  Elsewhere
                </motion.span>
                <div className={styles.socialLinks}>
                  {SOCIALS.map(s => (
                    <motion.a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.pill}
                      data-hover
                      variants={fadeUp}
                      whileHover={{ scale: 1.04, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      {s.label}
                      <span className={styles.pillArrow}>↗</span>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* AI Assistant — rotating-glow placeholder */}
          <motion.div
            className={styles.chatShell}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.chatGlow} aria-hidden />

            <div className={styles.chatCore}>
              <div className={styles.chatHeader}>
                <div className={styles.chatBadge}>
                  <span className={styles.chatDot} />
                  <span className={`t-label ${styles.chatBadgeText}`}>AI Assistant</span>
                </div>
                <span className={`t-label ${styles.chatMeta}`}>Trained on my work, process &amp; availability</span>
              </div>

              <div className={styles.chatBody}>
                <div className={styles.msgBot}>
                  <span className={styles.msgAvatar} aria-hidden>&#10022;</span>
                  <span className={styles.msgText}>
                    Hey! I&apos;m Mahbod&apos;s assistant. Ask me about his work, availability, or how we can collaborate.
                  </span>
                </div>
                <div className={styles.typing} aria-label="AI is typing">
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </div>
              </div>

              <div className={styles.chatInput}>
                <div className={styles.inputField}>
                  <span className={styles.inputPlaceholder}>Ask about projects, process, pricing...</span>
                </div>
                <div className={styles.sendBtn} aria-hidden>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M1 8h14M9 2l6 6-6 6" stroke="var(--reactor)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              <span className={`t-label ${styles.chatComingSoon}`}>Coming soon</span>
            </div>

            <div className={styles.chatLock} aria-hidden>
              <svg className={styles.lockIcon} viewBox="0 0 24 24" fill="none">
                <rect x="5" y="11" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="12" cy="16" r="1.5" fill="currentColor" />
              </svg>
              <span className={`t-label ${styles.lockText}`}>Coming Soon</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
