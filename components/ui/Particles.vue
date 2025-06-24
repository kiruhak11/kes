<template>
  <div class="particles-bg" aria-hidden="true" ref="containerRef">
    <div
      v-for="p in particles"
      :key="p.id"
      class="particle"
      :style="{
        left: p.x + 'px',
        top: p.y + 'px',
        width: p.size + 'px',
        height: p.size + 'px',
        background: `radial-gradient(circle, #fffbe6 0%, #ffe082 40%, ${p.color} 80%, transparent 100%)`,
        opacity: p.opacity * 0.7,
        boxShadow: `0 0 4px 1px #fffbe6, 0 0 8px 2px ${p.color}, 0 0 16px 4px #ff6d0055` + (p.isBig ? ', 0 0 12px 4px #fff' : ''),
        borderRadius: '50%',
        position: 'absolute',
        pointerEvents: 'none',
        zIndex: 0,
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  ax: number
  ay: number
  size: number
  color: string
  opacity: number
  life: number
  maxLife: number
  isBig: boolean
}

const ORANGE_COLORS = [
  '#ff9800', '#ffb300', '#ff6d00', '#ffae42', '#ffcc80'
]

const PARTICLE_COUNT = 40
const particles = ref<Particle[]>([])
const width = ref(0)
const height = ref(0)
const left = ref(0)
const top = ref(0)
const containerRef = ref<HTMLElement | null>(null)

function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function updateBounds() {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()
    width.value = rect.width
    height.value = rect.height
    left.value = rect.left
    top.value = rect.top
  }
}

function createParticle(id: number): Particle {
  // Старт только внутри футера
  const x0 = random(0, width.value)
  const y0 = random(0, height.value)
  const angle = random(0, Math.PI * 2)
  const speed = random(1.5, 5)
  const vx = Math.cos(angle) * speed + random(-0.3, 0.3)
  const vy = Math.sin(angle) * speed + random(-0.3, 0.3)
  const ax = random(-0.01, 0.01)
  const ay = random(-0.01, 0.01)
  const isBig = Math.random() < 0.08
  const size = isBig ? random(2.5, 4) : random(1, 2.2)
  const color = ORANGE_COLORS[Math.floor(random(0, ORANGE_COLORS.length))]
  const maxLife = random(55, 95)
  return {
    id,
    x: x0,
    y: y0,
    vx,
    vy,
    ax,
    ay,
    size,
    color,
    opacity: 0,
    life: 0,
    maxLife,
    isBig
  }
}

function resetParticle(p: Particle) {
  const np = createParticle(p.id)
  Object.assign(p, np)
}

function animate() {
  for (const p of particles.value) {
    p.life++
    if (p.life < 8) {
      p.opacity = p.life / 8
    } else if (p.life > p.maxLife - 15) {
      p.opacity = Math.max(0, (p.maxLife - p.life) / 15)
    } else {
      p.opacity = 1
    }
    p.x += p.vx
    p.y += p.vy
    p.vx += p.ax
    p.vy += p.ay
    if (p.size > 0.7) p.size *= 0.992
    if (
      p.life > p.maxLife ||
      p.opacity <= 0.01 ||
      p.x < 0 || p.x > width.value ||
      p.y < 0 || p.y > height.value
    ) {
      resetParticle(p)
    }
  }
  requestAnimationFrame(animate)
}

function handleResize() {
  updateBounds()
}

onMounted(() => {
  updateBounds()
  window.addEventListener('resize', handleResize)
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.value.push(createParticle(i))
  }
  animate()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.particles-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
  background: transparent;
}
.particle {
  position: absolute;
  will-change: transform, opacity, width, height;
}
</style> 