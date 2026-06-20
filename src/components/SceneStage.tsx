import { Suspense, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, type MotionValue } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import styles from './SceneStage.module.css'

/**
 * SceneStage — a single cinematic chapter.
 *
 * Three backdrop modes:
 *   1. "image"   — AI-generated stills (Midjourney/Flux). Subtle scroll parallax.
 *   2. "video"   — Looping clips from real work. Lazy-load, autoplay muted.
 *   3. "model3d" — Mouse-reactive GLB exports from Blender. Tilts with cursor.
 *
 * Each scene fills the viewport. The orchestrator (ScrollChapters) stacks them
 * with sticky-pin transitions so scrolling crossfades one into the next.
 */

export type SceneType = 'image' | 'video' | 'model3d' | 'placeholder'

/**
 * Where the text overlay sits relative to the backdrop.
 *  - 'center' : big title-card style. Heading is huge, vertically centred.
 *               Best for atmospheric / abstract video where the BACKDROP is
 *               more mood than detail.
 *  - 'corner' : film-subtitle style. Heading is smaller, anchored bottom-left.
 *               Best for detail-rich video that needs to BREATHE.
 */
export type TextPlacement = 'center' | 'corner'

export interface SceneStageProps {
  /** Visual asset type */
  type: SceneType
  /** Path to image (jpg/webp/avif) or video (mp4/webm) or GLB model */
  src?: string
  /** Optional poster for video (shows before play) */
  poster?: string
  /** Short label shown at the top — e.g. "01 / STUDIO" */
  label?: string
  /** Main overlay text (large display type) */
  heading?: string
  /** Optional sub-line below heading */
  subheading?: string
  /** Bottom-aligned caption (mono small) */
  caption?: string
  /** Mouse-reactive parallax intensity for 3D models (default 0.15) */
  parallaxStrength?: number
  /** Scroll progress (0-1) from parent — drives opacity / scale */
  scrollProgress?: MotionValue<number>
  /** Mouse normalized position (-1 to 1 for both axes) */
  mouse?: { x: number; y: number }
  /** Layout of text overlay. Default 'center'. */
  textPlacement?: TextPlacement
}

export function SceneStage({
  type,
  src,
  poster,
  label,
  heading,
  subheading,
  caption,
  parallaxStrength = 0.15,
  scrollProgress,
  mouse = { x: 0, y: 0 },
  textPlacement = 'center',
}: SceneStageProps) {
  const stageRef = useRef<HTMLDivElement>(null)

  /** Local scroll progress drives the backdrop's own parallax + opacity */
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start end', 'end start'],
  })
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 30 })

  // Subtle backdrop parallax (the chapter wrapper in ScrollChapters owns the
  // bigger movements; keep this gentle to avoid compounding into jitter)
  const backdropY = useTransform(smooth, [0, 1], ['-4%', '4%'])
  // No text parallax — the chapter wrapper handles overall motion
  const textY = useTransform(smooth, [0, 1], ['0%', '0%'])
  // Fade only matters in standalone use; ScrollChapters overrides via scrollProgress
  const fadeIn = useTransform(smooth, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  // External scroll progress (from parent ScrollChapters) takes priority
  const effectiveOpacity = scrollProgress ?? fadeIn

  return (
    <div ref={stageRef} className={styles.stage}>
      {/* ── Backdrop layer ── */}
      <motion.div
        className={styles.backdrop}
        style={{ y: backdropY }}
      >
        {type === 'image' && src ? (
          <img
            src={src}
            alt={heading ?? ''}
            className={styles.media}
            loading="lazy"
          />
        ) : null}

        {type === 'video' && src ? (
          <video
            className={styles.media}
            src={src}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : null}

        {type === 'model3d' && src ? (
          <div className={styles.modelWrap}>
            <Canvas
              dpr={[1, 2]}
              camera={{ position: [0, 0, 5], fov: 38 }}
              gl={{ antialias: true, alpha: true }}
            >
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 5, 5]} intensity={2} color="#fff" />
              <pointLight position={[-4, -2, 3]} intensity={2} color="#ff4500" distance={10} />
              <Environment preset="warehouse" />
              <Suspense fallback={null}>
                <GLBModel src={src} mouse={mouse} parallaxStrength={parallaxStrength} />
              </Suspense>
            </Canvas>
          </div>
        ) : null}

        {type === 'placeholder' ? (
          <SceneePlaceholder />
        ) : null}
      </motion.div>

      {/* ── Dark wash for legibility ── */}
      <div className={styles.wash} />

      {/* ── Text overlay ── */}
      <motion.div
        className={`${styles.textLayer} ${textPlacement === 'corner' ? styles.textCorner : ''}`}
        style={{ y: textY, opacity: effectiveOpacity }}
      >
        {label ? (
          <div className={styles.labelRow}>
            <span className="t-label">{label}</span>
          </div>
        ) : null}
        {heading ? (
          <h2 className={`t-display ${styles.heading}`}>{heading}</h2>
        ) : null}
        {subheading ? (
          <p className={`t-body ${styles.subheading}`}>{subheading}</p>
        ) : null}
        {caption ? (
          <span className={`t-mono ${styles.caption}`}>{caption}</span>
        ) : null}
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   GLBModel — loads a Blender export and tilts with mouse.
   The model is the "react-to-mouse" piece the user wanted.
   ───────────────────────────────────────────── */
function GLBModel({ src, mouse, parallaxStrength }: { src: string; mouse: { x: number; y: number }; parallaxStrength: number }) {
  const { scene } = useGLTF(src)
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!groupRef.current) return
    // Idle slow rotation — keeps the model alive even when mouse is still
    groupRef.current.rotation.y += delta * 0.06

    // Mouse-reactive tilt — lerp toward target for smoothness
    const targetX = mouse.y * parallaxStrength
    const targetY = mouse.x * parallaxStrength * 1.4
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05
    groupRef.current.rotation.z += (targetY * 0.3 - groupRef.current.rotation.z) * 0.05
  })

  return <primitive ref={groupRef} object={scene} />
}

/* ─────────────────────────────────────────────
   Placeholder — minimal backdrop while asset is pending.
   No duplicated text — the textLayer owns the heading/label rendering.
   This block just provides diagonal stripes + a subtle warning tag.
   ───────────────────────────────────────────── */
function SceneePlaceholder() {
  return (
    <div className={styles.placeholder}>
      {/* Diagonal workshop stripes — "in progress" vibe */}
      <div className={styles.stripes} aria-hidden />
    </div>
  )
}
