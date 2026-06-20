# HANDOFF — working state

_Last updated: 2026-06-20. Snapshot for picking the project back up in a new
session. The codebase is the source of truth; verify anything here against it._

## Status

**Live in production:** https://vrtmis-ai.github.io/ — deployed to GitHub Pages
via GitHub Actions. `npm run build` is green, no console errors on a fresh load,
all routes render, assets resolve. **Every push to `main` auto-rebuilds and
redeploys** (~1–2 min). Dev server: `npm run dev` → `localhost:5173`.

## ✅ Done — shipped 2026-06-20

- **Pushed + deployed.** Repo renamed to **`vrtmis-ai/vrtmis-ai.github.io`** so the
  site serves at the **root** (required — asset paths in code are root-absolute
  `/work/...`, `/room/...`, `/about-notebook.glb`; a subpath would 404 them).
  Deploy is **GitHub Pages via GitHub Actions** (`.github/workflows/deploy.yml`):
  runs `npm run build:static` (prerender → real 200 HTML + per-page OG for all 14
  routes), writes `404.html` as the SPA fallback, then publishes. Pages source must
  be **build_type=workflow** (the `*.github.io` repo auto-enables *legacy* branch
  mode; first deploy failed until switched via `PUT /repos/.../pages
  {"build_type":"workflow"}`).
- **Push auth.** GCM is now set to the owner `vrtmis-ai`, so a plain `git push`
  works. (It previously held the user's **brother's** account
  `farboudtavasoli-beep`, no push rights → 403; that was erased and the `vrtmis-ai`
  PAT scoped **`repo` + `workflow`** stored in Windows Credential Manager, with
  `credential.https://github.com.username=vrtmis-ai` set global.) If that PAT
  expires, inline fallback:
  `git -c credential.helper= push "https://vrtmis-ai:<TOKEN>@github.com/vrtmis-ai/vrtmis-ai.github.io.git" main:main`.
  History is ~300 MB so a *first/large* push 408s on this connection — push
  **commit-by-commit** to resume safely. `http.postBuffer`/`http.lowSpeedLimit` set
  repo-local. Fetches need no auth (repo is public).

## ⏳ Later (not blocking)

- **Media → object storage when there's budget.** Videos currently ship in the repo
  (~188 MB) and serve from Pages. When funds exist, move heavy
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
