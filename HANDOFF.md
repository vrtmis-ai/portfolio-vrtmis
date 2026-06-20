# HANDOFF — working state

_Last updated: 2026-06-20. Snapshot for picking the project back up in a new
session. The codebase is the source of truth; verify anything here against it._

## Status

Functionally **deploy-ready**: `npm run build` is green, no console errors on a
fresh load, all routes render, assets resolve. Nothing is committed yet (see
Pending). Dev server: `npm run dev` → `localhost:5173`.

## ⏳ Pending (do these next)

1. **Git commit + push — THE immediate next task.** The user is creating an
   **empty, public** GitHub repo:
   **`https://github.com/vrtmis-ai/portfolio-vrtmis`** (no README/.gitignore/
   license — so the local repo pushes clean). Once it exists:
   - `git remote add origin https://github.com/vrtmis-ai/portfolio-vrtmis.git`
   - rename the branch: local is on **`master`**, push as **`main`**
     (`git branch -M main`).
   - `git add -A` then one clean commit, then `git push -u origin main`.
   - `.gitignore` already excludes the heavy clutter (`source-media/` ~1.7 GB,
     `blender/`, `*.zip`, `teaser.*`, `record-teaser.mjs`, `.claude/`, `.agents/`).
     The ~180 MB of web video under `public/work/` **does** ship (see Hosting).
   - **Auth:** `gh` is NOT installed; push runs from the user's machine. If it
     prompts, GitHub needs a **Personal Access Token** (not a password) over
     HTTPS, or SSH. Walk the user through a PAT if it asks.
2. **Hosting / media — free, no budget.** The user has no funds for a CDN right
   now, so **videos stay in the repo** (the current ~30 s compressed versions)
   and the site deploys on a **free host** — **GitHub Pages** is the pick (the
   repo is public, no card, already on GitHub). Note Pages needs an SPA fallback
   (`404.html` ≈ `index.html`) for client-side routes; `build:static` prerenders
   the known routes. **Later, when there's budget:** move the heavy
   `public/work/*/video.mp4` to **Liara Object Storage** (Rial, S3-compatible) or
   Cloudflare R2 — add an optional `videoUrl` field to `projects.ts` and make
   `CaseStudy` use `project.videoUrl ?? '/work/<slug>/video.mp4'`; one line per
   video, no rework. (`source-media/` masters stay local + backed up; never
   committed.)
## Notes (not blocking)

- **TV wall is complete** — all 7 screens (green-pay, oliver-twist,
  tehran-univ-of-art, music-video-vfx, esteghlal, tigard, serkan-filter) have a
  VP9-alpha `tv.webm` clip and light up on hover. `fashion-documentary` is
  archive-only (off the wall). To add another: drop `tv.webm` in the folder and
  add the slug to `TV_VIDEOS` in `StudioRoom.tsx`.
- **Scene quality:** the room/wall/transition clips are web-compressed from
  higher-bitrate sources (some softness vs source). User **accepted this as-is**;
  a CSS `filter: saturate(1.34) contrast(1.12) brightness(1.02)` on `.sceneImg`/
  `.transitionVid` (StudioRoom.module.css) restores the punch. Re-encoding from
  `source-media/` (CRF 18 + `bt709` tags) is the "proper" fix if ever wanted.

## What this session changed

- **Project descriptions 04–11** rewritten from the user's real info; placeholder
  tags removed. **Green Pay** added (id 12, leads `/work`, on the wall) with media
  built from source. **U Bank** parked via `hidden: true`.
- **TV wall hover videos** re-activated: per-TV VP9-alpha `tv.webm` clips that
  light up only their CRT. `TV_HOTSPOTS` + `TV_VIDEOS` in `StudioRoom.tsx`.
  Current wall (7 TVs): green-pay, oliver-twist, tehran-univ-of-art,
  music-video-vfx, esteghlal, tigard, serkan-filter — all with a clip.
- **Perf fixes (the reported lag):** `useMouseInteraction` no longer `setState`s
  on every mousemove (it re-rendered the whole page; the value was unused). The
  TV info card is now positioned via a ref + rAF, not state. `tvOn` flicker is
  brightness/opacity only (no transform → multi-TV stays pixel-aligned).
- **Intro/veil fix:** StudioRoom mounts/plays its intro only on the
  `artemis:veil-lift` event from IntroLoader, so it isn't played unseen under the
  first-load veil. `scene-1-dark.jpg` is preloaded in `index.html`.
- **Camera turn:** scroll-locked playback (`transition.mp4`) + smooth reverse
  (`transition-reverse.mp4`) on scroll-up; momentum killed on unlock so reverse
  triggers right away.
- Stale `DETAILS.md`/old `HANDOFF.md` deleted; `README.md` rewritten.

## Gotchas

- **Verify with `npm run build`, not `tsc --noEmit`** — the project-reference
  build is stricter and catches errors the editor tsc misses.
- **Test first-load behaviour with a clean session:** `sessionStorage.clear()`
  (or a private window) then hard-reload — the IntroLoader veil is session-gated,
  so repeated reloads skip it and hide intro bugs.
- **HMR false alarms:** editing a hook's signature mid-session can throw
  "change in order of Hooks" / "deps array changed size" in the console. These
  are hot-reload artifacts — confirm by restarting the dev server and loading
  fresh (they vanish).
- Custom cursor + heavy video make `preview_screenshot` time out; use
  `preview_eval` / `preview_snapshot` instead.

## Conventions

No commit/push until told · respond in Persian with [bracketed] tech terms ·
CSS-only cursor · npm · keep lint + build clean. See `README.md` for structure
and `DESIGN.md` for the design system.
