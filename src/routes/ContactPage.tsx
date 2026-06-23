import { Nav } from '../components/Nav'
import { Footer } from '../components/Footer'
import { Contact } from '../components/Contact'
import { useSmoothScroll } from '../hooks/useSmoothScroll'
import { useMouseInteraction } from '../hooks/useMouseInteraction'

/**
 * ContactPage — /contact
 *
 * Contact is its own destination (the hero "Let's talk" CTA and the nav both
 * land here) rather than a section you scroll to. Reuses the Contact block as
 * the page body, with the shared Nav, Footer, cursor and grain so it feels
 * identical to the rest of the site.
 */
export function ContactPage() {
  useSmoothScroll()
  const { cursorRef, state } = useMouseInteraction()

  return (
    <>
      <title>Contact · Mahbod Tavassoli</title>
      <meta
        name="description"
        content="Get in touch with Mahbod Tavassoli — VFX, video mapping, and AI visual production for live shows, film, and brands."
      />
      <meta property="og:title" content="Contact · Mahbod Tavassoli" />
      <meta property="og:url" content="https://vrtmis.ir/contact" />
      <meta property="og:image" content="https://vrtmis.ir/og-cover.jpg" />
      <link rel="canonical" href="https://vrtmis.ir/contact" />

      <div ref={cursorRef} className={`cursor state-${state}`} aria-hidden>
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
        <div className="cursor-disc" />
      </div>
      <div className="grain-overlay" />

      <Nav />
      <main id="main">
        <Contact />
      </main>
      <Footer />
    </>
  )
}
