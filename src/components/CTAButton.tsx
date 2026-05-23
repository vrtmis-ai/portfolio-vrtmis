import type { ReactNode } from 'react'
import { useRef } from 'react'
import styles from './CTAButton.module.css'

interface CTAButtonProps {
  children: ReactNode
  href?: string
  /** Arrow direction shown next to label */
  arrow?: 'right' | 'down' | 'none'
  external?: boolean
  onClick?: () => void
  /** Disable magnetic pull (default on). */
  magnetic?: boolean
}

/**
 * Primary CTA button.
 *
 * Pattern from artemis site: orange outline that fills via translateX(-100%) → 0
 * on hover. Letter-spacing 0.12em, Syne 600, uppercase.
 *
 * Plus: MAGNETIC PULL — when the cursor is inside a 80px radius around the
 * button, the button itself drifts toward the cursor (max 12px). On leave,
 * it springs back. Subtle but recognisable.
 */
export function CTAButton({
  children,
  href,
  arrow = 'right',
  external = false,
  onClick,
  magnetic = true,
}: CTAButtonProps) {
  const btnRef = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null)

  function handleMove(e: React.MouseEvent) {
    if (!magnetic || !btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    // Clamp pull to ±12px
    const pullX = Math.max(-12, Math.min(12, dx * 0.3))
    const pullY = Math.max(-8, Math.min(8, dy * 0.3))
    btnRef.current.style.transform = `translate(${pullX}px, ${pullY}px)`
  }

  function handleLeave() {
    if (!btnRef.current) return
    btnRef.current.style.transform = 'translate(0, 0)'
  }

  const arrowGlyph = arrow === 'right' ? '→' : arrow === 'down' ? '↓' : ''
  const linkProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  const inner = (
    <>
      <span className={styles.label}>{children}</span>
      {arrowGlyph ? <span className={styles.arrow}>{arrowGlyph}</span> : null}
    </>
  )

  if (href) {
    return (
      <a
        ref={btnRef as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={styles.cta}
        onClick={onClick}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        {...linkProps}
      >
        {inner}
      </a>
    )
  }

  return (
    <button
      ref={btnRef as React.RefObject<HTMLButtonElement>}
      type="button"
      className={styles.cta}
      data-cursor={cursor}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {inner}
    </button>
  )
}
