import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Nav } from './components/Nav'
import { IntroLoader } from './components/IntroLoader'
// import { Manifesto } from './components/Manifesto'       // removed — user feedback: content overload
// import { Numbers } from './components/Numbers'            // removed — stats were inaccurate
// import { ScrollChapters } from './components/ScrollChapters'  // removed — will be replaced with scroll-driven video
// import { Process } from './components/Process'               // removed — user feedback: redundant with About
import { StudioRoom } from './components/StudioRoom'
import { MobileStudio } from './components/MobileStudio'
import { Disciplines } from './components/Disciplines'
import { About } from './components/About'
import { Collaborations } from './components/Collaborations'
import { NowPlaying } from './components/NowPlaying'
import { Footer } from './components/Footer'
import { BackToTop } from './components/BackToTop'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useMouseInteraction } from './hooks/useMouseInteraction'
import { useIsMobile } from './hooks/useIsMobile'

/**
 * Page composition — Studio Floor narrative order.
 *
 *   1.  StudioRoom      — the opening: the title sits on the lit studio room,
 *                         then the scroll turns the camera to the TV-wall gallery.
 *   2.  Disciplines     — 6 skill cards with 3D tilt on hover.
 *   3.  Collaborations  — "Trusted by" client-name marquee.
 *   4.  NowPlaying      — what I'm working on this week.
 *   5.  About           — bio + fact sheet + 3D notebook.
 *   6.  Footer          — wrap.
 *
 * Contact is its own route (/contact), reached from the hero "Let's talk" CTA
 * and the nav — not a scroll-to section. The old horizontal-scroll Work section
 * is retired; StudioRoom's TV wall is the project gallery.
 */
function App() {
  const { lenis } = useSmoothScroll()
  // Single hook drives the custom cursor (+ parallax mouse position for future scroll-video).
  // One global mousemove listener (passive).
  const { cursorRef, state } = useMouseInteraction()
  // Phones get a dedicated touch home instead of the pointer-driven StudioRoom.
  const isMobile = useIsMobile()

  /**
   * Hash-aware scrolling.
   *
   * When the user lands on the home route with a hash (e.g. /#work, after
   * clicking a nav link from a case-study page), browsers can't auto-scroll
   * because Lenis owns the scroll position. We manually scroll to the
   * matching element once the section has mounted.
   */
  const location = useLocation()
  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.slice(1)
    // Defer to next tick so the target section is in the DOM
    const timer = window.setTimeout(() => {
      const el = document.getElementById(id)
      if (!el) return
      if (lenis.current) {
        lenis.current.scrollTo(el, { offset: -80 })  // clear the fixed nav
      } else {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }, 80)
    return () => window.clearTimeout(timer)
  }, [location.hash, lenis])

  return (
    <>
      {/* Home page-level SEO — React 19 hoists these into <head>; the prerender
          step bakes them into the static dist/index.html for crawlers. */}
      <title>Mahbod Tavassoli — Visual Artist &amp; AI Creative · Tehran</title>
      <meta
        name="description"
        content="Tehran-based visual artist working in VFX, video mapping, AI visual production, motion graphics, and live show visuals. Ten years of building images that didn't exist before."
      />
      <link rel="canonical" href="https://vrtmis.ir/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://vrtmis.ir/" />
      <meta property="og:title" content="Mahbod Tavassoli — Visual Artist & AI Creative" />
      <meta
        property="og:description"
        content="Tehran-based visual artist. VFX, video mapping, AI visual production, motion, live show visuals. Ten years of building images that didn't exist before."
      />
      <meta property="og:image" content="https://vrtmis.ir/og-cover.jpg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content="artemis.studio" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Mahbod Tavassoli — Visual Artist & AI Creative" />
      <meta
        name="twitter:description"
        content="Tehran-based visual artist. VFX, video mapping, AI production, live show visuals. Ten years of building images that didn't exist before."
      />
      <meta name="twitter:image" content="https://vrtmis.ir/og-cover.jpg" />

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
        {/* Pointing hand (visible on hover over links / TVs / the notebook) —
            same orange hairline language as the arrow, so it stays ONE cursor */}
        <svg className="cursor-hand" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5M11 11.5v-2a1.5 1.5 0 0 1 3 0v2.5M14 10.5a1.5 1.5 0 0 1 3 0v1.5M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1 -6 6h-2a6 6 0 0 1 -5 -2.7c-.2-.3-1.4-2.4-3.3-5.7a1.5 1.5 0 0 1 .5-2 1.9 1.9 0 0 1 2.3.3l1.5 1.5"
            stroke="var(--reactor)"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* The bigger glass disc — legacy hover treatment, kept hidden */}
        <div className="cursor-disc" />
      </div>

      {/* Top navigation */}
      <Nav />

      {/* Page sections in narrative order. <main id="main"> is the
          skip-link target and the page's landmark for assistive tech. */}
      <main id="main">
        {/* #top anchor for the footer / back-to-top links (the Hero used to
            own this id; the studio room is now the opening). */}
        <span id="top" aria-hidden />
        {/* StudioRoom is the desktop opening (scroll-turn into the TV wall);
            phones get MobileStudio (a touch hero + tappable work grid). */}
        {isMobile ? <MobileStudio /> : <StudioRoom />}
        <Disciplines />
        <Collaborations />
        <NowPlaying />
        <About />
      </main>
      <Footer />

      {/* Fixed bottom-right scroll-builds-brackets back-to-top widget */}
      <BackToTop />
    </>
  )
}

export default App
