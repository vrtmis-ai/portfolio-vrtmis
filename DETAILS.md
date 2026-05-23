# DETAILS — Portfolio Deep Notes

> Companion to `HANDOFF.md`. Read both.
>
> HANDOFF covers **what the project is**.
> DETAILS covers **what's broken, what's fake, what was tried, what's hardcoded,
> what was deleted, and what a new session would miss without being told.**

---

## 1 · Full commit history (with context)

```
610c7a0  docs: HANDOFF.md for new-session continuity
f9220bf  cards: 1:1 square visual everywhere (home + /work) matching 1080² previews
12d5614  work: split files (preview.mp4 / video.mp4) + scroll-to-top + years +1
cc1af45  work: home shows 4 featured, /work index shows full 11-project archive
2f63754  media: integrate work videos + posters + horizon clip
ed02581  fix: sweep all white-hardcoded borders/dividers to theme tokens
721f44a  fix: light-mode surfaces + SplitText word-break
501385d  nav: route-aware home navigation + hash-scroll handler
41b92a1  work: case study pages (/work/:slug) + hover-preview + project data module
3b43aaa  feat: theme toggle (dark/light) + tighter horizon scroll further
a25de50  REVERT: 4 InlinePill placements — user rejected all four
f5720d7  preview: 4 InlinePill placements (Hero eyebrow, Disciplines, About, Contact)
69c5e00  REVERT: phase 4 inline typography pill in manifesto
a160ba1  REVERT: +98 typographic stamp pill
9aaaa56  manifesto: replace inline image pill with +98 stamp
19d3d05  phase 5: playwright smoke test
0d966df  phase 4: inline typography pill in manifesto (Made in [pill] Tehran)
78e8b22  phase 3: REMOVE cliche '→ Label' eyebrow arrows (gpt-taste sweep)
661f854  phase 2: SEO meta, OG, Twitter, canonical, Schema.org Person, favicon, single H1
6ec0630  phase 1: passive listeners + merge hooks + content-visibility + ternary
78af19b  snapshot: pre-skill-audit baseline (everything earlier was uncommitted)
```

The earliest weeks of work (icosahedron centerpiece, multiple Hero rewrites,
4 cursor revisions, BASEMENT-style nav adoption, scene system, etc.) all
landed in a single `78af19b` baseline. Run `git show 78af19b --stat` for the
file-by-file inventory at that point.

---

## 2 · Things that LOOK done but are placeholder

These render fine but the content is fabricated by me or pure mock. **The
user should review and replace.**

### Project `longDescription` and `tags` (data/projects.ts)

I wrote prose for every project's case-study page based on the CV + my
guesses. **Examples that may not be accurate:**

- *Alireza Ghorbani* — "Twelve projectors, forty thousand lumens, single-shot show"
- *Esteghlal* — "multi-projector synchronisation, on-site execution under tight crew constraints"
- *Carkook* — "Modeling, look-dev, lighting, compositing in a single hand"
- All `tags: [...]` arrays — I guessed every one

User should:
- Edit `src/data/projects.ts` and rewrite each `longDescription`
- Verify every `tags` array

### About narrative (`src/components/About.tsx`)

Three paragraphs in `II / IN HIS OWN WORDS` were written by me from
nothing. **The user did not say any of this:**

```
First job, 2018. A music video for a Tehran rapper. Greenscreen on a
borrowed laptop. The render took eight hours. I watched it loop and
somewhere in that loop I knew this was the work.

Ten years later the toolset has tripled and the deadlines have shrunk.
AI sits at my desk like a second pair of hands. The question stays the
same: can we make this real?

[pull quote] I don't fall in love with tools. I fall in love with what
they make possible.

The work moves between rooms. A render farm at three in the morning.
A stage at nine at night. A meeting at noon in a language that isn't
mine. The constant is the wall — there's always a wall somewhere
that's about to light up.
```

These read well but **may not reflect the user's actual story**. Review
and rewrite before launch.

### Timeline milestones (About.tsx)

