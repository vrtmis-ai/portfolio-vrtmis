import { useTheme } from '../hooks/useTheme'
import styles from './ThemeToggle.module.css'

/**
 * ThemeToggle — single-button switch between dark and light themes.
 *
 * Visual: SUN icon (○ with rays) when in DARK mode (meaning: click to brighten).
 * MOON icon (crescent) when in LIGHT mode (meaning: click to darken).
 *
 * The icon swap is animated via CSS opacity — no flicker, no layout shift.
 * Persistence handled by useTheme (localStorage + html[data-theme]).
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isLight = theme === 'light'

  return (
    <button
      type="button"
      onClick={toggle}
      className={styles.toggle}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      aria-pressed={isLight}
      title={isLight ? 'Dark mode' : 'Light mode'}
    >
      <svg className={styles.icon} viewBox="0 0 24 24" width="18" height="18" aria-hidden>
        {/* SUN — visible in dark mode (click to switch to light) */}
        <g className={`${styles.sun} ${isLight ? styles.iconHidden : styles.iconShown}`}>
          <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
            <line x1="12" y1="2.5" x2="12" y2="4.5" />
            <line x1="12" y1="19.5" x2="12" y2="21.5" />
            <line x1="2.5" y1="12" x2="4.5" y2="12" />
            <line x1="19.5" y1="12" x2="21.5" y2="12" />
            <line x1="5.2" y1="5.2" x2="6.6" y2="6.6" />
            <line x1="17.4" y1="17.4" x2="18.8" y2="18.8" />
            <line x1="5.2" y1="18.8" x2="6.6" y2="17.4" />
            <line x1="17.4" y1="6.6" x2="18.8" y2="5.2" />
          </g>
        </g>
        {/* MOON — visible in light mode (click to switch to dark) */}
        <path
          className={`${styles.moon} ${isLight ? styles.iconShown : styles.iconHidden}`}
          d="M 20 14 A 8 8 0 1 1 10 4 A 6 6 0 0 0 20 14 Z"
          fill="currentColor"
        />
      </svg>
    </button>
  )
}
