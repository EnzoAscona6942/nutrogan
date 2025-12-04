<template>
  <div
    class="logo-canvas-wrapper"
    ref="containerRef"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <canvas ref="canvasRef"></canvas>

    <img ref="imgRef" src="/images/nutrogan-outline.png" style="display: none" @load="initCanvas" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const containerRef = ref(null)
const canvasRef = ref(null)
const imgRef = ref(null)
let ctx = null
let animationId = null

// --- CONFIGURACIÓN ---
const BASE_SIZE = 100 // Tamaño base del logo en px
const GLOW_COLOR = '#39ff14' // Verde Neón

// Estado
let mouse = { x: -100, y: -100 }
let isHovering = false
let energyLevel = 0 // 0 a 1 (animación de transición)

function draw() {
  if (!ctx || !canvasRef.value || !imgRef.value) return

  const w = canvasRef.value.width
  const h = canvasRef.value.height
  const centerX = w / 2
  const centerY = h / 2

  ctx.clearRect(0, 0, w, h)

  // Interpolación suave de energía
  const targetEnergy = isHovering ? 1 : 0
  energyLevel += (targetEnergy - energyLevel) * 0.1

  ctx.save()
  ctx.translate(centerX, centerY)

  // 1. Efecto de "Ola" magnética hacia el mouse
  const dx = mouse.x - centerX
  const dy = mouse.y - centerY
  const maxDist = 200

  // Desplazamiento sutil (Parallax)
  const moveX = (dx / maxDist) * 15 * energyLevel
  const moveY = (dy / maxDist) * 15 * energyLevel
  ctx.translate(moveX, moveY)

  // 2. Escala (Latido "Vivo")
  // Se hace más grande y respira cuando el mouse está encima
  const breath = Math.sin(Date.now() / 300) * 0.05 * energyLevel
  const scale = 1 + energyLevel * 0.2 + breath
  ctx.scale(scale, scale)

  // 3. Dibujo y Efectos

  // Sombra / Glow (Solo si hay energía)
  if (energyLevel > 0.01) {
    ctx.shadowBlur = 30 * energyLevel
    ctx.shadowColor = GLOW_COLOR
  } else {
    ctx.shadowBlur = 0
  }

  // Dibujar la imagen centrada
  // Calculamos dimensiones manteniendo el ratio
  const aspectRatio = imgRef.value.naturalWidth / imgRef.value.naturalHeight
  const drawH = BASE_SIZE
  const drawW = BASE_SIZE * aspectRatio

  // Si la imagen es verde, al dibujarla con shadowColor verde se verá "super cargada"
  // Para hacerla blanca en reposo, necesitaríamos filtros complejos o una imagen blanca separada.
  // Asumimos que el PNG es el contorno verde neón que subiste.

  // Truco: En reposo bajamos la opacidad para que no compita tanto
  ctx.globalAlpha = 0.6 + 0.4 * energyLevel

  ctx.drawImage(imgRef.value, -drawW / 2, -drawH / 2, drawW, drawH)

  // 4. Efecto de "Scanline" o Brillo extra al pasar el mouse
  if (energyLevel > 0.1) {
    ctx.globalCompositeOperation = 'source-atop' // Solo dibuja SOBRE la imagen existente

    // Un brillo blanco que pasa rápido
    const time = Date.now() / 800
    const grad = ctx.createLinearGradient(-drawW, -drawH, drawW, drawH)
    const stop = (Math.sin(time) + 1) / 2 // Oscila 0 a 1

    grad.addColorStop(Math.max(0, stop - 0.2), 'transparent')
    grad.addColorStop(stop, 'rgba(255, 255, 255, 0.6)') // Brillo blanco
    grad.addColorStop(Math.min(1, stop + 0.2), 'transparent')

    ctx.fillStyle = grad
    ctx.fillRect(-drawW / 2, -drawH / 2, drawW, drawH)

    ctx.globalCompositeOperation = 'source-over' // Reset
  }

  ctx.restore()

  animationId = requestAnimationFrame(draw)
}

function handleMouseMove(e) {
  const rect = containerRef.value.getBoundingClientRect()
  // Coordenadas relativas al canvas (ajustadas por DPR si fuera necesario, pero aquí simplificamos)
  // Nota: Si el canvas tiene escala DPR, hay que ajustar.
  // En este componente simple, usamos coordenadas visuales CSS.
  const dpr = window.devicePixelRatio || 1
  mouse.x = (e.clientX - rect.left) * dpr
  mouse.y = (e.clientY - rect.top) * dpr
  isHovering = true
}

function handleMouseLeave() {
  isHovering = false
}

function initCanvas() {
  if (!containerRef.value || !canvasRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1

  // Configurar tamaño real en memoria (HiDPI)
  canvasRef.value.width = rect.width * dpr
  canvasRef.value.height = rect.height * dpr

  ctx = canvasRef.value.getContext('2d')
  // No escalamos el contexto globalmente porque queremos control total en draw()

  draw()
}

onMounted(() => {
  // Si la imagen ya está cargada (caché), iniciamos. Si no, el @load lo hará.
  if (imgRef.value && imgRef.value.complete) {
    initCanvas()
  }
  window.addEventListener('resize', initCanvas)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', initCanvas)
  cancelAnimationFrame(animationId)
})
</script>

<style scoped>
.logo-canvas-wrapper {
  width: 100%;
  height: 140px; /* Espacio reservado para el logo */
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  /* Un poco de padding para que el glow no se corte */
  overflow: visible;
}

canvas {
  width: 100%;
  height: 100%;
  /* Asegura que se vea nítido */
  image-rendering: -webkit-optimize-contrast;
}
</style>
