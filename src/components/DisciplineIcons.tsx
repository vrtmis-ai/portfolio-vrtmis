import styles from './Disciplines.module.css'

/**
 * DisciplineIcons — six stroke-only line icons, one per discipline.
 *
 * Every drawable path carries pathLength={1}, so CSS can treat its length as a
 * single unit and "redraw" it from nothing on card hover (stroke-dashoffset
 * 1 → 0, see Disciplines.module.css .iconPath). Strokes use currentColor so
 * they inherit the card's bone → reactor hover colour shift for free.
 */

const COMMON = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: styles.iconSvg,
  'aria-hidden': true,
}

/** Each path is tagged with a CSS var --i for a staggered redraw on hover. */
function P(props: React.SVGProps<SVGPathElement> & { i?: number }) {
  const { i = 0, style, ...rest } = props
  return (
    <path
      pathLength={1}
      className={styles.iconPath}
      style={{ ['--i' as string]: i, ...style }}
      {...rest}
    />
  )
}

export function DisciplineIcon({ num }: { num: string }) {
  switch (num) {
    case '01': // Video Mapping — projection cone onto a surface
      return (
        <svg {...COMMON}>
          <P i={0} d="M4 5 L4 11" />
          <P i={1} d="M4 8 L20 3 L20 21 L4 16 Z" />
          <P i={2} d="M11 9.5 L13 9 M11 14.5 L13 15" />
        </svg>
      )
    case '02': // VFX & Compositing — stacked layers
      return (
        <svg {...COMMON}>
          <P i={0} d="M12 3 L21 8 L12 13 L3 8 Z" />
          <P i={1} d="M3 12 L12 17 L21 12" />
          <P i={2} d="M3 16 L12 21 L21 16" />
        </svg>
      )
    case '03': // AI Visual Production — node graph
      return (
        <svg {...COMMON}>
          <P i={0} d="M6 6 L16 10 M6 6 L9 17 M16 10 L9 17 M16 10 L19 18" />
          <circle pathLength={1} className={styles.iconPath} style={{ ['--i' as string]: 1 }} cx="6" cy="6" r="2" />
          <circle pathLength={1} className={styles.iconPath} style={{ ['--i' as string]: 2 }} cx="16" cy="10" r="2" />
          <circle pathLength={1} className={styles.iconPath} style={{ ['--i' as string]: 3 }} cx="9" cy="17" r="2" />
          <circle pathLength={1} className={styles.iconPath} style={{ ['--i' as string]: 4 }} cx="19" cy="18" r="1.6" />
        </svg>
      )
    case '04': // Motion Graphics — play head + motion arc
      return (
        <svg {...COMMON}>
          <P i={0} d="M8 6 L17 12 L8 18 Z" />
          <P i={1} d="M3 7 C 5 12, 5 12, 3 17" />
        </svg>
      )
    case '05': // Live Visual Production — broadcast waves
      return (
        <svg {...COMMON}>
          <circle pathLength={1} className={styles.iconPath} style={{ ['--i' as string]: 0 }} cx="12" cy="12" r="1.6" />
          <P i={1} d="M8.5 8.5 A 5 5 0 0 0 8.5 15.5 M15.5 8.5 A 5 5 0 0 1 15.5 15.5" />
          <P i={2} d="M6 6 A 9 9 0 0 0 6 18 M18 6 A 9 9 0 0 1 18 18" />
        </svg>
      )
    case '06': // Video Editing & Post — film strip / timeline
      return (
        <svg {...COMMON}>
          <P i={0} d="M3 6 L21 6 L21 18 L3 18 Z" />
          <P i={1} d="M7 6 L7 18 M17 6 L17 18" />
          <P i={2} d="M13 3 L13 21" />
        </svg>
      )
    default:
      return null
  }
}