The 6 milestones in `III / TRAJECTORY` (2015 first camera, 2018 intern at
Raimon Media, 2020 Particle Studio, 2023 Studio Serkan, 2024 solo,
"Now" Tehran→World) — these are derived from the CV but **dates have
been shifted +1** since the user said the CV dates were a year behind.
Verify each year is now correct.

### Manifesto

`Made in Tehran. / Built for everywhere. / The brief never matches the
room. / That is the work.` — **my copy, not the user's**. Strong, but
the user may want something else.

### NowPlaying

`src/components/NowPlaying.tsx` ships with this hardcoded:

```ts
title:  'Stage mapping for Eslami Theatre'
client: 'Mr. Parsaei · Theatre Project'
status: 'Pre-production'
week:   '21 / 2026'
detail: 'Designing the projection plan for a 3-act stage...'
```

**This is fictional**. Edit the constants in NowPlaying.tsx to reflect
actual current work, or hide the section if there isn't any.

### Numbers section

`Numbers.tsx` shows:
- **10+** YEARS · IN MOTION SINCE 2015
- **50+** PROJECTS · SHIPPED & ON-AIR
- **14** CLIENTS · BANKS · BRANDS · ARTISTS
- **6** DISCIPLINES · ONE HEAD, MANY HANDS

10+ years and 6 disciplines are real (from CV). **50+ projects and 14
clients are my approximations** — user should fact-check.

### Footer social links

```html
<a href="#" data-hover>Instagram ↗</a>
<a href="#" data-hover>Vimeo ↗</a>
<a href="#" data-hover>Behance ↗</a>
<a href="#" data-hover>LinkedIn ↗</a>
```

All four are `href="#"`. Replace with real URLs (or remove the column).

### ScrollChapters scenes

All 4 chapters in `App.tsx` are `type: 'placeholder'`. They show diagonal
stripes + `[ASSET PENDING]` text. Wait for the user to author:
- AI/Seedance images
- Blender GLB models
- Or video clips

Then change to `type: 'image' | 'video' | 'model3d'` + add `src`.

### Schema.org `sameAs`

In `index.html` JSON-LD:
```json
"sameAs": []
```

Empty. Should hold profile URLs (Instagram, Vimeo, Behance, LinkedIn,
GitHub if any). Fill once user provides them.

### Open Graph image

`og:image` points to `/og-cover.jpg` — **this file does not exist yet**.
Until created, social shares (Twitter, LinkedIn, Telegram) show a
broken image preview. Need to design a 1200×630 cover image at
`public/og-cover.jpg`.

---

## 3 · Known bugs / quirks

### Light-mode dark-only effects (intentional but worth knowing)

Several styles use raw `oklch(8% ...)` (always-dark) for elements designed
to look dark even in light mode. These stay dark — which is correct for
some (cursor drop-shadow, video overlay washes) but **may look wrong on
light backgrounds** in some cases:

| File | Line | Use | Light-mode behaviour |
|------|------|-----|----------------------|
| `Hero.module.css` | 24-25 | scanlines | Stays dark — fine, scanlines are subtle |
| `Hero.module.css` | 38-40 | bottom-fade overlay gradient | Stays dark — may darken hero edge weirdly in light mode |
| `BackToTop.module.css` | 23 | drop-shadow | Stays dark — fine, gives the widget weight |
| `Nav.module.css` | 29 | outer box-shadow | Stays dark — could be lighter in light mode |
| `SceneStage.module.css` | 44-45 | wash gradient | Stays dark — correct, scenes are dark-treated |
| `Work.module.css` | 306 | horizonCaption background | Always dark — readable in both modes since it's over media |
| `CaseStudy.module.css` | 90 | videoWrap fallback bg | Stays dark — OK, video covers it |
| `index.css` | 272 | cursor drop-shadow | Stays dark — correct |

**Audit needed**: open the site in light mode and check Hero / Nav for
weird dark edges. If any look out of place, convert to `var(--wash-soft)`
or similar.

