import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { SplitText } from './SplitText'
import styles from './Contact.module.css'

/**
 * Contact — Real CV details.
 * Massive CTA + real email/phone/studio.
 */
export function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section ref={sectionRef} className={styles.contact} id="contact">
      <div className={styles.inner}>
        <motion.span
          className="t-label"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          Contact
        </motion.span>

        <h2 className={`t-display ${styles.cta}`}>
          <SplitText stagger={0.05} duration={1.0} trigger="inview">Let's make</SplitText>
          <br />
          <SplitText stagger={0.05} duration={1.0} delay={0.25} trigger="inview">something</SplitText>
          <br />
          <SplitText stagger={0.05} duration={1.0} delay={0.5} trigger="inview">real.</SplitText>
        </h2>

        <div className={styles.details}>
          <motion.a
            href="mailto:mahbodtavassoli@outlook.com"
            className={`t-heading ${styles.email}`}
            data-hover
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            mahbodtavassoli@outlook.com
          </motion.a>

          <motion.div
            className={styles.contactRows}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className={styles.contactRow}>
              <span className="t-label">Phone &rarr;</span>
              <a href="tel:+989909270038" className="t-mono" data-hover>+98 990 927 0038</a>
            </div>
            <div className={styles.contactRow}>
              <span className="t-label">Location &rarr;</span>
              <span className="t-mono">Tehran, Iran</span>
            </div>
            <div className={styles.contactRow}>
              <span className="t-label">Studio &rarr;</span>
              <a href="https://artemis.studio" target="_blank" rel="noreferrer" className="t-mono" data-hover>artemis.studio</a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
