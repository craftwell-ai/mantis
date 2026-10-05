"use client"

import * as React from "react"

import { EYE_CENTERS, EYE_OPENINGS, MANTIS_PATH } from "./mantis-shape"

// One loop of the "Awakening" animation, in seconds.
const LOOP = 12
const OUTLINE_DRAWN = 2.4
const IGNITE = 0.9
const FADE_START = 11.3
// The logo's own coordinates: the size of the mark and the point that sits at the canvas centre.
const MARK = { width: 386, height: 361, centerX: 335, centerY: 392 }
// Long enough to trace the whole outline with one dash.
const OUTLINE_LENGTH = 5200

type Rgb = readonly [number, number, number]
type Particle = { x: number; y: number; depth: number; phase: number; spark: boolean }

function toRgb(value: string, fallback: Rgb): Rgb {
  const hex = value.trim().replace("#", "")
  if (hex.length !== 6) return fallback
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)]
}

const paint = ([r, g, b]: Rgb, alpha: number) => `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha)).toFixed(3)})`

/** The full-bleed hero background: a lime outline draws the mantis, its eyes light up, particles rise. */
function HeroCanvas({ className }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return

    // Colors come from the page's CSS so the canvas follows the tokens (and the home page exceptions).
    const styles = getComputedStyle(canvas)
    const read = (name: string, fallback: Rgb) => toRgb(styles.getPropertyValue(name), fallback)
    const lime = read("--brand", [209, 254, 23])
    const colors = {
      lime,
      spark: read("--home-spark", lime),
      void: read("--home-void", [11, 12, 14]),
      ink: read("--home-ink", [8, 9, 10]),
      eyeCore: read("--home-eye-core", lime),
      eyeEdge: read("--home-eye-edge", lime),
    }

    const outline = new Path2D(MANTIS_PATH)
    const particles: Particle[] = Array.from({ length: 260 }, () => ({
      x: Math.random(),
      y: Math.random(),
      depth: 0.2 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      spark: Math.random() >= 0.8,
    }))
    let lastTime: number | null = null

    function draw(time: number) {
      if (!canvas || !context) return
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (!width || !height) return
      if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
        canvas.width = Math.round(width * ratio)
        canvas.height = Math.round(height * ratio)
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.globalCompositeOperation = "source-over"
      context.fillStyle = paint(colors.void, 1)
      context.fillRect(0, 0, width, height)

      const t = time % LOOP
      const scale = Math.min((width * 0.9) / MARK.width, (height * 1.05) / MARK.height)
      const offsetX = width * 0.5 - MARK.centerX * scale
      const offsetY = height * 0.5 - MARK.centerY * scale
      const awake = t >= OUTLINE_DRAWN
      const energy = awake ? 1 : 0.4
      const delta = Math.min(0.05, Math.max(0, time - (lastTime ?? time)))
      lastTime = time

      // Particles rise and sway; depth drives size, speed and brightness.
      context.globalCompositeOperation = "lighter"
      for (const particle of particles) {
        particle.y -= delta * (0.01 + particle.depth * 0.045) * (1 + energy)
        particle.x += delta * Math.sin(time * 0.6 + particle.phase) * 0.01 * particle.depth
        if (particle.y < -0.05) {
          particle.y = 1.05
          particle.x = Math.random()
        }
        const twinkle = 0.5 + 0.5 * Math.sin(time * (1.5 + particle.depth * 3) + particle.phase * 5)
        const alpha = (0.08 + particle.depth * 0.5) * (0.4 + twinkle * 0.6) * (0.5 + energy * 0.5)
        context.fillStyle = particle.spark ? paint(colors.spark, alpha * 0.8) : paint(colors.lime, alpha)
        context.beginPath()
        context.arc(particle.x * width, particle.y * height, 0.6 + particle.depth * 1.8, 0, Math.PI * 2)
        context.fill()
      }
      context.globalCompositeOperation = "source-over"

      // Eyes: a neon flicker as they ignite, then a slow breath, with one blink late in the loop.
      let eye = 0
      if (awake) {
        const since = t - OUTLINE_DRAWN
        eye = since < IGNITE ? (Math.sin(since * 60) > 0.2 ? 0.4 + since * 0.6 : 0.1) : 0.85 + Math.sin(time * 2.2) * 0.15
        if (t > 8.2 && t < 8.4) eye *= 0.1
      }
      const ignition = awake ? Math.min(1, (t - OUTLINE_DRAWN) / IGNITE) : 0
      const drawn = Math.min(1, t / OUTLINE_DRAWN)

      context.save()
      context.translate(offsetX, offsetY)
      context.scale(scale, scale)
      if (eye > 0) {
        EYE_OPENINGS.forEach((opening, index) => {
          const [x, y] = EYE_CENTERS[index]
          context.save()
          // Clip to the opening so the bright fill ends in a straight line across the gap.
          context.beginPath()
          opening.forEach(([pointX, pointY], point) => (point ? context.lineTo(pointX, pointY) : context.moveTo(pointX, pointY)))
          context.closePath()
          context.clip()
          const glow = context.createRadialGradient(x, y, 0, x, y, 44)
          glow.addColorStop(0, paint(colors.eyeCore, eye))
          glow.addColorStop(0.45, paint(colors.lime, eye * 0.9))
          glow.addColorStop(1, paint(colors.eyeEdge, eye * 0.55))
          context.fillStyle = glow
          context.fillRect(x - 70, y - 70, 140, 140)
          context.restore()
        })
      }
      if (ignition > 0) {
        context.fillStyle = paint(colors.ink, ignition)
        context.fill(outline, "evenodd")
      }
      context.setLineDash([OUTLINE_LENGTH * drawn, 6000])
      context.lineJoin = "round"
      context.strokeStyle = paint(colors.lime, awake ? 0.28 + Math.sin(time * 2.2) * 0.08 : 0.8)
      context.lineWidth = 1.4 / scale
      context.stroke(outline)
      context.setLineDash([])
      context.restore()

      // A soft bloom around each eye, allowed to spill past the openings.
      if (eye > 0) {
        context.globalCompositeOperation = "lighter"
        for (const [x, y] of EYE_CENTERS) {
          const centerX = offsetX + x * scale
          const centerY = offsetY + y * scale
          const radius = 130 * scale
          const bloom = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
          bloom.addColorStop(0, paint(colors.lime, 0.25 * eye))
          bloom.addColorStop(1, paint(colors.lime, 0))
          context.fillStyle = bloom
          context.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2)
        }
        context.globalCompositeOperation = "source-over"
      }
      if (t > FADE_START) {
        context.fillStyle = paint(colors.void, (t - FADE_START) / (LOOP - FADE_START))
        context.fillRect(0, 0, width, height)
      }
    }

    const safeDraw = (time: number) => {
      try {
        draw(Math.max(0, time))
      } catch {
        // A failed frame must never take the page down; the next frame tries again.
      }
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduceMotion) {
      // One still frame with the eyes lit, redrawn only when the canvas changes size.
      safeDraw(6)
      const resize = new ResizeObserver(() => safeDraw(6))
      resize.observe(canvas)
      return () => resize.disconnect()
    }

    // Draw once straight away so the hero is never blank, then animate while it is on screen.
    safeDraw(0.001)
    let frame = 0
    let visible = true
    let elapsed = 0
    let previous: number | null = null
    const loop = (now: number) => {
      elapsed += previous === null ? 0 : Math.min(0.1, (now - previous) / 1000)
      previous = now
      safeDraw(elapsed + 0.001)
      if (visible) frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    const visibility = new IntersectionObserver(([entry]) => {
      const nowVisible = entry.isIntersecting
      if (nowVisible && !visible) {
        previous = null
        frame = requestAnimationFrame(loop)
      }
      visible = nowVisible
    })
    visibility.observe(canvas)
    return () => {
      cancelAnimationFrame(frame)
      visibility.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />
}

export { HeroCanvas }
