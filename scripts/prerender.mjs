/**
 * Prerender — turn the client-rendered SPA into real static HTML per route.
 *
 * Why: the app boots into an empty <div id="root">; Google's crawler and
 * (especially) social link-preview scanners often don't run the JS, so they
 * see no content and no meta. This script serves the built /dist, drives the
 * real app with headless Chrome to let it render + hoist its <title>/<meta>,
 * then writes the fully-painted HTML back to dist/<route>/index.html.
 *
 * Crawlers now get complete content + per-page OG tags; real users still get
 * the live SPA (the script tags are preserved, React re-renders on load).
 *
 * No app code changes — this runs entirely after `vite build`.
 *   npm run build:static   →  vite build, then this.
 *
 * Uses the system Chrome (no Chromium download). Override the path with
 * CHROME_PATH=... if it lives elsewhere.
 */
import { createServer } from 'node:http'
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import puppeteer from 'puppeteer-core'

const ROOT = process.cwd()
const DIST = join(ROOT, 'dist')
const PORT = 5179
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.glb': 'model/gltf-binary',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
}

if (!existsSync(DIST)) {
  console.error('✗ dist/ not found — run `vite build` first.')
  process.exit(1)
}
if (!existsSync(CHROME)) {
  console.error(`✗ Chrome not found at ${CHROME}. Set CHROME_PATH to your Chrome/Edge binary.`)
  process.exit(1)
}

// Routes = home + archive + every VISIBLE project (slugs read from the data
// file). Project objects have no nested braces, so each `{…}` block is one
// project; we skip any flagged `hidden: true` so hidden work isn't prerendered.
const projectsSrc = await readFile(join(ROOT, 'src/data/projects.ts'), 'utf8')
const slugs = [...projectsSrc.matchAll(/\{[^{}]*?slug:\s*'([^']+)'[^{}]*?\}/g)]
  .filter(m => !/hidden:\s*true/.test(m[0]))
  .map(m => m[1])
const routes = ['/', '/work', '/contact', ...slugs.map(s => `/work/${s}`)]

// Snapshot the PRISTINE Vite-built index.html now, before we start writing
// prerendered pages over it. Every SPA fallback (including "/") must boot from
// this clean template — otherwise once "/" is prerendered, later routes would
// load the rendered HOME html and inherit its <title>/og tags (duplicates).
const TEMPLATE = await readFile(join(DIST, 'index.html'))

// Tiny static server: serve real asset files; everything else → clean template.
const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
    const filePath = join(DIST, urlPath)
    // Only serve on-disk FILES that aren't a prerendered index.html.
    if (
      extname(filePath) &&
      extname(filePath).toLowerCase() !== '.html' &&
      existsSync(filePath) &&
      (await stat(filePath)).isFile()
    ) {
      res.setHeader('Content-Type', MIME[extname(filePath).toLowerCase()] || 'application/octet-stream')
      res.end(await readFile(filePath))
      return
    }
    res.setHeader('Content-Type', 'text/html')
    res.end(TEMPLATE)
  } catch (err) {
    res.statusCode = 500
    res.end(String(err))
  }
})
await new Promise(resolve => server.listen(PORT, resolve))

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

let ok = 0
for (const route of routes) {
  const page = await browser.newPage()
  try {
    await page.goto(`http://localhost:${PORT}${route}`, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    })
    // Wait for the route's real content (every route renders one <h1>).
    await page.waitForSelector('#root h1', { timeout: 15000 })
    // A breath for React 19 to hoist <title>/<meta> into <head>.
    await new Promise(r => setTimeout(r, 600))

    const html = '<!doctype html>\n' + (await page.content()).replace(/^<!DOCTYPE html>/i, '')
    const outDir = route === '/' ? DIST : join(DIST, route)
    await mkdir(outDir, { recursive: true })
    await writeFile(join(outDir, 'index.html'), html)
    const title = await page.title()
    console.log(`  ✓ ${route.padEnd(28)} → ${title}`)
    ok++
  } catch (err) {
    console.error(`  ✗ ${route} — ${err.message}`)
  } finally {
    await page.close()
  }
}

await browser.close()
server.close()
console.log(`\nPrerendered ${ok}/${routes.length} routes into dist/.`)
if (ok !== routes.length) process.exitCode = 1
