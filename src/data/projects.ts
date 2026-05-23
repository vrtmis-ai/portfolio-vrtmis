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
]

/** Lookup helper used by /work/<slug> routes */
export function getProject(slug: string | undefined): Project | undefined {
  if (!slug) return undefined
  return PROJECTS.find(p => p.slug === slug)
}