### Lenis spring oscillation

`useSmoothScroll` uses `Lenis({ duration: 1.2 })`. After heavy scrolling
the spring can briefly oscillate by a sub-pixel — this is **visible on**:

- `BackToTop` brackets — strokeDashoffset jitters by 1-2 units
- Work horizontal scroll — final hold position can micro-twitch

Mitigation: increase damping. Currently `useSpring({ stiffness: 100,
damping: 28 })` — could bump damping to 35-40 if it ever feels off.

### Cursor on touchscreens

`@media (max-width: 768px)` hides the cursor and restores native pointer.
But mid-range tablets (820px-1024px) still get the custom cursor with
no real cursor input — feels inert. Consider widening the breakpoint
to `1024px` if the user reports this.

### IntroLoader replay

Gated by `sessionStorage['intro-played'] === '1'`. So:
- First load in a session → loader plays
- F5 / refresh → loader does NOT play (sessionStorage persists across reload)
- Close tab + reopen → loader plays again
- Dev mode HMR → loader does NOT replay

To force a replay during dev: `sessionStorage.removeItem('intro-played')`
in console.

### Cursor `data-cursor` leftover

`src/components/CTAButton.tsx:85` still has `data-cursor={cursor}` in the
button element. The `cursor` prop was removed from CTAButton's interface
earlier. This means `cursor` is `undefined`, the attribute renders empty.
**Harmless but stale**. Clean up: delete the `data-cursor` attribute from
CTAButton.tsx (search for `data-cursor={cursor}`).

### Conditional rendering not fully converted

`rendering-conditional-render` from vercel-react-best-practices says use
`cond ? <X /> : null` not `cond && <X />`. Phase 1 commit attempted this
but **wasn't exhaustive**. There are still `&&` conditionals in the
codebase that could be ternary-ified. Low priority; rarely causes issues.

### Bundle size warning

`npx vite build` warns:
```
(!) Some chunks are larger than 500 kB after minification.
```

Main chunk is ~1.4MB minified, ~390KB gzipped. Mostly:
- `framer-motion` (~150KB)
- `lenis` (~30KB)
- `react-router-dom` (~30KB)
- `react` + `react-dom` (~140KB)

Acceptable. To improve: code-split per route with `React.lazy(() =>
import('./routes/CaseStudy'))` in `main.tsx`. Not done.

### Process diagram path

`ProcessDiagram.tsx` takes `scrollProgress` prop but its computation of
node-activation thresholds assumes a uniform scroll across the section.
On very small viewports where the Process section becomes shorter
(responsive), some nodes may never reach their activation threshold —
visible only as the last node not fully igniting. **Not yet observed**.

### Card 3D tilt aggressiveness

Work cards use `±12deg` tilt at `perspective: 800px` — strong on desktop,
**may feel too aggressive on smaller laptops**. Consider scaling tilt by
viewport size. Or accept it as intentional.

---

## 4 · Zombie / unused code

These files exist but nothing imports them. They're safe to delete but
were kept in case they're useful later.

### `src/components/Reactor.tsx` + `Reactor.module.css`

The "crosshair beacon" widget that lived bottom-right before
`BackToTop.tsx` replaced it. **User asked it be removed** (commit message
was clear about this). Files weren't deleted, just unimported. Delete or
ignore.

```bash
rm src/components/Reactor.tsx src/components/Reactor.module.css
```

### `src/components/InlinePill.tsx`

Created during the 4-placement pill experiment (Hero eyebrow, Disciplines
title, About pull-quote, Contact CTA). **All four were rejected**. The
revert commit dropped the IMPORTS but I'm not 100% sure if the component
file itself was deleted. Run:

```bash
ls src/components/InlinePill*
```

If files exist, delete them. If they don't, fine.

### Sources/scenes folders

```
portfolio/public/scenes/    # empty — for future ScrollChapter assets
teaser-renderer/public/sources/  # 8s source clips for Remotion
                                  # ~30MB total, gitignored
```

