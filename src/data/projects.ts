/**
 * PROJECTS — single source of truth for all work cards + case study pages.
 *
 * Imported by:
 *   - Work.tsx        renders the horizontal-scroll card grid
 *   - CaseStudy.tsx   renders /work/<slug> detail pages
 *
 * Files for each project live at:
 *   /public/work/<slug>/poster.jpg      visible on the card
 *   /public/work/<slug>/video.mp4       plays on hover (muted preview) and
 *                                       plays full on the case study page
 *   /public/work/<slug>/gallery/*.jpg   optional stills (extension photos)
 */

export interface Project {
  /** URL-safe slug — used in /work/<slug> and as folder name */
  slug: string
  /** True for the 4 hero projects shown in the home-page horizontal scroll.
   *  All projects (featured or not) appear on the /work index page. */
  featured?: boolean
  /** Card number — "01", "02", ... */
  id: string
  /** Display title — may contain \n for line breaks on the card */
  title: string
  /** Single-line title for the case-study hero (no line breaks) */
  caseStudyTitle: string
  /** Client / venue */
  client: string
  /** Discipline tag */
  category: string
  /** Year */
  year: string
  /** Short description shown on the card */
  description: string
  /** Long-form story for the case-study page (multiple paragraphs OK) */
  longDescription: string
  /** Fallback colour for the card when no poster image is present yet */
  accent: string
  /** Meta tags shown on the case-study page */
  tags: string[]
}

