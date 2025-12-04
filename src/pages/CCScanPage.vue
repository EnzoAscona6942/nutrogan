<template>
  <q-page class="fullscreen bg-dark text-white" padding>
    <video ref="videoEl" autoplay playsinline class="camera-feed"></video>

    <div class="scanner-ui" v-if="!scanCompleto">
      <q-header elevated class="bg-transparent">
        <q-toolbar>
          <q-btn flat round dense icon="arrow_back" @click="$router.back()" />
          <q-toolbar-title>Escanear CC (Lote: {{ lote?.identificacion }})</q-toolbar-title>
        </q-toolbar>
      </q-header>

      <div class="scanner-overlay">
        <div class="viewfinder"></div>
        <div class="scanner-line"></div>
        <div class="scanner-text text-center q-mt-xl">
          <q-spinner-puff color="white" size="3em" />
          <div class="text-h6 q-mt-md">{{ scanStatus }}</div>
        </div>
      </div>
    </div>

    <q-dialog :model-value="scanCompleto" persistent full-width full-height class="result-dialog">
      <q-card class="bg-dark text-white">
        <q-form @submit.prevent="guardarEvaluacion">
          <q-card-section>
            <div class="text-h4 text-center">Escaneo Completo</div>
            <div class="text-subtitle1 text-center text-primary">{{ lote?.identificacion }}</div>
          </q-card-section>

          <q-card-section class="text-center">
            <div class="text-caption">Resultado de la simulación (TensorFlow.js)</div>
            <div class="text-h1 text-positive text-weight-bolder q-my-md">
              {{ form.condicion_corporal }}
            </div>
            <div class="text-h6">Condición Corporal (1-9)</div>

            <q-rating
              v-model="form.condicion_corporal"
              max="9"
              size="3.5em"
              color="positive"
              icon="star_border"
              icon-selected="star"
              class="q-mt-md"
            />
          </q-card-section>

          <q-card-section class="q-gutter-md q-px-lg">
            <q-input
              v-model="form.fecha_evaluacion"
              type="date"
              label="Fecha de Evaluación"
              stack-label
              filled
              dark
              color="white"
              :rules="[(val) => !!val || 'Requerido']"
            />
            <q-input
              v-model="form.observaciones"
              type="textarea"
              label="Observaciones (Opcional)"
              filled
              dark
              color="white"
            />
          </q-card-section>

          <q-card-actions class="absolute-bottom q-pa-md">
            <q-btn label="Descartar" flat color="white" @click="reiniciarEscaneo" class="col" />
            <q-btn
              label="Guardar Evaluación"
              type="submit"
              color="positive"
              size="lg"
              icon="save"
              :loading="loading"
              :disable="!form.condicion_corporal"
              class="col"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDataStore } from 'stores/data-store'
import { useQuasar } from 'quasar'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const dataStore = useDataStore()

const loteId = route.params.id
const lote = ref(null)
const videoEl = ref(null)
const videoStream = ref(null)

const scanStatus = ref('Iniciando cámara...')
const scanCompleto = ref(false)
const loading = ref(false)

const form = ref({
  lote_id: loteId,
  fecha_evaluacion: new Date().toISOString().split('T')[0],
  peso_promedio_kg: null,
  condicion_corporal: 5,
  observaciones: 'Evaluación CC (Escáner)',
})

// --- LÓGICA DE CÁMARA ---

async function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    $q.notify({ type: 'negative', message: 'Tu dispositivo no soporta el acceso a la cámara.' })
    router.back()
    return
  }

  try {
    // Pedir la cámara trasera (ideal para celulares)
    const constraints = {
      video: { facingMode: 'environment' },
    }
    videoStream.value = await navigator.mediaDevices.getUserMedia(constraints)

    if (videoEl.value) {
      videoEl.value.srcObject = videoStream.value
    }

    // Iniciar la simulación de escaneo
    simularEscaneo()
  } catch (err) {
    console.error('Error al acceder a la cámara:', err)
    $q.notify({ type: 'negative', message: 'No se pudo acceder a la cámara. ¿Diste permiso?' })
    // Si falla 'environment' (ej. en una PC), intentar con cualquier cámara
    try {
      const anyCameraConstraints = { video: true }
      videoStream.value = await navigator.mediaDevices.getUserMedia(anyCameraConstraints)
      if (videoEl.value) videoEl.value.srcObject = videoStream.value
      simularEscaneo()
    } catch {
      router.back()
    }
  }
}

function stopCamera() {
  if (videoStream.value) {
    videoStream.value.getTracks().forEach((track) => {
      track.stop()
    })
  }
}

function simularEscaneo() {
  scanStatus.value = 'Apuntando al lomo del animal...'
  setTimeout(() => {
    scanStatus.value = 'Detectando curvatura...'
  }, 2000)

  setTimeout(() => {
    scanStatus.value = 'Analizando con TensorFlow.js...'
  }, 4000)

  setTimeout(() => {
    // Simulación completada
    // Generar un resultado ficticio (entre 4 y 7)
    form.value.condicion_corporal = Math.floor(Math.random() * 4) + 4
    scanCompleto.value = true
    stopCamera() // Apagar la cámara al mostrar el resultado
  }, 6000)
}

function reiniciarEscaneo() {
  scanCompleto.value = false
  startCamera() // Encender la cámara de nuevo
}

async function guardarEvaluacion() {
  loading.value = true
  try {
    await dataStore.createRegistro('evaluaciones', form.value)
    $q.notify({
      type: 'positive',
      message: 'Condición Corporal guardada',
      caption: `Lote: ${lote.value.identificacion}, CC: ${form.value.condicion_corporal}`,
    })
    router.back()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar',
      caption: error.message,
    })
  } finally {
    loading.value = false
  }
}

// --- LIFECYCLE ---
onMounted(async () => {
  // Cargar los datos del lote que estamos escaneando
  if (dataStore.lotes.length === 0) {
    await dataStore.fetchLotes()
  }
  const loteEncontrado = dataStore.lotes.find((l) => l.id === loteId)
  if (loteEncontrado) {
    lote.value = loteEncontrado
    startCamera()
  } else {
    $q.notify({ type: 'negative', message: 'Error: No se encontró el lote' })
    router.back()
  }
})

onBeforeUnmount(() => {
  stopCamera()
})
</script>

<style lang="scss" scoped>
.camera-feed {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover; // Cubre toda la pantalla
  z-index: 0;
}

.scanner-ui {
  position: relative;
  z-index: 1;
  height: 100%;
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
}

// Retícula de escaneo
.viewfinder {
  width: 80vw;
  max-width: 400px;
  height: 250px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6); // "Recorta" el fondo
}

// Línea de escaneo animada
.scanner-line {
  width: 80vw;
  max-width: 400px;
  height: 3px;
  background: $primary;
  box-shadow: 0 0 10px $primary;
  border-radius: 3px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: scan 3s linear infinite;
}

@keyframes scan {
  0% {
    transform: translate(-50%, -125px); // (height / 2)
  }
  50% {
    transform: translate(-50%, 125px); // -(height / 2)
  }
  100% {
    transform: translate(-50%, -125px);
  }
}

.scanner-text {
  position: absolute;
  bottom: 15vh;
}

// Diálogo de resultado
.result-dialog {
  backdrop-filter: none; // Quitar doble filtro
  :deep(.q-card) {
    background: rgba(0, 0, 0, 0.9);
  }
}
</style>