The teaser-renderer sources folder is in `.gitignore`. Sources can be
regenerated from `media/` if lost.

---

## 5 · Hardcoded values worth knowing

### Paths

These are baked into scripts and will break on other machines:

```
ffmpeg:  C:/Users/Home/AppData/Local/Microsoft/WinGet/Packages/
           Gyan.FFmpeg_*/ffmpeg-8.1.1-full_build/bin/ffmpeg.exe

chrome:  C:\Program Files\Google\Chrome\Application\chrome.exe
         (used by teaser-renderer/remotion.config.ts AND render-all.mjs)

media:   C:/Users/Home/Desktop/porjects/media/
         (raw source MP4s, NOT in any git repo)
```

If you move machines, search-and-replace all three.

### Magic numbers in animations

```
Hero name font-size:        clamp(48px, 9vw, 150px)
Card tilt amount:           ±12deg
Card perspective:           800px
Work track final shift:     -50% (held from 0.85 → 1.0)
Work scrollContainer:       200vh
ScrollChapters FADE:        0.05 (5% crossfade window)
Cursor lerp factor:         0.2 (heavy)
Cursor sizes:               24×28 arrow, 72px disc (unused now)
BackToTop bracket thresholds: 0.05/0.25, 0.25/0.50, 0.50/0.75, 0.75/1.0
IntroLoader total:          1500ms
NowPlaying REC pulse:       opacity 0.6↔1, 3s ease-in-out
Theme token L%:             8% / 14% / 20% / 36% / 54% / 70% / 85% / 91% / 94%
                            (inverted in [data-theme="light"])
```

Tweak these if the user feels something is off.

---

## 6 · Reverted experiments (do NOT re-suggest unprompted)

The user said no to all of these:

| Experiment | Why rejected |
|-----------|--------------|
| Rotating chamfered 3D icosahedron (R3F + drei) | "doesn't represent me, has no character" |
| Glass-transmission distorted blob | Same — felt generic |
| R3F Scene + HeroObject components | Removed when 3D was dropped |
| Reactor crosshair widget bottom-right | "looks like a logo, I don't know what it is" |
| 4 inline pill placements (Hero / Disciplines / About / Contact) | "خوب درنمیاد ولش" |
| `+98` typographic stamp pill in Manifesto | Placement felt forced |
| VHS glitch effect on Hero name (RGB split) | "گلیچ رو دوس ندارم اصن" (3 times) |
| `scrollLine` opacity pulse animation | Caused peripheral flicker |
| `recBlink` 1.4s 0.25↔1 | Same flicker complaint |
| Film grain steps(1) animation | Jumps every 0.5s = perceived flicker |
| Cursor hover→disc state swap (text labels "VIEW / READ / DRAG") | "بدون متن" |
| Big BASEMENT-brutalist text overlays on teasers | "تکست های روش عوض میشه تند تند" |
| Anton + Schibsted Grotesk fonts | "اصن لیکوییدی نیست و قطوره" — switched to Syne |
| Glassmorphism in nav background as `rgba(0,0,0,0.6)` | Too opaque, switched to `var(--wash-soft)` |
| meta-label `→ Selected Work` style eyebrows | gpt-taste banned pattern, swept site-wide |

If considering any of these again: **CHECK WITH THE USER FIRST**.

---

## 7 · Things tried and KEPT (worth knowing)

- **OKLCH semantic tokens** with theme flip — works well
- **Light/dark theme toggle** — kept
- **Liquid-glass nav** with backdrop-blur(22px) — kept
- **Liquid-glass cursor (arrow)** with backdrop-blur(6px) — kept, no
  hover state swap per user
- **3D mouse-react tilt on cards** — kept, user wanted it stronger so it's
  at ±12°
- **Horizontal-scroll Work** with sticky-pin — kept
- **Magnetic CTA button** (±12px pull on cursor proximity) — kept
- **Multi-segment ffmpeg source extraction** for teasers — kept
- **Two-file media split** (preview.mp4 / video.mp4) — kept
- **REC dot soft pulse** (opacity 0.6↔1, 3s) — kept, calmer than original
- **Static grain texture** — kept, no animation
- **Single-line cycle Marquee** — kept

