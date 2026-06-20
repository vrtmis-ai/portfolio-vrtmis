import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { PROJECTS, type Project } from '../data/projects'
import { getActiveLenis } from '../hooks/useSmoothScroll'
import { TransitionLink } from './TransitionLink'
import { CTAButton } from './CTAButton'
import styles from './StudioRoom.module.css'

/**
 * StudioRoom — scroll-triggered "camera turn" experience.
 *
 * Concept (user-authored AI scenes):
 *   Scene 1 = the studio room (desk, monitor, cozy Y2K atmosphere)
 *   Scene 2 = a wall of CRT televisions, each screen = one project
 *
 * ── PLAYBACK MODEL ──────────────────────────────────────────────────────
 * The camera-turn video is NOT scrubbed frame-by-frame by scroll (that felt
 * janky and let the viewer freeze on an ugly mid-turn frame). Instead the
 * section pins, and the FIRST downward scroll from the room LOCKS the page,
 * plays the transition video through at its own natural rate, then unlocks on
 * the last frame with the TV wall in place. The viewer physically can't stall
 * the turn mid-way, so it always reads as one smooth cinematic move.
 *
 * Phases: 'room' → (scroll down) → 'turning' (locked, video plays) → 'wall'.
 * Scrolling back to the very top of the section resets to 'room' so the move
 * can replay. Under prefers-reduced-motion the lock/playback is skipped and the
 * wall simply cuts in at the scroll midpoint.
 *
 * On the TV wall, invisible hotspots sit over each screen. Hover lights the
 * screen + pops a game-style info card next to the cursor (title + blurb);
 * click opens the case study.
 *
 * ── ASSETS (live in /public/room/) ────────────────────────────────────
 *   scene-1*.mp4     the studio room (intro one-shot + steady loop)
 *   transition.mp4   the camera turn (room → TV wall), played start→end
 *   scene-2.mp4      the looping TV wall
 */

interface Hotspot {
  slug: string
  x: number
  y: number
  w: number
  h: number
}

// Calibrated to the wall render (scene-2): 7 working screens (the other cubbies
// hold a lamp, a bust, books). Projects not shown here — alireza-ghorbani,
// my-baby, cgi-carkook, fashion-documentary (and the hidden u-bank) — live in
// the /work archive only. Every slug below has a matching TV_VIDEOS clip that
// lights up its CRT on hover.
const TV_HOTSPOTS: Hotspot[] = [
  // top shelf — 3 screens
  { slug: 'green-pay', x: 27.0, y: 18.0, w: 11.0, h: 14.0 },
  { slug: 'oliver-twist', x: 44.0, y: 17.0, w: 11.0, h: 15.0 },
  { slug: 'tehran-univ-of-art', x: 63.0, y: 17.0, w: 12.0, h: 15.0 },
  // middle shelf — left + right (centre cubby is a lamp)
  { slug: 'music-video-vfx', x: 27.0, y: 39.0, w: 11.0, h: 13.0 },
  { slug: 'esteghlal', x: 62.0, y: 39.0, w: 12.0, h: 14.0 },
  // lower-centre screen
  { slug: 'tigard', x: 45.0, y: 57.0, w: 11.0, h: 14.0 },
  // bottom-right screen — Serkan (fit the alpha TV video to THIS screen)
  { slug: 'serkan-filter', x: 61.0, y: 76.0, w: 12.0, h: 13.0 },
]

/** Resolve slug → project once. */
function project(slug: string): Project | undefined {
  return PROJECTS.find(p => p.slug === slug)
}

/**
 * Per-TV "channel" videos. Each is a FULL-WALL-frame VP9 clip with a real alpha
 * channel — only that TV's CRT carries footage, the rest is transparent — so it
 * drops straight onto the live wall with object-fit:cover (same fit as the wall
 * video). On hover we point the single overlay at the matching slug's clip and
 * play it; the alpha means only that one screen lights up. Slugs absent here
 * (e.g. a TV without a clip yet) simply don't light up.
 */
const TV_VIDEOS: Record<string, string> = {
  'green-pay': '/work/green-pay/tv.webm',
  'oliver-twist': '/work/oliver-twist/tv.webm',
  'tehran-univ-of-art': '/work/tehran-univ-of-art/tv.webm',
  'music-video-vfx': '/work/music-video-vfx/tv.webm',
  'serkan-filter': '/work/serkan-filter/tv.webm',
  'esteghlal': '/work/esteghlal/tv.webm',
  'tigard': '/work/tigard/tv.webm',
}

/** Scroll thresholds (fraction of the section's scroll range). */
const TURN_TRIGGER = 0.012 // first nudge down from the room fires the turn
const ROOM_RESET = 0.004 // scrolling back above this re-arms the room