export const PROJECTS: Project[] = [
  {
    slug: 'alireza-ghorbani',
    featured: true,
    id: '01',
    title: 'Alireza\nGhorbani',
    caseStudyTitle: 'Alireza Ghorbani — Live Concert',
    client: 'Live Concert',
    category: 'Architectural Mapping',
    year: '2024',
    description: 'Large-scale architectural video mapping for major live concert.',
    longDescription:
      'Architectural video mapping for one of Iran\'s most prominent live concert productions. Concept, animation, on-site execution. Twelve projectors, forty thousand lumens, single-shot show.',
    accent: '#ff3d00',
    tags: ['Resolume', 'Concept', 'On-site', 'Live'],
  },
  {
    slug: 'oliver-twist',
    featured: true,
    id: '02',
    title: 'Oliver\nTwist',
    caseStudyTitle: 'Oliver Twist — Theatre',
    client: 'Mr. Parsaei · Theatre',
    category: 'AI Teaser + Stage Mapping',
    year: '2024',
    description: 'AI-generated teaser combined with live stage mapping for theatre production.',
    longDescription:
      'A two-part visual brief for a theatre production directed by Mr. Parsaei. Part one: an AI-generated teaser combining traditional compositing with generative passes. Part two: real-time stage projection mapping integrated with the live performance.',
    accent: '#3d5aff',
    tags: ['AI Pipeline', 'ComfyUI', 'Theatre', 'Mapping'],
  },
  {
    slug: 'my-baby',
    id: '03',
    title: 'My\nBaby',
    caseStudyTitle: 'My Baby — Product Launch',
    client: 'Product Launch',
    category: 'Architectural Mapping',
    year: '2024',
    description: 'Architectural video mapping for live product launch event.',
    longDescription:
      'Architectural video mapping for a live product launch event. Brand-driven visual narrative on the venue\'s exterior. Concept design, animation, and on-site cueing through Resolume Arena.',
    accent: '#ffffff',
    tags: ['Brand', 'Live Event', 'Resolume'],
  },
  {
    slug: 'tehran-univ-of-art',
    featured: true,
    id: '04',
    title: 'Tehran\nUniv. of Art',
    caseStudyTitle: 'Tehran University of Art — Student Day',
    client: 'Student Day',
    category: 'Video Mapping · Workshop',
    year: '2023',
    description: '1,000+ audience · 48hr delivery · Free workshop on real-time visual systems.',
    longDescription:
      'A single-day visual installation for Tehran University of Art\'s Student Day. One thousand attendees, forty-eight hours from brief to first cue. Paired with a free public workshop on real-time visual systems.',
    accent: '#ffb300',
    tags: ['Workshop', 'Live', '48hr Delivery'],
  },
  {
    slug: 'music-video-vfx',
    featured: true,
    id: '05',
    title: 'Music\nVideo VFX',
    caseStudyTitle: 'Music Video VFX — Multi-artist',
    client: 'Various',
    category: 'Greenscreen · CGI · AI',
    year: '2023',
    description: 'Greenscreen compositing, CGI integration, and AI visual pipeline.',
    longDescription:
      'A series of music videos for Tehran-based artists. Greenscreen compositing, CGI integration, and a generative AI pipeline for environment extension. Worked across After Effects, ComfyUI, and Houdini.',
    accent: '#a0ff00',
    tags: ['VFX', 'AI', 'Greenscreen', 'CGI'],
  },
  {
    slug: 'esteghlal',
    id: '06',
    title: 'Esteghlal',
    caseStudyTitle: 'Esteghlal — Stadium Mapping',
    client: 'Esteghlal F.C.',
    category: 'Architectural Mapping',
    year: '2024',
    description: 'Stadium-scale architectural video mapping for a major sport event.',
    longDescription:
      'Large-format architectural video mapping for an Esteghlal football club event. Concept, animation, multi-projector synchronisation, on-site execution under tight crew constraints.',
    accent: '#2563eb',
    tags: ['Stadium', 'Resolume', 'Live', 'Multi-projector'],
  },
  {
    slug: 'tigard',
    id: '07',
    title: 'Tigard\nEvent',
    caseStudyTitle: 'Tigard — Event Mapping',
    client: 'Tigard',
    category: 'Video Mapping',
    year: '2024',
    description: 'Architectural mapping for a live brand event.',
    longDescription:
      'Single-night video mapping installation for a Tigard live event. Brand-driven motion choreographed to the venue\'s architecture, cued live through Resolume.',
    accent: '#f59e0b',
    tags: ['Live Event', 'Mapping', 'Brand'],
  },
  {
    slug: 'u-bank',
    id: '08',
    title: 'U Bank',
    caseStudyTitle: 'U Bank — Brand Campaign VFX',
    client: 'U Bank',
    category: 'VFX & Compositing',
    year: '2024',
    description: 'VFX compositing and motion design for U Bank brand campaign.',
    longDescription:
      'Full VFX and compositing pass for U Bank\'s brand campaign series. Greenscreen integration, environment extension, and motion graphics across multiple spots.',
    accent: '#0ea5e9',
    tags: ['Campaign', 'Compositing', 'Motion'],
  },
  {
    slug: 'cgi-carkook',
    id: '09',
    title: 'CGI\nCarkook',
    caseStudyTitle: 'Carkook — CGI Integration',
    client: 'Carkook',
    category: 'CGI · VFX',
    year: '2024',
    description: 'CGI product visualization with live-action integration.',
    longDescription:
      'Full CGI product visualization for Carkook with photoreal integration into live-action plates. Modeling, look-dev, lighting, compositing in a single hand.',
    accent: '#e11d48',
    tags: ['CGI', 'Product', 'Photoreal'],
  },
  {
    slug: 'serkan-filter',
    id: '10',
    title: 'Serkan\nFilter',
    caseStudyTitle: 'Serkan Filter — Filimo Teaser',
    client: 'Serkan · Filimo',
    category: 'Ad Roll · Compositing',
    year: '2024',
    description: 'Ad roll and teaser VFX for the Serkan Filter Filimo series.',
    longDescription:
      'Ad-roll and teaser package for the Serkan Filter Filimo series. Brand-aligned color treatment, VFX compositing, and short-form delivery cuts.',
    accent: '#84cc16',
    tags: ['Ad Roll', 'Filimo', 'Teaser'],
  },
  {
    slug: 'fashion-documentary',
    id: '11',
    title: 'Fashion\nDocumentary',
    caseStudyTitle: 'Fashion Documentary — Intro',
    client: 'Documentary Production',
    category: 'Editing · Title Design',
    year: '2023',
    description: 'Title sequence and intro edit for a fashion documentary.',
    longDescription:
      'Intro sequence and title design for a long-form fashion documentary. Color, rhythm, and motion-typography choreographed to the music bed.',
    accent: '#f97316',
    tags: ['Editing', 'Titles', 'Documentary'],
  },
]

/** Lookup helper used by /work/<slug> routes */
export function getProject(slug: string | undefined): Project | undefined {
  if (!slug) return undefined
  return PROJECTS.find(p => p.slug === slug)
}

/** Featured subset — shown in the home-page horizontal Work section.
 *  All others remain visible on the /work index page. */
export const FEATURED_PROJECTS = PROJECTS.filter(p => p.featured)

