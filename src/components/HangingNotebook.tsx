import {
  Component,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, RoundedBox, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import styles from './HangingNotebook.module.css'

/**
 * NotebookStage — the chained "About Me" notebook, rendered from the real
 * Blender model (exported to glTF). It hangs from its chain and sways gently
 * on its own, like a pendant on a hook. Lives in the right column of the About
 * section (the left column carries the written profile).
 *
 * The model is the Blender export at {@link MODEL_URL}: book + the chain wrapped
 * around it + the suspension chain that rises to the top. Procedural rust /
 * roughness / teal-emission were BAKED to textures before export (glTF can't
 * carry procedural node materials), so the web look matches the Blender render.
 * The chrome chain keeps a live metallic material so it reflects the scene.
 *
 * If the .glb is missing or the WebGL context dies, a quiet placeholder shows
 * instead — the page never goes down.
 */

/** Where the Blender-exported notebook model is served from (public/). */
const MODEL_URL = '/about-notebook.glb'

/**
 * On-screen height of the BOOK body in world units. The suspension chain rises
 * above it; we pin the chain's TOP to the ceiling line and let the book hang
 * below. Tuned to the camera (fov 24 @ z=13).
 */
const BOOK_HEIGHT = 2.6

/** Gap (world units) between the canvas top edge and the chain's attachment
 *  point, so the pivot sits right on the `.right::before` ceiling line. */
const CEILING_MARGIN = 0.1

/** Clear space (world units) kept between the book and every frame edge. The
 *  max swing angle is derived so the book never crosses this margin. */
const EDGE_MARGIN = 0.1

/* ── Swing room on narrow (portrait) stages ──
   The book is sized to a fixed world height, so on a tall, narrow column (phone)
   the anti-crop limit collapses to a few degrees and the pendant reads as dead.
   We keep the book at design size wherever there's room, but shrink the whole
   composition just enough on narrow stages to win back a real, draggable swing —
   never below MIN_FIT_SCALE. Desktop is unaffected (it already clears the cap). */
/** Swing range (rad, ~38°) we try to preserve even when the stage is portrait. */
const TARGET_ANGLE = (38 * Math.PI) / 180
/** Hard floor on the responsive shrink, so the book never gets tiny. */
const MIN_FIT_SCALE = 0.55

/* ── Pendulum feel (the swing is a real damped pendulum, tuned by frequency) ──
   We integrate θ'' = −ω0²·sin θ − 2ζω0·θ', a genuine physical pendulum, but
   parameterise it by natural frequency ω0 and damping ratio ζ rather than by
   g/L so the *feel* is independent of the measured arm length. */
/** Natural angular frequency (rad/s). Lower = slower, heavier swing. ~2.0 → period ≈ 3.1s. */
const OMEGA0 = 2.05
/** Damping ratio. <1 underdamped: a few visible swings, then settles. */
const ZETA = 0.085
/** Faint always-on "breeze" torque so a resting book is never perfectly dead. */
const IDLE_TORQUE = 0.05

/* ── Passive 3D life — yaw + fore/aft tilt, coupled to the swing ──
   A pure Z-swing reads as a flat, 2D rotation. To sell the book as a real 3D
   slab we add two passive, damped degrees of freedom that ride the swing:
   a YAW (turn about the vertical) that reveals the book's edge/thickness, and a
   fore/aft TILT. Both are damped springs chasing a target derived from the
   swing, plus a faint idle "breath" so the book has 3D life even at rest.
   Neither is draggable — the user only ever controls the Z swing. */

/** Yaw — the slab turns to show its edge as it swings (the main 3D cue). */
const YAW_OMEGA0 = 2.6
const YAW_ZETA = 0.55
/** Target yaw per radian of swing angle (how far it turns at full swing). */
const YAW_COUPLE = 1.4
/** Hard cap on yaw (rad, ~20°). */
const YAW_MAX = 0.36

/** Fore/aft tilt — the book leans into its swing. */
const TILT_OMEGA0 = 3.0
const TILT_ZETA = 0.5
/** How strongly sideways swing speed tips the book fore/aft. */
const TILT_DRIVE = 0.14
/** Hard cap on the passive tilt (rad, ~10°). */
const TILT_MAX = 0.18

/** Faint always-on 3D "breath" so a resting book gently turns and tips. */
const IDLE_YAW = 0.05
const IDLE_TILT = 0.035

/* ── Scroll impulse — rushing past About physically nudges the pendant ──
   The hook rides the page, so a fast scroll "yanks" it and the book lags
   into a swing. Velocity-proportional and hard-capped: ordinary reading
   speed stays below the threshold and never moves the book. */
/** rad/s of swing added per second, per 1000 px/s of scroll speed. */
const SCROLL_KICK = 6
/** Scroll speeds below this (px/s) are ignored entirely. */
const SCROLL_KICK_MIN = 400
/** The kick never pushes |omegaZ| beyond this (rad/s) — drag/entry still can. */
const SCROLL_KICK_CAP = 2.2

/** Fixed physics sub-step (s) — keeps integration stable regardless of FPS. */
const SUBSTEP = 1 / 240

/* ── Vertical lift (drag the book UP its chain) + the drop when released ──
   A second draggable degree of freedom. Pulling the cursor toward the ceiling
   hook raises the book along the chain axis; the suspension chain shortens to
   follow, so the hook→book span never gaps. On release the book free-falls
   under gravity until the chain snaps taut (lift back to 0), gives a small
   bounce, then settles to its resting hang. */
/** Furthest the book can be lifted, as a fraction of the suspension chain length.
 *  Generous: lifting only raises the attach point toward the hook (the book always
 *  hangs below it), so it can never crop — and the higher it rides, the smaller its
 *  swing arc, so a big lift only makes the side-swing safer. */
const LIFT_MAX_FRAC = 0.85
/** Downward pull on the lifted book (model units/s²). Higher = heavier, faster fall. */
const LIFT_GRAVITY = 18
/** Air damping bled from the radial motion each second while the book is in flight. */
const LIFT_AIR = 1.4
/** Energy kept when the chain snaps taut (0 = dead stop, 1 = perfect bounce). */
const LIFT_RESTITUTION = 0.22
/** Below this radial speed at the taut point the book is put to rest (kills jitter). */
const LIFT_SLEEP = 0.04

/* ── Drooping chain (the suspension links sag when the book is lifted) ──
   The suspension is one rigid mesh in the export, which can only scale — it can't
   bend. We split it into its real chain links at load and drape them along a
   procedural curve from the fixed ceiling hook to the book's attach point. When
   the chain is taut the curve is the straight chord (so the look is pixel-identical
   to the original); as the book is lifted the slack bows the chain outward and down
   like a real loose chain. */
/** How far the slack chain bows out, as a fraction of chain length per unit slack. */
const SAG_GAIN = 1.0
/** The chain's rest axis (top→foot is straight down) — links delta-rotate from this. */
const REST_TANGENT = new THREE.Vector3(0, -1, 0)

/* ── Entrance: the pendant drops in from above the frame ──
   Instead of popping into place, the whole assembly falls in from outside the top
   of the frame, the chain catches it, and it bounces + sways to rest — an eye-catch
   the first time the About section scrolls into view. Plays once per mount. */
/** Downward acceleration of the drop-in (world units/s²). */
const ENTRY_GRAVITY = 26
/** Energy kept each time it bounces when the chain snaps taut at the bottom. */
const ENTRY_RESTITUTION = 0.34
/** Below this drop speed at the bottom the vertical motion is put to rest. */
const ENTRY_SLEEP = 0.05
/** Initial sway angle (rad) so it's already swinging as it falls in. */
const ENTRY_SWAY = 0.28
/** Extra swing speed (rad/s) injected the first time it lands — the recoil sway. */
const ENTRY_SWAY_KICK = 1.7

/**
 * If the WebGL canvas (or the model load) ever throws — lost GL context, weak
 * GPU, missing/invalid .glb — we must NOT take the page down. This boundary
 * swaps the failing subtree for a quiet fallback.
 */
class CanvasErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export function NotebookStage() {
  const wrapRef = useRef<HTMLDivElement>(null)
  // Mount the (heavy) WebGL canvas only once the stage nears the viewport.
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setInView(true)
          io.disconnect()
        }
      },
      { rootMargin: '300px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrapRef} className={styles.stage} aria-hidden data-hover>
      {inView ? (
        <CanvasErrorBoundary fallback={null}>
          <Canvas
            dpr={[1, 1.75]}
            camera={{ position: [0, 0, 13], fov: 24 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          >
            {/* Pixar-ish 3-point: warm key, cool fill, warm rim. Soft + appealing. */}
            <ambientLight intensity={0.45} />
            <directionalLight position={[5, 8, 6]} intensity={2.4} color="#fff3e0" />
            <pointLight position={[-6, -2, 4]} intensity={2.2} color="#6fb4ff" distance={22} />
            <directionalLight position={[-3, 6, -6]} intensity={1.6} color="#ffd9b0" />
            <Suspense fallback={null}>
              {/* Procedural studio environment — built from Lightformers in-scene,
                  so it needs NO network fetch. Gives the chrome chain its reflections. */}
              <Environment resolution={256}>
                <Lightformer intensity={2.4} position={[0, 4, 4]} scale={[10, 10, 1]} color="#ffffff" />
                <Lightformer intensity={1.5} position={[-5, 1, 3]} scale={[5, 9, 1]} color="#ff7a3c" />
                <Lightformer intensity={1.1} position={[5, -1, 3]} scale={[5, 9, 1]} color="#9ad4ff" />
              </Environment>
              <CanvasErrorBoundary fallback={<PlaceholderNotebook />}>
                <Suspense fallback={<PlaceholderNotebook />}>
                  <NotebookModel />
                </Suspense>
              </CanvasErrorBoundary>
            </Suspense>
          </Canvas>
        </CanvasErrorBoundary>
      ) : null}
    </div>
  )
}

/* ─────────────────────────────────────────────
   The Blender notebook model — a real pendulum hung from its chain.

   Physics: a genuine single-DOF pendulum about Z (the screen-plane swing).
   Gravity restores it to vertical, inertia carries it through, damping bleeds
   the energy — no "spring chasing a target". Dragging is geometric: the grabbed
   material point tracks the cursor's *bearing* about the pivot, so it stays
   under the cursor and releases with whatever momentum it had. A second, much
   subtler passive bob about X gives a touch of 3D life (not draggable).
   ───────────────────────────────────────────── */

/** One real suspension link, pulled out of the single chain mesh so it can be
 *  draped individually along the droop curve. */
type ChainLink = {
  /** The link's own mesh, geometry recentred on its centroid (origin = centroid). */
  mesh: THREE.Mesh
  /** Where this link sits along the chain, 0 = ceiling hook … 1 = book foot. */
  restFrac: number
  /** The centroid's sideways offset from the straight rest axis (carried into the droop). */
  restOffset: THREE.Vector3
}

/** The model split into a static chain + a swinging book, plus the geometry
 *  (model space, post flip+scale) the screen placement needs. */
type BuiltModel = {
  /** Suspension chain (whole mesh) — kept only as the fallback if the link split fails. */
  susp: THREE.Object3D
  /** Suspension split into its real links — draped along the droop curve each frame. */
  links: ChainLink[]
  /** Book body (+ its wrapped chain) — the part that swings. */
  book: THREE.Object3D
  /** Suspension top Y — the ceiling hook the whole assembly swings about. */
  suspTopY: number
  /** Suspension chain length (model units) — the hook→foot span. */
  chainLen: number
  /** Hook X (chain centre) — paired with suspTopY to give the swing pivot. */
  hookX: number
  /** Horizontal centre of the whole composition (chain + book), for centring. */
  fullCenterX: number
  /** Book-body bounds (model space) — the anti-crop reference. */
  bookMinX: number
  bookMaxX: number
  bookMinY: number
  bookMaxY: number
}

/** Split a geometry into its connected components (loose parts). The export bakes
 *  the whole suspension into one mesh; this recovers the individual chain links so
 *  they can droop independently. Vertices are welded by position first so UV/normal
 *  seams (which duplicate a ring's verts) don't fracture a link into slivers. */
function splitConnectedComponents(geom: THREE.BufferGeometry): THREE.BufferGeometry[] {
  const pos = geom.getAttribute('position')
  const nrm = geom.getAttribute('normal') ?? null
  const uv = geom.getAttribute('uv') ?? null
  const index = geom.getIndex()
  const vCount = pos.count
  const triCount = index ? index.count : vCount

  // Union-find over vertices: merge welded duplicates, then merge per-triangle.
  const parent = new Int32Array(vCount)
  for (let i = 0; i < vCount; i++) parent[i] = i
  const find = (x: number): number => {
    let r = x
    while (parent[r] !== r) r = parent[r]
    while (parent[x] !== r) {
      const next = parent[x]
      parent[x] = r
      x = next
    }
    return r
  }
  const union = (a: number, b: number) => {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) parent[ra] = rb
  }

  const keyOf = (i: number) =>
    `${Math.round(pos.getX(i) * 1e5)}_${Math.round(pos.getY(i) * 1e5)}_${Math.round(pos.getZ(i) * 1e5)}`
  const weld = new Map<string, number>()
  for (let i = 0; i < vCount; i++) {
    const k = keyOf(i)
    const rep = weld.get(k)
    if (rep === undefined) weld.set(k, i)
    else union(i, rep)
  }

  const vAt = (t: number): number => (index ? index.getX(t) : t)
  for (let t = 0; t < triCount; t += 3) {
    union(vAt(t), vAt(t + 1))
    union(vAt(t + 1), vAt(t + 2))
  }

  // Bucket each triangle under its component root.
  const buckets = new Map<number, number[]>()
  for (let t = 0; t < triCount; t += 3) {
    const root = find(vAt(t))
    let arr = buckets.get(root)
    if (!arr) {
      arr = []
      buckets.set(root, arr)
    }
    arr.push(vAt(t), vAt(t + 1), vAt(t + 2))
  }

  const parts: THREE.BufferGeometry[] = []
  for (const verts of buckets.values()) {
    const remap = new Map<number, number>()
    const positions: number[] = []
    const normals: number[] = []
    const uvs: number[] = []
    const indices: number[] = []
    for (const v of verts) {
      let ni = remap.get(v)
      if (ni === undefined) {
        ni = positions.length / 3
        remap.set(v, ni)
        positions.push(pos.getX(v), pos.getY(v), pos.getZ(v))
        if (nrm) normals.push(nrm.getX(v), nrm.getY(v), nrm.getZ(v))
        if (uv) uvs.push(uv.getX(v), uv.getY(v))
      }
      indices.push(ni)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    if (nrm) g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    if (uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    g.setIndex(indices)
    parts.push(g)
  }
  return parts
}

/** Detach an object from its parent, baking its current world transform into
 *  its local one so it renders identically once re-parented elsewhere. Used to
 *  lift the chain and the book out of the shared clone into separate groups. */
function bakeWorldToLocal(obj: THREE.Object3D) {
  obj.updateWorldMatrix(true, false)
  const world = obj.matrixWorld.clone()
  obj.removeFromParent()
  world.decompose(obj.position, obj.quaternion, obj.scale)
  obj.updateMatrixWorld(true)
}

function NotebookModel() {
  const { scene } = useGLTF(MODEL_URL)
  const viewport = useThree(s => s.viewport)
  const gl = useThree(s => s.gl)
  const swing = useRef<THREE.Group>(null)
  // The chain links live in the non-rotating outer frame (so they sag toward the
  // book under gravity rather than turning rigidly with the swing); the book rides
  // the swing group and slides up by `lift`. bookAnchor marks where the chain's
  // foot meets the book, so the droop curve's bottom tracks the book everywhere.
  const outerRef = useRef<THREE.Group>(null)
  const chainGroup = useRef<THREE.Group>(null)
  const bookGroup = useRef<THREE.Group>(null)
  const bookAnchor = useRef<THREE.Object3D>(null)
  // Pre-allocated scratch for the per-frame droop maths (no per-frame allocations).
  const scratchRef = useRef<{
    bottom: THREE.Vector3
    pivot: THREE.Vector3
    span: THREE.Vector3
    t: THREE.Vector3
    perp: THREE.Vector3
    c1: THREE.Vector3
    c2: THREE.Vector3
    pos: THREE.Vector3
    tan: THREE.Vector3
    a: THREE.Vector3
    b: THREE.Vector3
    off: THREE.Vector3
    q: THREE.Quaternion
  } | null>(null)
  if (scratchRef.current === null) {
    scratchRef.current = {
      bottom: new THREE.Vector3(),
      pivot: new THREE.Vector3(),
      span: new THREE.Vector3(),
      t: new THREE.Vector3(),
      perp: new THREE.Vector3(),
      c1: new THREE.Vector3(),
      c2: new THREE.Vector3(),
      pos: new THREE.Vector3(),
      tan: new THREE.Vector3(),
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      off: new THREE.Vector3(),
      q: new THREE.Quaternion(),
    }
  }
  const scratch = scratchRef.current

  // ── Load, orient, scale, split chain/book, and measure (once per scene) ────
  // Clone so StrictMode's double-mount can't share one instance, then spin 180°
  // about Y (the cover art faces away after Blender's Z-up→Y-up swap) and scale
  // the book body to a consistent on-screen height. After the flip the chain
  // sits to the right and the book hangs to the left — the intended pose.
  const built = useMemo<BuiltModel>(() => {
    const m = scene.clone(true)
    m.rotation.y = Math.PI
    m.updateMatrixWorld(true)

    // Book body (+ wrapped chain) is the scale reference; fall back to whole model.
    const hero = m.getObjectByName('BookCover') ?? m
    const preSize = new THREE.Box3().setFromObject(hero).getSize(new THREE.Vector3())
    m.scale.setScalar(BOOK_HEIGHT / preSize.y)
    m.updateMatrixWorld(true)

    // Material clean-up — clone each (clone(true) shares them), tame the baked
    // teal emission so it reads as printed art (not a light panel), and
    // polygon-offset the flat CoverArt decal to kill z-fighting flicker.
    m.traverse(o => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const tidy = (mat: THREE.Material): THREE.Material => {
        const std = mat.clone() as THREE.MeshStandardMaterial
        if ('emissiveIntensity' in std && std.emissiveIntensity > 1) {
          std.emissiveIntensity = 0.6
        }
        if (o.name === 'CoverArt') {
          std.polygonOffset = true
          std.polygonOffsetFactor = -2
          std.polygonOffsetUnits = -2
        }
        return std
      }
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(tidy) : tidy(mesh.material)
    })

    // Split the two roots into independent objects (transforms baked in) so the
    // chain can stay static while only the book swings. Both keep the same model
    // origin, so re-parenting at a shared anchor lines them up exactly as built.
    const susp = (m.getObjectByName('Suspension') ?? m) as THREE.Object3D
    const book = (m.getObjectByName('BookCover') ?? m) as THREE.Object3D
    bakeWorldToLocal(susp)
    bakeWorldToLocal(book)

    const suspBox = new THREE.Box3().setFromObject(susp)
    const bookBox = new THREE.Box3().setFromObject(book)
    const fullMinX = Math.min(suspBox.min.x, bookBox.min.x)
    const fullMaxX = Math.max(suspBox.max.x, bookBox.max.x)

    // Split the single suspension mesh into its real chain links so the chain can
    // genuinely go slack and droop (a rigid mesh can only scale). Each link becomes
    // its own mesh whose geometry is recentred on its centroid, plus where it sits
    // along the chain (restFrac) and its sideways offset from the straight axis.
    const chainTop = suspBox.max.y
    const chainSpan = suspBox.max.y - suspBox.min.y
    const hookCenterX = (suspBox.min.x + suspBox.max.x) / 2
    const links: ChainLink[] = []
    let suspMesh: THREE.Mesh | undefined
    susp.traverse(o => {
      if (suspMesh) return
      const me = o as THREE.Mesh
      if (me.isMesh) suspMesh = me
    })
    if (suspMesh) {
      suspMesh.updateWorldMatrix(true, false)
      const baked = suspMesh.geometry.clone()
      baked.applyMatrix4(suspMesh.matrixWorld)
      const suspMat = Array.isArray(suspMesh.material) ? suspMesh.material[0] : suspMesh.material
      const center = new THREE.Vector3()
      for (const g of splitConnectedComponents(baked)) {
        g.computeBoundingBox()
        if (!g.boundingBox) continue
        g.boundingBox.getCenter(center)
        g.translate(-center.x, -center.y, -center.z)
        const mesh = new THREE.Mesh(g, suspMat)
        mesh.frustumCulled = false
        links.push({
          mesh,
          restFrac: THREE.MathUtils.clamp((chainTop - center.y) / chainSpan, 0, 1),
          restOffset: new THREE.Vector3(center.x - hookCenterX, 0, center.z),
        })
      }
      links.sort((a, b) => a.restFrac - b.restFrac)
      baked.dispose()
    }

    return {
      susp,
      links,
      book,
      suspTopY: suspBox.max.y,
      chainLen: suspBox.max.y - suspBox.min.y,
      // Hook at the chain top-centre — the whole assembly swings about it.
      hookX: (suspBox.min.x + suspBox.max.x) / 2,
      fullCenterX: (fullMinX + fullMaxX) / 2,
      bookMinX: bookBox.min.x,
      bookMaxX: bookBox.max.x,
      bookMinY: bookBox.min.y,
      bookMaxY: bookBox.max.y,
    }
  }, [scene])

  // ── Place on screen + derive the anti-crop swing limit ─────────────────────
  // Pin the chain TOP to the ceiling line and centre the whole composition
  // horizontally. The pivot is the ceiling hook (a fixed screen point); the
  // whole assembly — chain + book — swings about it as one rigid unit, so the
  // chain never cuts through the book. Find the largest angle whose book corners
  // all stay in frame so the book can never crop, whatever the column size.
  const { anchorX, anchorY, pivotScreenX, pivotScreenY, maxAngle, fitScale } = useMemo(() => {
    const ceilingY = viewport.height / 2 - CEILING_MARGIN
    const halfW = viewport.width / 2 - EDGE_MARGIN
    const limY = viewport.height / 2 - EDGE_MARGIN

    // Book corners relative to the hook (model space, comp scale 1). The book is
    // the farthest extent, so its corners bound the swing.
    const corners: Array<[number, number]> = [
      [built.bookMinX - built.hookX, built.bookMinY - built.suspTopY],
      [built.bookMaxX - built.hookX, built.bookMinY - built.suspTopY],
      [built.bookMinX - built.hookX, built.bookMaxY - built.suspTopY],
      [built.bookMaxX - built.hookX, built.bookMaxY - built.suspTopY],
    ]

    // Hook (pivot) screen point at composition scale s: chain top pinned to the
    // ceiling line, whole comp centred horizontally.
    const pivotAt = (s: number): [number, number] => [(-built.fullCenterX + built.hookX) * s, ceilingY]

    // Does every book corner stay in frame at comp scale s, swung ±a?
    const fitsAt = (s: number, a: number): boolean => {
      const [psx, psy] = pivotAt(s)
      for (const sign of [a, -a]) {
        const c = Math.cos(sign)
        const sn = Math.sin(sign)
        for (const [cx, cy] of corners) {
          const x = cx * s
          const y = cy * s
          const wx = psx + (x * c - y * sn)
          const wy = psy + (x * sn + y * c)
          if (Math.abs(wx) > halfW || wy > limY || wy < -limY) return false
        }
      }
      return true
    }

    // Largest swing (cap ~60°) that keeps every corner inside at comp scale s.
    const maxAngleAt = (s: number): number => {
      let lo = 0
      let hi = 1.05
      for (let i = 0; i < 22; i++) {
        const mid = (lo + hi) / 2
        if (fitsAt(s, mid)) lo = mid
        else hi = mid
      }
      return lo
    }

    // Keep the book at design size where there's room; only shrink it on narrow
    // stages, just enough to reach TARGET_ANGLE of swing (never below the floor).
    let scale = 1
    if (maxAngleAt(1) < TARGET_ANGLE) {
      let lo = MIN_FIT_SCALE
      let hi = 1
      for (let i = 0; i < 18; i++) {
        const mid = (lo + hi) / 2
        if (maxAngleAt(mid) >= TARGET_ANGLE) lo = mid
        else hi = mid
      }
      scale = lo
    }

    const ax = -built.fullCenterX * scale
    const ay = ceilingY - built.suspTopY * scale
    const [psx, psy] = pivotAt(scale)
    return { anchorX: ax, anchorY: ay, pivotScreenX: psx, pivotScreenY: psy, maxAngle: maxAngleAt(scale), fitScale: scale }
  }, [built, viewport.width, viewport.height])

  // Physics state (kept in refs — frequent, transient, never re-renders React).
  // thetaZ: the draggable swing. thetaX/thetaY: passive 3D tilt + yaw.
  // lift/liftVel: the draggable up-the-chain raise + its fall velocity.
  // entryY: vertical drop-in offset (starts above the frame, falls to 0).
  // entryVel: its fall speed. entryKicked: whether the one-time landing sway fired.
  const phys = useRef({
    thetaZ: 0,
    omegaZ: 0,
    thetaX: 0,
    omegaX: 0,
    thetaY: 0,
    omegaY: 0,
    lift: 0,
    liftVel: 0,
    entryY: 0,
    entryVel: 0,
    entryKicked: false,
  })
  const drag = useRef<{
    bearing0: number
    theta0: number
    dist0: number
    lift0: number
    lastTheta: number
    lastLift: number
    lastT: number
  } | null>(null)
  // Last page scrollY, sampled once per frame — drives the scroll impulse.
  const scrollPrevY = useRef<number | null>(null)
  // Geometry the pointer handlers need, mirrored into a ref so they read fresh
  // values without re-binding listeners on every resize. fitScale converts the
  // cursor's world-space radial pull into the book's local lift; liftMax caps it.
  const geom = useRef({
    pivotX: pivotScreenX,
    pivotY: pivotScreenY,
    maxAngle,
    vpW: viewport.width,
    vpH: viewport.height,
    fitScale,
    liftMax: LIFT_MAX_FRAC * built.chainLen,
  })
  useEffect(() => {
    geom.current = {
      pivotX: pivotScreenX,
      pivotY: pivotScreenY,
      maxAngle,
      vpW: viewport.width,
      vpH: viewport.height,
      fitScale,
      liftMax: LIFT_MAX_FRAC * built.chainLen,
    }
  }, [pivotScreenX, pivotScreenY, maxAngle, viewport.width, viewport.height, fitScale, built.chainLen])

  // Seed the entrance once: lift the whole pendant a full frame above its rest
  // spot (so it starts off-screen) and tip it into a sway, then let useFrame drop
  // it in. The guard keeps it to a single play even though resize re-runs this.
  // Runs as a LAYOUT effect and writes the off-screen Y straight onto the outer
  // group BEFORE the browser paints — otherwise the first frame flashes the book
  // at its rest spot for one tick before useFrame takes over.
  const entrySeeded = useRef(false)
  useLayoutEffect(() => {
    if (entrySeeded.current) return
    entrySeeded.current = true
    const p = phys.current
    p.entryY = viewport.height + 0.5
    p.entryVel = 0
    p.entryKicked = false
    p.thetaZ = ENTRY_SWAY
    p.omegaZ = 0
    if (outerRef.current) outerRef.current.position.y = anchorY + p.entryY
  }, [anchorY, viewport.height])

  // ── Geometric drag: the grabbed point tracks the cursor in polar coords ─────
  // bearing = angle of (pointer − pivot) from straight-down → drives the swing.
  // distance from the pivot → drives the lift: pulling the cursor inward raises
  // the book up its chain, pushing past the resting hang is clamped (chain taut).
  // The grabbed point rides directly under the cursor (no pixel-delta, no offset).
  useEffect(() => {
    const el = gl.domElement

    const pointOf = (e: PointerEvent): { wx: number; wy: number } => {
      const rect = el.getBoundingClientRect()
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      return { wx: (ndcX * geom.current.vpW) / 2, wy: (ndcY * geom.current.vpH) / 2 }
    }
    // atan2(dx, -dy): 0 straight below the pivot, +ve toward +x (screen right).
    const bearingOf = (wx: number, wy: number): number =>
      Math.atan2(wx - geom.current.pivotX, geom.current.pivotY - wy)
    const distOf = (wx: number, wy: number): number =>
      Math.hypot(wx - geom.current.pivotX, wy - geom.current.pivotY)

    const onDown = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId)
      const { wx, wy } = pointOf(e)
      drag.current = {
        bearing0: bearingOf(wx, wy),
        theta0: phys.current.thetaZ,
        dist0: distOf(wx, wy),
        lift0: phys.current.lift,
        lastTheta: phys.current.thetaZ,
        lastLift: phys.current.lift,
        lastT: performance.now(),
      }
    }
    const onMove = (e: PointerEvent) => {
      const d = drag.current
      if (!d) return
      const { wx, wy } = pointOf(e)
      const nextTheta = THREE.MathUtils.clamp(
        d.theta0 + (bearingOf(wx, wy) - d.bearing0),
        -geom.current.maxAngle,
        geom.current.maxAngle
      )
      // Radial pull (world units) → local lift via ÷fitScale. Clamp ≥0 (the chain
      // can't stretch past taut) and ≤liftMax (it can't fully collapse).
      const nextLift = THREE.MathUtils.clamp(
        d.lift0 + (d.dist0 - distOf(wx, wy)) / geom.current.fitScale,
        0,
        geom.current.liftMax
      )
      // Track both velocities from the kinematic motion so release carries real
      // momentum into the free swing and the free fall.
      const now = performance.now()
      const dt = Math.max((now - d.lastT) / 1000, 1 / 1000)
      phys.current.omegaZ = THREE.MathUtils.lerp(phys.current.omegaZ, (nextTheta - d.lastTheta) / dt, 0.6)
      phys.current.liftVel = THREE.MathUtils.lerp(phys.current.liftVel, (nextLift - d.lastLift) / dt, 0.6)
      phys.current.thetaZ = nextTheta
      phys.current.lift = nextLift
      d.lastTheta = nextTheta
      d.lastLift = nextLift
      d.lastT = now
    }
    const onUp = (e: PointerEvent) => {
      drag.current = null
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
    }
  }, [gl])

  // ── Integrate the pendulum ─────────────────────────────────────────────────
  useFrame(({ clock }, delta) => {
    if (!swing.current) return
    const p = phys.current
    const lim = geom.current.maxAngle
    const dragging = drag.current !== null
    let remaining = Math.min(delta, 1 / 30) // clamp tab-switch hitches
    const t = clock.elapsedTime
    // Faint breeze so a resting book is never perfectly still (physics-driven).
    const breeze = dragging ? 0 : IDLE_TORQUE * (Math.sin(t * 0.6) * 0.6 + Math.sin(t * 0.27) * 0.4)
    // Idle 3D "breath": slow yaw + tilt targets so the resting book stays alive.
    const idleYaw = dragging ? 0 : IDLE_YAW * (Math.sin(t * 0.5) * 0.7 + Math.sin(t * 0.23) * 0.3)
    const idleTilt = dragging ? 0 : IDLE_TILT * Math.sin(t * 0.43 + 1.1)

    // ── Scroll impulse ──
    // Sample page scroll once per frame; speed above the threshold feeds a
    // velocity-proportional kick into the swing. Skipped while dragging (the
    // user owns the book) and during the entrance drop (entryY > 0).
    {
      const y = window.scrollY
      const prevY = scrollPrevY.current
      scrollPrevY.current = y
      if (prevY !== null && !dragging && p.entryY === 0 && delta > 0) {
        const v = (y - prevY) / delta // px/s, + when scrolling down
        const speed = Math.abs(v)
        if (speed > SCROLL_KICK_MIN) {
          const kick = Math.sign(v) * ((speed - SCROLL_KICK_MIN) / 1000) * SCROLL_KICK * delta
          const next = p.omegaZ + kick
          // Only let the kick grow the speed up to its cap — never claw back
          // momentum the user/entry already put in above it.
          if (Math.abs(next) <= SCROLL_KICK_CAP || Math.abs(next) < Math.abs(p.omegaZ)) {
            p.omegaZ = next
          }
        }
      }
    }

    while (remaining > 0) {
      const h = Math.min(SUBSTEP, remaining)
      remaining -= h

      // Z swing: free pendulum unless the user is dragging (then it's kinematic,
      // driven from onMove — we only keep it inside the limit here).
      if (!dragging) {
        const accZ = -OMEGA0 * OMEGA0 * Math.sin(p.thetaZ) - 2 * ZETA * OMEGA0 * p.omegaZ + breeze
        p.omegaZ += accZ * h
        p.thetaZ += p.omegaZ * h
      }
      if (p.thetaZ > lim) {
        p.thetaZ = lim
        if (p.omegaZ > 0) p.omegaZ = 0
      } else if (p.thetaZ < -lim) {
        p.thetaZ = -lim
        if (p.omegaZ < 0) p.omegaZ = 0
      }

      // Lift (up the chain): free fall under gravity unless the user is dragging
      // (then it's kinematic, set in onMove). The chain is inextensible, so lift
      // can't drop below 0 — when it hits that taut point the book bounces a
      // little (restitution) and then settles, like a weight catching its chain.
      if (!dragging) {
        p.liftVel -= LIFT_GRAVITY * h
        p.lift += p.liftVel * h
        if (p.lift <= 0) {
          p.lift = 0
          if (p.liftVel < 0) p.liftVel = -p.liftVel * LIFT_RESTITUTION
          if (Math.abs(p.liftVel) < LIFT_SLEEP) p.liftVel = 0
        }
        p.liftVel *= Math.exp(-LIFT_AIR * h)
      }

      // Entrance drop-in: the whole pendant falls from above the frame under
      // gravity; when it reaches its rest height the chain "catches" it (bounce),
      // and the first catch injects a sway kick so it visibly swings on arrival.
      if (p.entryY > 0 || p.entryVel !== 0) {
        p.entryVel -= ENTRY_GRAVITY * h
        p.entryY += p.entryVel * h
        if (p.entryY <= 0) {
          p.entryY = 0
          if (p.entryVel < 0) {
            p.entryVel = -p.entryVel * ENTRY_RESTITUTION
            if (!p.entryKicked) {
              p.entryKicked = true
              p.omegaZ += (p.omegaZ >= 0 ? 1 : -1) * ENTRY_SWAY_KICK
            }
          }
          if (Math.abs(p.entryVel) < ENTRY_SLEEP) p.entryVel = 0
        }
      }

      // Yaw (about vertical): damped spring chasing a turn proportional to the
      // swing angle (+ idle). This shows the book's edge → the main 3D cue.
      const yawTarget = THREE.MathUtils.clamp(YAW_COUPLE * p.thetaZ + idleYaw, -YAW_MAX, YAW_MAX)
      const accY = YAW_OMEGA0 * YAW_OMEGA0 * (yawTarget - p.thetaY) - 2 * YAW_ZETA * YAW_OMEGA0 * p.omegaY
      p.omegaY += accY * h
      p.thetaY += p.omegaY * h

      // Fore/aft tilt: damped, nudged by swing speed, breathing at idle.
      const accX =
        -TILT_OMEGA0 * TILT_OMEGA0 * Math.sin(p.thetaX) -
        2 * TILT_ZETA * TILT_OMEGA0 * p.omegaX -
        TILT_DRIVE * p.omegaZ +
        TILT_OMEGA0 * TILT_OMEGA0 * idleTilt
      p.omegaX += accX * h
      p.thetaX += p.omegaX * h
      p.thetaX = THREE.MathUtils.clamp(p.thetaX, -TILT_MAX, TILT_MAX)
    }

    // ZXY order: the book yaws/tilts in its own frame, then the whole slab
    // swings about the pivot — so the secondary motion reads as 3D, not shear.
    swing.current.rotation.order = 'ZXY'
    swing.current.rotation.z = p.thetaZ
    swing.current.rotation.x = p.thetaX
    swing.current.rotation.y = p.thetaY

    // Entrance: ride the whole composition down from above the frame into place.
    if (outerRef.current) outerRef.current.position.y = anchorY + p.entryY

    // Lift: the book slides up its chain axis (swing-local Y); the chain's foot
    // (bookAnchor) rides with it, so the droop curve below tracks the book.
    if (bookGroup.current) bookGroup.current.position.y = p.lift

    // ── Drape the chain links along the droop curve ──
    // CUBIC Bézier from the fixed ceiling hook (pivot) to the book's attach point
    // (bottom, which follows swing + lift). The top control (c1) sits a third of
    // the chain straight BELOW the hook — so the curve always LEAVES the hook
    // vertically and the top links stay pinned in place no matter how the book
    // swings (they can't drift sideways with it). The bottom control (c2) carries
    // the gravity-down sag, so slack accumulates in the lower span toward the book.
    // At rest the four points are collinear & evenly spaced → an exact straight
    // chain (links land where built).
    const outer = outerRef.current
    const anchor = bookAnchor.current
    if (outer && anchor && built.links.length > 0) {
      anchor.getWorldPosition(scratch.bottom)
      outer.worldToLocal(scratch.bottom)
      scratch.pivot.set(built.hookX, built.suspTopY, 0)
      scratch.span.subVectors(scratch.bottom, scratch.pivot)
      const spanLen = scratch.span.length() || 1e-4
      const slack = THREE.MathUtils.clamp(1 - spanLen / built.chainLen, 0, 1)
      scratch.t.copy(scratch.span).multiplyScalar(1 / spanLen)
      // Gravity-down projected perpendicular to the chord = the sag direction.
      // (Degenerate when the chord is vertical → fall back to a fixed side.)
      scratch.perp.set(0, -1, 0).addScaledVector(scratch.t, scratch.t.y)
      if (scratch.perp.lengthSq() < 1e-4) scratch.perp.set(1, 0, 0)
      scratch.perp.normalize()
      const sag = SAG_GAIN * slack * built.chainLen
      const third = built.chainLen / 3
      // Top control: straight down from the hook (NO sag) → pins the top vertical.
      scratch.c1.copy(scratch.pivot).addScaledVector(REST_TANGENT, third)
      // Bottom control: a third of the chain ABOVE the book, biased along the sag.
      scratch.c2
        .copy(scratch.bottom)
        .addScaledVector(REST_TANGENT, -third)
        .addScaledVector(scratch.perp, sag)
      // Control-segment differences (constant over u) → reused for the tangent.
      scratch.a.subVectors(scratch.c1, scratch.pivot) // P1 − P0
      scratch.b.subVectors(scratch.c2, scratch.c1) // P2 − P1
      scratch.span.subVectors(scratch.bottom, scratch.c2) // P3 − P2
      for (const lk of built.links) {
        const u = lk.restFrac
        const mu = 1 - u
        const mu2 = mu * mu
        const u2 = u * u
        // Cubic Bézier point pivot→c1→c2→bottom at parameter u.
        scratch.pos
          .set(0, 0, 0)
          .addScaledVector(scratch.pivot, mu2 * mu)
          .addScaledVector(scratch.c1, 3 * mu2 * u)
          .addScaledVector(scratch.c2, 3 * mu * u2)
          .addScaledVector(scratch.bottom, u2 * u)
        // …and its tangent, to delta-rotate the link off its rest axis.
        scratch.tan
          .set(0, 0, 0)
          .addScaledVector(scratch.a, 3 * mu2)
          .addScaledVector(scratch.b, 6 * mu * u)
          .addScaledVector(scratch.span, 3 * u2)
        if (scratch.tan.lengthSq() < 1e-8) scratch.tan.copy(REST_TANGENT)
        else scratch.tan.normalize()
        scratch.q.setFromUnitVectors(REST_TANGENT, scratch.tan)
        scratch.off.copy(lk.restOffset).applyQuaternion(scratch.q)
        lk.mesh.position.copy(scratch.pos).add(scratch.off)
        lk.mesh.quaternion.copy(scratch.q)
      }
    }
  })

  // Outer group centres the whole composition and pins the chain top to the
  // ceiling. The chain links sit directly in this (non-rotating) frame so they
  // sag toward the book under gravity. The swing group's origin is the ceiling
  // hook; the book lives inside it and swings about it. bookAnchor (an empty at
  // the chain's foot) rides the book so the droop curve's bottom always tracks it.
  return (
    <group ref={outerRef} position={[anchorX, anchorY, 0]} scale={fitScale}>
      {/* Suspension chain — its real links, draped each frame in useFrame.
          Falls back to the whole mesh if the link split ever comes up empty. */}
      <group ref={chainGroup}>
        {built.links.length > 0
          ? built.links.map((lk, i) => <primitive key={i} object={lk.mesh} />)
          : <primitive object={built.susp} />}
      </group>
      {/* Book + its wrapped chain — swings about the hook, slides up by `lift`. */}
      <group ref={swing} position={[built.hookX, built.suspTopY, 0]}>
        <group ref={bookGroup}>
          <primitive object={built.book} position={[-built.hookX, -built.suspTopY, 0]} />
          <object3D ref={bookAnchor} position={[0, -built.chainLen, 0]} />
        </group>
      </group>
    </group>
  )
}

/**
 * Clean stand-in shown only if the .glb is missing/invalid. Deliberately plain
 * so it reads as a placeholder, not a finished design.
 */
function PlaceholderNotebook() {
  return (
    <RoundedBox args={[2.6, 3.4, 0.3]} radius={0.1} smoothness={4}>
      <meshStandardMaterial color="#16171c" metalness={0.6} roughness={0.5} />
    </RoundedBox>
  )
}

useGLTF.preload(MODEL_URL)
