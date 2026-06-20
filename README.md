# Mahbod Tavassoli — Portfolio

Portfolio site for a Tehran-based visual artist working in VFX, video mapping,
AI visual production, motion, and live-show visuals.

The homepage opens on a **scroll-triggered "camera turn"**: the title sits on a
lit studio room, the first scroll down locks the page and plays a camera-turn
video, and you land on a wall of CRT televisions — each screen a project.
Hovering a TV lights up its screen and pops a game-style info card; clicking
opens the case study. `/work` is the full archive; `/contact` is its own route.

## Stack

- **React 19** + **TypeScript** (strict) + **Vite 8**, with **React Compiler**
  lint rules (`eslint-plugin-react-hooks`).
- **CSS Modules** (`*.module.css`) — no Tailwind. OKLCH colour tokens with a
  `[data-theme]` light/dark switch in `src/index.css`.
- **framer-motion** for animation, **Lenis** for smooth scroll.
- **React Three Fiber / drei / rapier** for the 3D hanging notebook in About.
- Routing via **react-router-dom** (lazy routes in `src/routes/lazyRoutes.ts`).

## Scripts

| command | what it does |
|---|---|
| `npm run dev` | Vite dev server (HMR) at `localhost:5173` |
| `npm run build` | `tsc -b && vite build` — **the real type gate** (stricter than `tsc --noEmit`; always run before shipping) |
| `npm run build:static` | build, then prerender every route to static HTML (headless Chrome) for crawlers / social previews |
| `npm run lint` | ESLint |
| `npm run preview` | serve the production build locally |

`build:static` uses the system Chrome via `puppeteer-core` (`CHROME_PATH=...` to
override). Prerender reads slugs from `src/data/projects.ts` and skips any
project flagged `hidden`.

## Layout

```
src/
  App.tsx                  home composition (StudioRoom → Disciplines → Collaborations → NowPlaying → About → Footer)
  data/projects.ts         single source of truth for every project (+ VISIBLE_PROJECTS / FEATURED_PROJECTS)
  components/StudioRoom.*   scroll-turn room → TV-wall experience (the centrepiece)
  components/IntroLoader.*  first-load veil; fires `artemis:veil-lift` so StudioRoom plays its intro in the open
  routes/                  WorkIndex (/work), CaseStudy (/work/:slug), ContactPage, NotFoundPage
  hooks/useSmoothScroll    Lenis instance (+ getActiveLenis for scroll locking)
  hooks/useMouseInteraction custom cursor (ref/rAF driven — no per-move re-render)
public/
  room/                    scene-1*/scene-2/transition* — the StudioRoom videos
  work/<slug>/             poster.jpg (1080²), blur.jpg (24²), preview.mp4 (1080² · 7s),
                           video.mp4 (16:9 case study), tv.webm (VP9-alpha CRT clip, optional)
```

## Project data & assets

Each project is one object in `src/data/projects.ts`. Notable fields:

- `hidden: true` — drops it from `/work`, the counts, the sitemap, the prerender,
  and `FEATURED_PROJECTS`, while keeping the data so it can be re-enabled with one
  line (e.g. **U Bank** is parked this way).
- The TV wall is curated separately in `StudioRoom.tsx` via `TV_HOTSPOTS` (slug +
  on-screen % box) and `TV_VIDEOS` (slug → `/work/<slug>/tv.webm` alpha clip).

Heavy working media (`source-media/`, `blender/`, `*.zip`, `teaser.*`) is
git-ignored — only the web-ready assets under `public/` ship. See `DESIGN.md`
for the design system and `HANDOFF.md` for current working state.
