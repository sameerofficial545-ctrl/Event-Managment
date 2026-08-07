import { useEffect, useRef } from 'react'

// [core color, highlight color] - core dots use the accent purple in both
// variants; the highlight color is what reads well against that specific
// background (near-white sparkle on dark, deeper violet on light).
const PALETTES = {
  dark: ['rgba(255,255,255,OPACITY)', 'rgba(216,180,254,OPACITY)'],
  light: ['rgba(170,59,255,OPACITY)', 'rgba(111,75,255,OPACITY)'],
}

function ParticleField({ variant = 'light', density = 55, fixed = false, className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = fixed ? null : canvas.parentElement
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d')
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const palette = PALETTES[variant] || PALETTES.light
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let width = 0
    let height = 0
    let particles = []
    let offsetX = 0
    let offsetY = 0
    let targetX = 0
    let targetY = 0
    let rafId = null
    let running = false

    const getSize = () =>
      fixed
        ? { width: window.innerWidth, height: window.innerHeight }
        : { width: container.clientWidth, height: container.clientHeight }

    function resize() {
      const size = getSize()
      width = size.width
      height = size.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function makeParticle() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + 0.5,
        speed: Math.random() * 0.3 + 0.08,
        drift: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.45 + 0.12,
        hue: Math.random() < 0.72 ? 0 : 1,
      }
    }

    function seed() {
      resize()
      const area = width * height
      const count = Math.min(density, Math.max(10, Math.round(area / 16000)))
      particles = Array.from({ length: count }, makeParticle)
    }

    function draw() {
      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        const x = p.x + offsetX
        const y = p.y + offsetY
        const color = palette[p.hue].replace('OPACITY', p.opacity)
        ctx.beginPath()
        ctx.fillStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = p.r * 4.5
        ctx.arc(x, y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function tick() {
      if (!running) return
      offsetX += (targetX - offsetX) * 0.045
      offsetY += (targetY - offsetY) * 0.045

      for (const p of particles) {
        p.y -= p.speed
        p.x += p.drift
        if (p.y < -8) {
          p.y = height + 8
          p.x = Math.random() * width
        }
        if (p.x < -8) p.x = width + 8
        if (p.x > width + 8) p.x = -8
      }

      draw()
      rafId = requestAnimationFrame(tick)
    }

    function handlePointerMove(event) {
      const rect = fixed
        ? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
        : container.getBoundingClientRect()
      const relX = (event.clientX - rect.left) / rect.width - 0.5
      const relY = (event.clientY - rect.top) / rect.height - 0.5
      targetX = relX * -10
      targetY = relY * -10
    }

    function start() {
      if (running) return
      running = true
      rafId = requestAnimationFrame(tick)
    }

    function stop() {
      running = false
      if (rafId) cancelAnimationFrame(rafId)
      rafId = null
    }

    function handleVisibility() {
      if (document.visibilityState === 'visible' && !prefersReducedMotion) start()
      else stop()
    }

    seed()

    if (prefersReducedMotion) {
      draw()
    } else {
      start()
      window.addEventListener('mousemove', handlePointerMove, { passive: true })
    }
    document.addEventListener('visibilitychange', handleVisibility)

    const target = fixed ? window : container
    const handleResize = () => seed()
    let resizeObserver
    if (fixed) {
      window.addEventListener('resize', handleResize)
    } else {
      resizeObserver = new ResizeObserver(handleResize)
      resizeObserver.observe(container)
    }

    return () => {
      stop()
      window.removeEventListener('mousemove', handlePointerMove)
      document.removeEventListener('visibilitychange', handleVisibility)
      if (fixed) window.removeEventListener('resize', handleResize)
      else resizeObserver?.disconnect()
      void target
    }
  }, [variant, density, fixed])

  return (
    <canvas
      ref={canvasRef}
      className={`particle-field ${fixed ? 'particle-field--fixed' : ''} ${className}`}
      aria-hidden="true"
    />
  )
}

export default ParticleField
