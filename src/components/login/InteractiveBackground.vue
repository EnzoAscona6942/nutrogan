<template>
  <canvas ref="canvasRef" class="interactive-bg"></canvas>
  <img
    ref="logoImageRef"
    src="/images/nutrogan-outline.png"
    style="display: none"
    @load="onImageLoad"
  />
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'

const canvasRef = ref(null)
const logoImageRef = ref(null)
let ctx = null
let animationFrameId = null
let dots = []
let isImageLoaded = false
let logoAspectRatio = 1


const coloredLogos = {}
let whiteLogo = null


const SPACING = 50
const MOUSE_RADIUS = 180
const BASE_OPACITY = 0.02
const BASE_SIZE = 8


const COLORS = ['#001eff', '#0054ff']

const mouse = { x: -1000, y: -1000 }


function tintImage(img, color) {
  const buffer = document.createElement('canvas')
  buffer.width = img.naturalWidth || img.width
  buffer.height = img.naturalHeight || img.height
  const bx = buffer.getContext('2d')


  bx.drawImage(img, 0, 0)


  bx.globalCompositeOperation = 'source-in'
  bx.fillStyle = color
  bx.fillRect(0, 0, buffer.width, buffer.height)

  return buffer
}

class Dot {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.baseX = x
    this.baseY = y
    this.size = BASE_SIZE
    this.baseSize = BASE_SIZE
    this.angle = 0
    this.opacity = BASE_OPACITY

    // Asignar un color de la paleta a esta partícula
    this.colorHex = COLORS[Math.floor(Math.random() * COLORS.length)]
  }

  draw() {
    if (!isImageLoaded || !whiteLogo) return

    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.angle)
    ctx.globalAlpha = this.opacity

    const w = this.size * logoAspectRatio
    const h = this.size

    // LÓGICA DE COLOR:
    // Si está activo (cerca del mouse), usamos su versión coloreada.
    // Si está en reposo, usamos la versión blanca/gris sutil.

    let imgToDraw = whiteLogo // Por defecto blanco sutil

    // Si la opacidad sube (significa que el mouse está cerca), cambiamos al color
    if (this.opacity > 0.2) {
      imgToDraw = coloredLogos[this.colorHex]
      // Agregamos un glow extra del mismo color
      ctx.shadowBlur = 15
      ctx.shadowColor = this.colorHex
    }

    ctx.drawImage(imgToDraw, -w / 2, -h / 2, w, h)

    ctx.restore()
  }

  update() {
    const dx = mouse.x - this.baseX
    const dy = mouse.y - this.baseY
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < MOUSE_RADIUS) {
      const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS

      // Reacción: Crecer y volverse opaco (y coloreado)
      this.size = this.baseSize + force * 12
      this.opacity = 0.2 + force * 0.8 // Hasta 1.0 de opacidad
      this.angle = force * 0.4

      const angleMove = Math.atan2(dy, dx)
      const moveDistance = force * 40
      this.x = this.baseX + Math.cos(angleMove) * moveDistance
      this.y = this.baseY + Math.sin(angleMove) * moveDistance
    } else {
      // Retorno suave
      if (this.size > this.baseSize) this.size -= 0.5
      if (this.opacity > BASE_OPACITY) this.opacity -= 0.02
      if (Math.abs(this.angle) > 0.001) this.angle *= 0.92

      const returnSpeed = 0.05
      if (Math.abs(this.x - this.baseX) > 0.1) this.x -= (this.x - this.baseX) * returnSpeed
      if (Math.abs(this.y - this.baseY) > 0.1) this.y -= (this.y - this.baseY) * returnSpeed
    }

    this.draw()
  }
}

function init() {
  dots = []
  if (!canvasRef.value) return

  const w = canvasRef.value.width
  const h = canvasRef.value.height

  const cols = Math.floor(w / SPACING)
  const rows = Math.floor(h / SPACING)

  // Centrar la grilla
  const startX = (w - cols * SPACING) / 2
  const startY = (h - rows * SPACING) / 2

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      // Offset aleatorio para que se vea orgánico
      const offsetX = (Math.random() - 0.5) * 15
      const offsetY = (Math.random() - 0.5) * 15
      dots.push(new Dot(startX + x * SPACING + offsetX, startY + y * SPACING + offsetY))
    }
  }
}

function animate() {
  animationFrameId = requestAnimationFrame(animate)
  if (!ctx) return
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  for (let i = 0; i < dots.length; i++) {
    dots[i].update()
  }
}

function handleMouseMove(e) {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  mouse.x = e.clientX - rect.left
  mouse.y = e.clientY - rect.top
}

function handleResize() {
  if (canvasRef.value) {
    canvasRef.value.width = window.innerWidth
    canvasRef.value.height = window.innerHeight
    init()
  }
}

function onImageLoad() {
  const img = logoImageRef.value
  if (!img) return

  logoAspectRatio = img.naturalWidth / img.naturalHeight

  // 1. Crear versión Blanca (para estado inactivo/reposo)
  whiteLogo = tintImage(img, '#ffffff')

  // 2. Crear versiones coloreadas de la paleta
  COLORS.forEach((color) => {
    coloredLogos[color] = tintImage(img, color)
  })

  isImageLoaded = true

  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    animate()
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', handleMouseMove)
  cancelAnimationFrame(animationFrameId)
})
</script>

<style scoped>
.interactive-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>