---

## 8 · Skill audit findings status

| Skill | Status | Notes |
|-------|--------|-------|
| impeccable (critique) | partially applied | 22/40 Nielsen baseline. Some priority issues fixed: color/border tokens, single H1, meta-labels removed. Others open: keyboard shortcuts, accessibility focus, persona walks |
| ui-ux-pro-max | applied | hover/touch/spacing rules followed |
| high-end-visual-design | applied | spring cubic-beziers, no gradient text, no glassmorphism overuse |
| gpt-taste | partially applied | meta-label sweep done. Font choice Syne (not in preferred list but allowed). 2-line H1 rule respected. Bento gridless — site uses different layout system |
| vercel-react-best-practices | applied | passive listeners, content-visibility, ternary conditionals, hooks merged |
| vercel-composition-patterns | mostly N/A | site doesn't have many boolean-prop components |
| seo-audit | Tier 2 applied (commit 661f854) | All 8 SEO fixes done: meta description, OG, Twitter card, canonical, Schema.org Person, favicon, single H1, robots+sitemap. Open: `og-cover.jpg` doesn't exist yet, `sameAs` is empty array |
| copywriting | partial | Strong voice on Hero/Manifesto/Contact. About narrative still fabricated |
| remotion + remotion-official | applied | Teaser pipeline built and rendered |
| webapp-testing | Playwright smoke test added (commit 19d3d05) | **Untested by user. Path: probably `tests/smoke.spec.ts` — confirm before relying on it** |

---

## 9 · Performance & resource numbers

### Bundle (after `npx vite build`)

```
dist/index.html          ~0.87 KB
dist/assets/index.css    ~16-18 KB (gzip ~4-5 KB)
dist/assets/index.js     ~1.4 MB (gzip ~390 KB)
```

### Media

```
Per project preview.mp4:  1.5-7.5 MB
Per project video.mp4:    6-22 MB (case study, with audio)
horizon.mp4:              1.3 MB
mt-logo.png:              3.7 KB

Total /public/work/:      ~150 MB (10 projects × avg 15 MB)
```

If hosting on Vercel free tier (100GB bandwidth/month), this is fine for
moderate traffic. If on a slower host, consider lazy-loading
`video.mp4` files (already lazy: `preload="none"`).

### Lighthouse estimate (untested)

- Performance: probably 75-90 (Lenis + heavy animation hurt)
- Accessibility: 85-95 (single H1 done, alt texts present, some focus
  rings might be missing)
- SEO: 95+ (full meta tag set)
- Best Practices: 95+

Run `npx lighthouse http://localhost:5173 --view` to verify.

---

## 10 · Component-by-component cheatsheet

What each file in `src/components/` actually does, with anything weird
worth knowing:

