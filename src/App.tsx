import { Hero } from './components/Hero'
import { Nav } from './components/Nav'
import { IntroLoader } from './components/IntroLoader'
import { Manifesto } from './components/Manifesto'
import { Numbers } from './components/Numbers'
import { ScrollChapters } from './components/ScrollChapters'
import { Process } from './components/Process'
import { Disciplines } from './components/Disciplines'
import { Work } from './components/Work'
import { About } from './components/About'
import { Collaborations } from './components/Collaborations'
import { Marquee } from './components/Marquee'
import { NowPlaying } from './components/NowPlaying'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { BackToTop } from './components/BackToTop'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useMouseInteraction } from './hooks/useMouseInteraction'

/**
 * Page composition — Studio Floor narrative order.
 *
 *   1.  Hero            — title card.
 *   2.  Manifesto       — scroll-driven word colour-in statement.
 *   3.  Numbers         — counters that tick from 0 (years, projects, clients).
 *   4.  ScrollChapters  — cinematic placeholder scenes (user-authored assets).
 *   5.  Process         — sticky-pin two-column "how I work" (4 stages).
 *   6.  Disciplines     — 6 skill cards with 3D tilt on hover.
 *   7.  Marquee         — typographic divider.
 *   8.  Work            — horizontal-scroll project showcase.
 *   9.  Collaborations  — client grid.
 *  10.  NowPlaying      — what I'm working on this week.
 *  11.  About           — bio + fact sheet + grouped skills.
 *  12.  Contact         — outreach CTA.
 *  13.  Footer          — wrap.
 */
function App() {
  const { scrollProgress } = useSmoothScroll()
  // Single hook drives both the custom cursor AND the parallax mouse position.
  // One global mousemove listener (passive) instead of two.
  const { cursorRef, state, mouse } = useMouseInteraction()

  /**
   * Four cinematic scenes — a mini-arc, NOT a re-statement of Hero/About.
   * Each one is a distinct moment in time: the room, the gear, the show, the after.
   */
  const chapters = [
    {
      id: 'studio',
      type: 'placeholder' as const,
      label: '01 / The Room',
      heading: 'Two monitors.\nOne render queue.',
      subheading: 'Late hours, hot RAM, no shortcuts.',
      caption: 'artemis.studio',
    },
    {
      id: 'gear',
      type: 'placeholder' as const,
      label: '02 / The Kit',
      heading: 'Many instruments.\nOne head.',
      subheading: 'Resolume · ComfyUI · TouchDesigner · After Effects · Cinema 4D.',
      caption: 'Stack 2026',
    },
    {
      id: 'showtime',
      type: 'placeholder' as const,
      label: '03 / Showtime',
      heading: 'Friday, 9pm.\nDoors at ten.',
      subheading: 'The cue list runs. The wall lights up. Forty thousand lumens, one shot.',
      caption: 'Live Production',
    },
    {
      id: 'after',
      type: 'placeholder' as const,
      label: '04 / After',
      heading: 'Crew teardown.\nEmpty hall.',
      subheading: 'The render survives in the archive. We start over.',
      caption: 'End of show',
    },
  ]

  return (
    <>
      {/* First-paint cinematic veil (session-gated) */}
      <IntroLoader />

      {/* Film grain — always on top */}
      <div className="grain-overlay" />

      {/* Custom cursor — OS-style arrow (idle) ↔ liquid-glass disc (hover) */}
      <div ref={cursorRef} className={`cursor state-${state}`} aria-hidden>
        {/* The arrow shape (visible in idle) — backdrop-blur glass clipped
            into an OS-cursor polygon; SVG draws the orange hairline outline */}
        <div className="cursor-arrow-glass" />
        <svg className="cursor-arrow-outline" viewBox="0 0 24 28">
          <path
            d="M 1 1 L 1 19 L 7 15 L 11 26 L 14 25 L 10 14 L 18 14 Z"
            fill="none"
            stroke="var(--reactor)"
            strokeWidth="1"
            strokeLinejoin="miter"
            strokeLinecap="square"
          />
        </svg>
        {/* The bigger glass disc (visible in hover) — anchored to cursor (0,0)
            and centred via transform translate(-50%, -50%) */}
        <div className="cursor-disc" />
      </div>

      {/* Top navigation */}
      <Nav />

      {/* Page sections in narrative order */}
      <Hero scrollProgress={scrollProgress} />
      <Manifesto />
      <Numbers />
      <ScrollChapters chapters={chapters} mouse={mouse} />
      <Process mouse={mouse} />
      <Disciplines />
      <Marquee />
      <Work />
      <Collaborations />
      <NowPlaying />
      <About />
      <Contact />
      <Footer />

      {/* Fixed bottom-right scroll-builds-brackets back-to-top widget */}
      <BackToTop />
    </>
  )
}

export default App
