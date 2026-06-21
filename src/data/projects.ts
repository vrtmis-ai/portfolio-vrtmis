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
  /** Hide from the site (kept in the data so it can be re-enabled later by
   *  flipping this off). Excluded from the /work index, counts, and featured. */
  hidden?: boolean
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
    slug: 'green-pay',
    featured: true,
    id: '12',
    title: 'Green\nPay',
    caseStudyTitle: 'Green Pay · Animated Spot',
    client: 'Green Pay',
    category: 'AI Animation · Spot',
    year: '2025',
    description: 'A solo, end-to-end AI-animated spot for Green Pay.',
    longDescription:
      'A claymation-look animated spot for Green Pay, produced solo from end to end. I generated the characters and sets, animated the shots, composited and finished the look, and cut the edit and sound — the whole pipeline in one hand. Built with Higgsfield, Kling, and Seedance, finished in After Effects.',
    accent: '#22c55e',
    tags: ['AI Animation', 'Solo Production', 'Higgsfield', 'Kling', 'After Effects'],
  },
  {
    slug: 'alireza-ghorbani',
    featured: true,
    id: '01',
    hidden: true, // removed from the site on request — data kept to re-enable later
    title: 'Alireza\nGhorbani',
    caseStudyTitle: 'Alireza Ghorbani · Concert Tour',
    client: 'Concert Tour',
    category: 'Concert Visuals',
    year: '2025 – Present',
    description: 'Stage mapping animation for a live concert tour.',
    longDescription:
      'Stage visuals for Alireza Ghorbani\'s touring concert — on the road since 2025 and still running. As part of the visual team I built the mapping animation: motion designed to wrap the stage and run live as projection across the show. Made in After Effects and TouchDesigner, with AI-assisted generative passes through ComfyUI.',
    accent: '#ff3d00',
    tags: ['Concert Tour', 'Mapping Animation', 'After Effects', 'TouchDesigner', 'ComfyUI'],
  },
  {
    slug: 'oliver-twist',
    featured: true,
    id: '02',
    title: 'Oliver\nTwist',
    caseStudyTitle: 'Oliver Twist · Theatre',
    client: 'Mr. Parsaei · Theatre',
    category: 'AI Video Production',
    year: '2025',
    description: 'Weekly AI teasers and the opening intro for a stage production.',
    longDescription:
      'An all-AI visual package for Mr. Parsaei\'s staging of Oliver Twist. A fresh teaser was generated each week to drive ticket sales, alongside the opening intro that played at the top of the show. As AI visual team supervisor I ran the pipeline across Higgsfield, Seedance, Kling, and a custom-trained character model. Staged at the Enghelab Tennis Club Stadium in autumn 2025, ticketed through Irantic and sponsored by Elgado Coffee — the teasers reached over 70,000 viewers.',
    accent: '#3d5aff',
    tags: ['AI Video', 'Higgsfield', 'Seedance', 'Kling', 'Character Training'],
  },
  {
    slug: 'my-baby',
    id: '03',
    title: 'My\nBaby',
    caseStudyTitle: 'My Baby · Product Launch',
    client: 'Brand Launch',
    category: 'Brand Launch Visuals',
    year: '2025',
    description: 'Facade mapping visuals for a brand\'s product launch.',
    longDescription:
      'Projection-mapping visuals for a new product launch, staged on the facade of a mansion. As part of the visual team I built the mapping content — AI-assisted passes composited and animated in After Effects, then mapped to the building for the live reveal.',
    accent: '#ffffff',
    tags: ['Brand Launch', 'Facade Mapping', 'AI Visuals', 'After Effects'],
  },
  {
    slug: 'tehran-univ-of-art',
    featured: true,
    id: '04',
    title: 'Tehran\nUniv. of Art',
    caseStudyTitle: 'Tehran University of Art · Student Day',
    client: 'Student Day',
    category: 'Video Mapping · Workshop',
    year: '2024',
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
    caseStudyTitle: 'Sahar Sorori · Music Video VFX',
    client: 'Sahar Sorori',
    category: 'Greenscreen · CGI · AI',
    year: '2024',
    description: 'VFX direction for Sahar Sorori\'s parallel-worlds music video.',
    longDescription:
      'Music video for singer Sahar Sorori, where I directed the VFX from set through post. It runs on a parallel-worlds idea: two mirror characters — a white figure who sings, a black figure who hunts her across the cut — pulled toward each other for the length of the track. When they finally meet and touch, the contact destroys them both. Built with greenscreen compositing, a generative-AI pipeline for the environments, and CGI integration — including a LiDAR scan of the singer\'s face used to turn her into a stone statue. Made across After Effects and ComfyUI, with Luma capture and Kling, Seedance, and Higgsfield driving the generative shots.',
    accent: '#a0ff00',
    tags: ['VFX Direction', 'Greenscreen', 'AI', 'CGI', 'LiDAR'],
  },
  {
    slug: 'esteghlal',
    id: '06',
    title: 'Esteghlal',
    caseStudyTitle: 'Esteghlal · 80th Anniversary',
    client: 'Esteghlal F.C.',
    category: 'Event Mapping',
    year: '2025',
    description: '80th-anniversary mapping for Esteghlal F.C., projected across a hall\'s interior walls.',
    longDescription:
      'Video mapping for Esteghlal F.C.\'s 80th-anniversary celebration — a private ceremony held inside a hall, projected across its interior walls. The show ran through the club\'s honours and history under an epic narration. I worked as the motion artist on the mapping content, animated in After Effects.',
    accent: '#2563eb',
    tags: ['80th Anniversary', 'Video Mapping', 'After Effects', 'Motion'],
  },
  {
    slug: 'tigard',
    id: '07',
    title: 'Tigard\nEvent',
    caseStudyTitle: 'Tigard · Iran Mall Auto Show',
    client: 'Tigard',
    category: 'Exhibition Mapping',
    year: '2025',
    description: 'Six-wall projection content for Tigard at the Iran Mall auto show.',
    longDescription:
      'Visual content for Tigard at the Iran Mall auto show — a six-wall projection installation across the exhibition space. On the visual team, I built mapping content that wove the brand and logo through abstract, environmental motion, generated with Higgsfield, Kling, and Wan and finished in After Effects. The teaser shown here is one of the six walls.',
    accent: '#f59e0b',
    tags: ['Iran Mall', 'Exhibition Mapping', 'AI', 'After Effects'],
  },
  {
    slug: 'u-bank',
    id: '08',
    hidden: true, // temporarily hidden — real case-study content to be added later
    title: 'U Bank',
    caseStudyTitle: 'U Bank · Brand Campaign VFX',
    client: 'U Bank',
    category: 'VFX & Compositing',
    year: '2022',
    description: 'VFX compositing and colour work for a U Bank brand campaign.',
    longDescription:
      'VFX compositing and colour correction across a U Bank brand campaign, built in After Effects.',
    accent: '#0ea5e9',
    tags: ['Campaign', 'Compositing', 'Colour'],
  },
  {
    slug: 'cgi-carkook',
    id: '09',
    title: 'CGI\nCarkook',
    caseStudyTitle: 'Carkook · CGI Integration',
    client: 'Carkook',
    category: 'CGI · VFX',
    year: '2022',
    description: 'Full-CGI integration composited photoreal into live action for Carkook.',
    longDescription:
      'Full-CGI integration for Carkook. As the CGI artist I handled the camera tracking, lighting and rendering, and photoreal compositing — sitting the CG into live-action plates so it reads as part of the real shot. Built in Cinema 4D and finished in After Effects and Nuke.',
    accent: '#e11d48',
    tags: ['CGI', 'Tracking', 'Lighting', 'Compositing'],
  },
  {
    slug: 'serkan-filter',
    id: '10',
    title: 'Serkan\nFilter',
    caseStudyTitle: 'Serkan Filter · Filimo Teaser',
    client: 'Serkan · Filimo',
    category: 'Teaser · Edit · VFX',
    year: '2022',
    description: 'Teaser edit, VFX, colour, and titles for the Filimo series Serkan Filter.',
    longDescription:
      'Teaser and ad-roll package for the Filimo series Serkan Filter. I worked as editor and VFX artist — cutting the short-form teaser, compositing the VFX, grading the colour, and building the motion and titles. Made in After Effects and Premiere.',
    accent: '#84cc16',
    tags: ['Teaser', 'Edit', 'VFX', 'Filimo'],
  },
  {
    slug: 'fashion-documentary',
    id: '11',
    title: 'Fashion\nDocumentary',
    caseStudyTitle: 'Fashion Documentary · Colour & Edit',
    client: 'Documentary Production',
    category: 'Colour · Edit · Titles',
    year: '2023',
    description: 'Colour grading, editing, and title design for a long-form fashion documentary.',
    longDescription:
      'Colour grading, editing, and title design for a long-form fashion documentary. I graded the picture, shaped the edit, and designed the intro titles — tuning rhythm and tone to the music. Made in After Effects and Premiere.',
    accent: '#f97316',
    tags: ['Colour', 'Editing', 'Titles', 'Documentary'],
  },
]

/** Lookup helper used by /work/<slug> routes */
export function getProject(slug: string | undefined): Project | undefined {
  if (!slug) return undefined
  return PROJECTS.find(p => p.slug === slug)
}

/** Everything shown on the site — drops projects flagged `hidden`. Use this
 *  (not raw PROJECTS) for the /work index, counts, and category lists. */
export const VISIBLE_PROJECTS = PROJECTS.filter(p => !p.hidden)

/** Featured subset — shown in the home-page horizontal Work section.
 *  All others remain visible on the /work index page. */
export const FEATURED_PROJECTS = PROJECTS.filter(p => p.featured && !p.hidden)