| File | Notes |
|------|-------|
| `Hero.tsx` | Title card. Has `scrollProgress` prop driven by Lenis. No 3D. Used to have a 3D blob (deleted) |
| `Hero.module.css` | Has dark-only scanlines + bottom-fade gradient — may need light-mode tweaking |
| `Manifesto.tsx` | Per-word scroll colour-in. Imports `useScroll`/`useTransform`. Words array hardcoded in file |
| `Numbers.tsx` | Counter widgets. `useInView` triggers ticks. **`+` colored separately** from digits |
| `ScrollChapters.tsx` | Stacked sticky scenes. 4 chapters defined in `App.tsx` (not here) |
| `SceneStage.tsx` | Generic chapter renderer. Supports type: image/video/model3d/placeholder |
| `Process.tsx` | Sticky-pin 2-column. Uses `useScroll` for diagram driver. **Mouse prop passed but only used by ProcessDiagram** |
| `ProcessDiagram.tsx` | SVG node-wire animation. Strokes use `currentColor` (inherits) + opacity attribute (not CSS opacity, SVG attr) |
| `Disciplines.tsx` | 6 cards with `--tilt-x/y` CSS vars. Cursor spotlight via `--mx/my` |
| `Marquee.tsx` | Two opposing scrolling text strips. Speed varies between strips |
| `Work.tsx` | Horizontal-scroll showcase. `HOME_PROJECTS = FEATURED_PROJECTS` (named for clarity) |
| `Collaborations.tsx` | Auto-fill 14-tile grid. Each tile gets cursor spotlight + ±3° tilt |
| `NowPlaying.tsx` | **All content hardcoded in file as constants**. Edit `NOW = { ... }` to update |
| `About.tsx` | 3 sections: Dossier (passport), Narrative (essay + pull quote), Timeline (6 milestones) |
| `Contact.tsx` | "Let's make / something / real." CTA + real email/phone/studio |
| `Footer.tsx` | 3 rows: wordmark+clock, 4 link columns, copyright strip. Live Tehran clock updates every minute |
| `Nav.tsx` | `SectionLink` chooses `<a href="#x">` on home vs `<Link to="/#x">` off-home. Logo always `Link to="/"` |
| `BackToTop.tsx` | Fixed bottom-right. 4 brackets draw at 25/50/75/100% scroll. `useScroll` from framer-motion |
| `IntroLoader.tsx` | First-paint veil. `AnimatePresence` exit. Gated by sessionStorage |
| `ThemeToggle.tsx` | Sun/moon icon. `useTheme` hook handles state + persistence |
| `ScrollToTopOnNavigate.tsx` | useEffect on `useLocation()`. Skips reset if hash is present |
| `SplitText.tsx` | Per-char animation, word-grouped to prevent mid-word wrap |
| `CTAButton.tsx` | Magnetic pull (±12px on cursor proximity). Has stale `data-cursor={cursor}` leftover |
| `HorizonMedia.tsx` | Auto-detects .mp4/.webm vs .gif/.jpg from extension. `loop` prop controls video |
| `Reactor.tsx` | **ZOMBIE — unused, can be deleted** |
| `InlinePill.tsx` | May or may not exist after pill experiment revert. Check before relying on it |

---

## 11 · Workflow gotchas

### Always typecheck before commit

```bash
npx tsc --noEmit
```

The tsconfig is strict. Common failures:
- Unused parameters (`noUnusedParameters: true`)
- Unused locals (`noUnusedLocals: true`)
- Missing types on event handlers

### Mixed shell environments

- **Bash (git-bash)**: for `find`, `grep`, `sed`, `ffmpeg`, file operations
- **PowerShell**: for `npx`, `npm`, anything that needs node path resolution
- Never `cd` between commands — use absolute paths

### LF/CRLF git warnings

Every commit shows ~10 warnings:
```
warning: in the working copy of 'X', LF will be replaced by CRLF
```

This is a **Windows-only quirk**. Files are stored with LF, working tree
gets CRLF. Harmless. To silence:

```bash
git config core.autocrlf true
```

### Re-rendering teasers

```bash
cd teaser-renderer
node render-all.mjs          # all 10 (skips alireza-ghorbani — no source)
```

Make sure the **previous render is fully done** before starting another.
A race condition can cause `video.mp4` to get overwritten by teaser
content. The script writes to `preview.mp4` (correct), but if you
manually run `npx remotion render` to `video.mp4` you'll trash the case
study video.

### Re-generating case study videos

```bash
bash portfolio/scripts/build-case-videos.sh
```

This writes to `video.mp4` (the 30s case study version). Safe — does not
touch `preview.mp4`.

### After moving source clips

If `media/` folder moves or renames, edit these files:
- `teaser-renderer/render-all.mjs`
- `portfolio/scripts/build-case-videos.sh`

Both have absolute paths.

---

## 12 · Hidden assumptions

1. **All projects have a source clip** EXCEPT `alireza-ghorbani`. The
   render scripts will silently skip slugs without source files.