/** Keys that scroll the page — blocked while the turn is locked. */
const SCROLL_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar',
])
const blockWheelTouch = (e: Event) => e.preventDefault()
const blockScrollKeys = (e: KeyboardEvent) => {
  if (SCROLL_KEYS.has(e.key)) e.preventDefault()
}

type Phase = 'room' | 'turning' | 'wall' | 'reversing'

export function StudioRoom() {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const scene1Ref = useRef<HTMLVideoElement>(null)
  // Steady lit-room loop, revealed when the intro ends.
  const scene1LoopRef = useRef<HTMLVideoElement>(null)
  // The camera-turn video — played start→end (not scrubbed).
  const transRef = useRef<HTMLVideoElement>(null)
  const transDur = useRef(0)
  // A pre-reversed copy of the turn, played forward when the viewer scrolls
  // back up (HTML5 negative playbackRate is unreliable; reverse-scrubbing a
  // non-all-keyframe clip stutters — a reversed file is the only smooth path).
  const transRevRef = useRef<HTMLVideoElement>(null)
  const revDur = useRef(0)
  // Single alpha overlay that lights up the hovered CRT (src swapped per TV).
  const tvVidRef = useRef<HTMLVideoElement>(null)

  // Hovered project drives the info card (enter/leave only — rare). The card's
  // POSITION follows the cursor through a ref + rAF DOM write (NOT state), so
  // moving across the wall never re-renders this heavy video tree.
  const [hovered, setHovered] = useState<Project | null>(null)
  const infoCardRef = useRef<HTMLElement>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const moveRaf = useRef(0)
  // The hero title animates in exactly when the intro ends (lights up / hands
  // off to the loop), not on mount — so the name lands with the lights.
  const [heroReady, setHeroReady] = useState(false)
  const heroReadyRef = useRef(false)

  // The intro must NOT play under the first-load veil (IntroLoader): it would
  // run unseen and dump the viewer straight into the loop. We mount + autoplay
  // it only once the veil lifts (an 'artemis:veil-lift' event). If the veil
  // already played this session (so it won't show), arm the intro immediately.
  const [playIntro, setPlayIntro] = useState(
    () =>
      typeof window !== 'undefined' &&
      sessionStorage.getItem('intro-played') === '1',
  )

  // Room → turning → wall. A ref mirrors it so the scroll-event callback (a
  // stable subscription) always reads the live value without re-subscribing.
  const [phase, setPhase] = useState<Phase>('room')
  const phaseRef = useRef<Phase>('room')
  const setPhaseBoth = useCallback((p: Phase) => {
    phaseRef.current = p
    setPhase(p)
  }, [])

  // Read the motion preference once.
  const reduceMotionRef = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  // Safety timer: if the video's `ended` never fires, finish the turn anyway.
  const endFallback = useRef<number | undefined>(undefined)

  // ── Scroll lock ──
  const lockScroll = useCallback(() => {
    getActiveLenis()?.stop()
    window.addEventListener('wheel', blockWheelTouch, { passive: false, capture: true })
    window.addEventListener('touchmove', blockWheelTouch, { passive: false, capture: true })
    window.addEventListener('keydown', blockScrollKeys, { capture: true })
  }, [])

  const unlockScroll = useCallback(() => {
    const lenis = getActiveLenis()
    lenis?.start()
    // Kill any momentum that built up BEFORE the lock. Without this, Lenis
    // resumes gliding toward its old (further-down) target the instant we
    // unlock — carrying the viewer deep into the wall dwell, so the reverse
    // then sits a whole viewport of scroll away. Snapping the target to the
    // current position leaves them right where the turn landed (top of wall),
    // a hair from the reverse trigger.
    if (lenis) lenis.scrollTo(window.scrollY, { immediate: true })
    window.removeEventListener('wheel', blockWheelTouch, { capture: true })
    window.removeEventListener('touchmove', blockWheelTouch, { capture: true })
    window.removeEventListener('keydown', blockScrollKeys, { capture: true })
  }, [])

  // ── Turn control ──
  const finishTurn = useCallback(() => {
    window.clearTimeout(endFallback.current)
    if (phaseRef.current !== 'turning') return
    setPhaseBoth('wall')
    unlockScroll()
  }, [setPhaseBoth, unlockScroll])

  const startTurn = useCallback(() => {
    if (phaseRef.current !== 'room') return
    setPhaseBoth('turning')
    lockScroll()
    const v = transRef.current
    if (v) {
      v.currentTime = 0
      // If playback is blocked (autoplay off), don't hold the lock for the full
      // clip staring at a frozen frame — cut straight to the wall instead.
      v.play().catch(() => finishTurn())
    }
    // Warm the reverse clip NOW — during the ~5 s forward turn — so a later
    // scroll-back-up starts instantly instead of stalling on a ~4 MB fetch.
    // (It's preload="none" until here, so visitors who never reach the wall
    // never pay for it.)
    const rev = transRevRef.current
    if (rev && rev.preload !== 'auto') {
      rev.preload = 'auto'
      rev.load()
    }
    // Fallback to the clip's own length (or a sane default) if `ended` misfires.
    endFallback.current = window.setTimeout(
      finishTurn,
      (transDur.current || 6) * 1000 + 800,
    )
  }, [setPhaseBoth, lockScroll, finishTurn])

  // Scrolling back up from the wall plays the turn IN REVERSE (room comes back
  // the same way it left), locked so it can't be frozen mid-frame — symmetric
  // with the forward turn.
  const finishReverse = useCallback(() => {
    window.clearTimeout(endFallback.current)
    if (phaseRef.current !== 'reversing') return
    setPhaseBoth('room')
    // Rewind the forward clip so the next downward turn plays clean from frame 0.
    const v = transRef.current
    if (v) {
      v.pause()
      v.currentTime = 0
    }
    unlockScroll()
  }, [setPhaseBoth, unlockScroll])

  const startReverse = useCallback(() => {
    if (phaseRef.current !== 'wall') return
    setPhaseBoth('reversing')
    lockScroll()
    const rev = transRevRef.current
    if (rev) {
      rev.currentTime = 0
      // Blocked playback → cut back to the room rather than freezing the lock.
      rev.play().catch(() => finishReverse())
    }
    endFallback.current = window.setTimeout(
      finishReverse,
      (revDur.current || transDur.current || 6) * 1000 + 800,
    )
  }, [setPhaseBoth, lockScroll, finishReverse])

  // Hand off from the one-shot intro (dark → lights up) to the steady room loop:
  // start the loop at frame 0 (matches the intro's final frame), fade the intro
  // layer out to reveal it, and land the hero title with the lights. This is
  // ALSO the graceful path when the intro can't autoplay (Opera GX, Safari,
  // data-saver): we still reveal the lit room + title instead of stranding the
  // viewer on the dark first frame.
  const revealRoom = useCallback(() => {
    const loop = scene1LoopRef.current
    if (loop) {
      loop.currentTime = 0
      void loop.play().catch(() => {})
    }
    const intro = scene1Ref.current
    if (intro) intro.style.opacity = '0'
    heroReadyRef.current = true
    setHeroReady(true)
  }, [])

  // Scroll progress across the whole tall container.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Drive the phase machine from scroll position.
  useMotionValueEvent(scrollYProgress, 'change', v => {
    if (reduceMotionRef.current) {
      // No lock / no playback: the wall just cuts in past the midpoint.
      if (v > 0.5 && phaseRef.current !== 'wall') setPhaseBoth('wall')
      else if (v <= 0.5 && phaseRef.current !== 'room') setPhaseBoth('room')
      return
    }
    if (phaseRef.current === 'room' && heroReadyRef.current && v > TURN_TRIGGER) {
      startTurn()
    } else if (phaseRef.current === 'wall' && v < ROOM_RESET) {
      startReverse()
    }
  })

  // Arm the intro when the first-load veil lifts (IntroLoader fires
  // 'artemis:veil-lift' as it slides away). A safety timeout arms it anyway in
  // case the event is missed, so the intro can never get stuck waiting.
  useEffect(() => {
    if (playIntro) return
    const arm = () => setPlayIntro(true)
    window.addEventListener('artemis:veil-lift', arm)
    const t = window.setTimeout(arm, 2000)
    return () => {
      window.removeEventListener('artemis:veil-lift', arm)
      window.clearTimeout(t)
    }
  }, [playIntro])

  // Once armed, the intro <video> is mounted and autoplays (dark → lights up).
  // A beat later, bring the title in — OR, if the intro never actually started
  // (autoplay blocked and the play() promise left pending, as Opera GX does),
  // reveal the lit room so we never strand the viewer on the dark first frame.
  useEffect(() => {
    if (!playIntro) return
    const t = window.setTimeout(() => {
      const intro = scene1Ref.current
      if (intro && (intro.paused || intro.currentTime < 0.1)) {
        revealRoom()
      } else {
        heroReadyRef.current = true
        setHeroReady(true)
      }
    }, 1600)
    return () => window.clearTimeout(t)
  }, [playIntro, revealRoom])

  // Always release the lock if we unmount mid-turn (route change during play).
  useEffect(() => {
    return () => {
      window.clearTimeout(endFallback.current)
      unlockScroll()
    }
  }, [unlockScroll])

  // Position the info card at the cursor via a direct DOM write — flipping it
  // to the left near the right edge so it never runs off-screen. No state, so
  // this costs nothing per frame.
  const positionCard = useCallback(() => {
    const el = infoCardRef.current
    if (!el) return
    const { x, y } = pointer.current
    const flip = x > window.innerWidth - 300
    el.style.left = `${x}px`
    el.style.top = `${y}px`
    el.style.transform = flip
      ? 'translate(calc(-100% - 18px), 12px)'
      : 'translate(18px, 12px)'
  }, [])

  const handleHotspotMove = useCallback(
    (e: React.MouseEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY }
      if (moveRaf.current) return
      moveRaf.current = requestAnimationFrame(() => {
        moveRaf.current = 0
        positionCard()
      })
    },
    [positionCard],
  )

  // Place the card before the browser paints it (no flash at 0,0).
  useLayoutEffect(() => {
    if (hovered) positionCard()
  }, [hovered, positionCard])

  // Layer visibility is now phase-driven (not a scroll scrub).
  const roomVisible = phase === 'room'
  const wallVisible = phase === 'wall'
  const heroVisible = phase === 'room' && heroReady

  // Warm the per-TV hover clips once the wall is reached, so the first hover
  // plays instantly instead of stalling on a network fetch (the overlay video
  // is preload="none", and on a CDN that first fetch is a visible delay).
  const tvWarmedRef = useRef(false)
  useEffect(() => {
    if (!wallVisible || tvWarmedRef.current) return
    tvWarmedRef.current = true
    for (const url of Object.values(TV_VIDEOS)) fetch(url).catch(() => {})
  }, [wallVisible])

  return (
    <section className={styles.section} id="studio" aria-label="Studio · selected work">
      <div ref={containerRef} className={styles.scrollRange}>
        <div className={styles.sticky}>
          {/* ── Layer 1 (bottom): the camera-turn video ──
              Played start→end on the locked turn. Frame 0 is the room and the
              last frame is the TV wall, so it bridges the two. */}
          <video
            ref={transRef}
            className={styles.transitionVid}
            poster="/room/scene-2.jpg"
            muted
            playsInline
            preload="auto"
            aria-hidden
            onEnded={finishTurn}
            onLoadedMetadata={() => {
              if (transRef.current) transDur.current = transRef.current.duration
            }}
          >
            <source src="/room/transition.mp4" type="video/mp4" />
          </video>

          {/* ── Layer 1b: the REVERSE turn ──
              Sits just above the forward clip, shown only while reversing (wall
              → room). Lazy: preload="none" until the wall is reached. */}
          <video
            ref={transRevRef}
            className={styles.transitionVid}
            style={{ opacity: phase === 'reversing' ? 1 : 0 }}
            muted
            playsInline
            preload="none"
            aria-hidden
            onEnded={finishReverse}
            onLoadedMetadata={() => {
              if (transRevRef.current) revDur.current = transRevRef.current.duration
            }}
          >
            <source src="/room/transition-reverse.mp4" type="video/mp4" />
          </video>

          {/* ── Layer 2: the TV wall gallery (fades in on the final frame) ── */}
          <motion.div
            className={styles.wallLayer}
            initial={false}
            animate={{ opacity: wallVisible ? 1 : 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <video
              className={styles.sceneImg}
              poster="/room/scene-2.jpg"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              aria-label="Wall of televisions, each one a project"
            >
              <source src="/room/scene-2.mp4" type="video/mp4" />
            </video>

            {/* Single alpha overlay — its src is swapped to the hovered TV's
                clip; the alpha means only that CRT lights up. */}
            <video
              ref={tvVidRef}
              className={styles.tvOverlay}
              muted
              loop
              playsInline
              preload="none"
              aria-hidden
            />

            {/* Clickable hotspots over each screen — only live on the wall. */}
            <div
              className={styles.hotspots}
              style={{ pointerEvents: wallVisible ? 'auto' : 'none' }}
              onMouseMove={handleHotspotMove}
            >
              {TV_HOTSPOTS.map(spot => {
                const p = project(spot.slug)
                if (!p) return null
                return (
                  <TransitionLink
                    key={spot.slug}
                    to={`/work/${spot.slug}`}
                    className={styles.hotspot}
                    style={{
                      left: `${spot.x}%`,
                      top: `${spot.y}%`,
                      width: `${spot.w}%`,
                      height: `${spot.h}%`,
                      // The clicked TV screen morphs into the case-study video.
                      viewTransitionName: `work-${spot.slug}`,
                    }}
                    aria-label={`Open ${p.caseStudyTitle}`}
                    onMouseEnter={() => {
                      setHovered(p)
                      const src = TV_VIDEOS[spot.slug]
                      const v = tvVidRef.current
                      if (!v) return
                      if (src) {
                        if (v.getAttribute('src') !== src) v.src = src
                        v.classList.remove(styles.tvOn)
                        void v.offsetWidth // restart the tune-in flicker
                        v.classList.add(styles.tvOn)
                        v.currentTime = 0
                        void v.play().catch(() => {})
                      } else {
                        // This TV has no clip yet — clear any lingering channel.
                        v.classList.remove(styles.tvOn)
                        v.pause()
                      }
                    }}
                    onMouseLeave={() => {
                      setHovered(h => (h?.slug === p.slug ? null : h))
                      const v = tvVidRef.current
                      if (v && TV_VIDEOS[spot.slug]) {
                        v.classList.remove(styles.tvOn)
                        v.pause()
                      }
                    }}
                  />
                )
              })}
            </div>

            <div className={styles.wallLabel}>
              <span className="t-label">Selected Work</span>
              <span className={`t-mono ${styles.wallHint}`}>hover a screen ↗</span>
            </div>
          </motion.div>

          {/* ── Layer 3: the room background (intro + loop) ──
              Shown in the 'room' phase; fades out as the turn begins, handing
              off to the transition video (whose first frame is this same room,
              so there's no ghosting). */}
          <motion.div
            className={styles.roomLayer}
            initial={false}
            animate={{ opacity: roomVisible ? 1 : 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden
          >
            <video
              ref={scene1LoopRef}
              className={styles.sceneImg}
              poster="/room/scene-1.jpg"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              aria-hidden
            >
              <source src="/room/scene-1-loop.mp4" type="video/mp4" />
            </video>
            {/* Mounted only once the first-load veil lifts (see playIntro) —
                otherwise it would play unseen under the loader. Mounting it with
                `autoplay` is what starts it, so the dark → lights-up reveal
                lands exactly as the veil slides away. */}
            {playIntro ? (
              <video
                ref={scene1Ref}
                className={`${styles.sceneImg} ${styles.introLayer}`}
                poster="/room/scene-1-dark.jpg"
                autoPlay
                muted
                playsInline
                preload="auto"
                onEnded={revealRoom}
                aria-label="The studio"
              >
                <source src="/room/scene-1.mp4" type="video/mp4" />
              </video>
            ) : null}
          </motion.div>

          {/* ── Layer 4 (top): the hero title ──
              Enters when the intro lights up; fades out the moment the turn
              starts. Stays in the DOM (opacity only) so crawlers see the h1. */}
          <div className={styles.heroLayer}>
            <div className={styles.heroScrim} aria-hidden />
            <motion.div
              className={styles.hero}
              style={{ pointerEvents: roomVisible ? 'auto' : 'none' }}
              initial={false}
              animate={{ opacity: heroVisible ? 1 : 0, y: heroVisible ? 0 : 30 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className={styles.heroTag}>
                <span className={styles.heroTagLine} aria-hidden />
                Visual Artist &amp; AI Creative
              </span>
              <h1 className={`t-display ${styles.heroName}`}>
                <span className={styles.heroNameLine}>Mahbod</span>
                <span className={`${styles.heroNameLine} ${styles.heroNameAccent}`}>Tavassoli</span>
              </h1>
              <div className={styles.heroCta}>
                <CTAButton variant="glass" onClick={() => navigate('/contact')}>Let&apos;s talk</CTAButton>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Always-visible text route into the archive — the TV hotspots are
          small pointer targets, so touch/keyboard users get this instead. */}
      <div className={styles.archiveRow}>
        <TransitionLink to="/work" className={`t-mono ${styles.archiveLink}`}>
          Browse the full archive →
        </TransitionLink>
      </div>

      {/* Game-style info card that tracks the cursor over the TV wall. Position
          is written directly to this node (see positionCard) — no per-move
          state — and it fades in via CSS. */}
      {hovered ? (
        <aside ref={infoCardRef} className={styles.infoCard}>
          <span className={`t-mono ${styles.infoMeta}`}>
            {hovered.category} · {hovered.year}
          </span>
          <h3 className={styles.infoTitle}>{hovered.title.replace('\n', ' ')}</h3>
          <p className={styles.infoDesc}>{hovered.description}</p>
          <span className={`t-mono ${styles.infoCta}`}>open case study ↗</span>
        </aside>
      ) : null}
    </section>
  )
}