2. **Card image aspect = preview clip aspect** (both 1:1). If you ever
   change the card CSS to non-square, the videos will letterbox or
   crop.

3. **`/work/<slug>` matches the folder name** in `public/work/<slug>/`.
   The slug in `data/projects.ts` MUST match. No mapping/translation.

4. **Years displayed in case study + home card** come from
   `project.year` directly. No formatting. So "2025" not "2025 –".

5. **Light theme is a token override only**. No layout or animation
   changes between themes. Means: ANY hard-coded color in CSS will
   stay constant across themes.

6. **Lenis controls the scroll position**. Manual `window.scrollTo`
   works but should be paired with `lenis.scrollTo` for smoothness
   (see `App.tsx` hash handler).

7. **MT logo is the favicon**. The PNG is ORANGE — Chrome / Safari
   render it small in the tab. May look like a blob. Consider an SVG
   version for crisper rendering.

8. **No backend, no analytics, no auth, no forms**. The Contact CTA
   is `mailto:` only.

9. **Bundle ships ALL routes** even when user is on home. There's no
   route-level code-split. Three.js was removed but it WOULD have
   added 400KB to the home bundle anyway.

10. **Site speaks ENGLISH**. The conversation with the user is in
    Persian but the **rendered site is monolingual English**.
    No RTL support, no Persian text on the visible site.

---

## 13 · For the next session: opening checklist

When you start fresh, do this in order:

1. `cd C:\Users\Home\Desktop\porjects\portfolio`
2. Read `HANDOFF.md` end-to-end
3. Read `DETAILS.md` (this file) end-to-end
4. `git log --oneline -10` — see recent direction
5. `npm run dev` and open `localhost:5173`
6. If user mentions a bug, search this file for the area first

If user asks something that this file or HANDOFF doesn't cover, **ask
clarifying questions** — don't assume.

---

## 14 · Open work the user might ask about

In rough priority order:

1. **Alireza Ghorbani video** — user has files elsewhere, will provide
2. **og-cover.jpg** at 1200×630 — for social sharing
3. **`sameAs` array** — fill with Instagram/Vimeo/Behance/LinkedIn URLs
4. **Footer social links** — same URLs, replace `href="#"`
5. **NowPlaying content** — replace fictional Eslami Theatre entry
6. **ScrollChapters assets** — AI/video clips for the 4 placeholder chapters
7. **About narrative review** — user should rewrite the fabricated paragraphs
8. **Project longDescriptions review** — fact-check or rewrite
9. **Cleanup zombie files** — Reactor.tsx, possibly InlinePill.tsx
10. **CTAButton stale `data-cursor`** — remove the attribute on line 85
11. **Light-mode polish** — verify Hero scanlines, Nav shadow in light mode
12. **Lighthouse audit** — confirm SEO/perf/a11y scores
13. **Cursor breakpoint widening** — tablets in 768-1024px range
14. **Smoke test verification** — confirm Playwright test still runs
15. **Per-route code-split** — `React.lazy` on case-study and work-index
    if bundle size becomes an issue

---

## 15 · One-paragraph dump

A Vite+React 18 portfolio with strict TypeScript, OKLCH light/dark themes,
Lenis smooth scroll, framer-motion animation, 3 routes (home / work index /
case study), 11 projects with Remotion-rendered 7-second 1080² brutalist
preview teasers on card hover and 30-second 1080p case study videos with
audio, a session-gated intro veil, a fixed corner back-to-top widget that
draws orange brackets as you scroll, a liquid-glass arrow cursor, a
horizontal-scroll featured work section, a sticky-pin process section
with SVG node-wire diagram, light-mode-respecting token system across 12+
component CSS files. Most content (`longDescription`, about narrative,
NowPlaying widget, Numbers totals) is **fabricated by me — needs user
review**. SEO is in place but `og-cover.jpg` doesn't exist yet. Zombie
files exist (`Reactor.tsx`). One open user dependency (Alireza Ghorbani
video files).
