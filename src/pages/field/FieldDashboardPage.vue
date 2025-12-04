<template>
  <q-page class="bg-field-dark text-white column">
    <div v-if="currentView === 'menu'" class="col column q-pa-md">
      <div class="row items-center bg-grey-9 q-pa-md rounded-borders border-left-neon q-mb-md">
        <q-icon name="thermostat" size="3em" color="primary" />
        <div class="column q-ml-md">
          <span class="text-h4 text-weight-bolder">{{ temperatura }}°C</span>
          <span class="text-caption text-uppercase text-grey-5">ESTABLECIMIENTO</span>
        </div>
      </div>

      <div class="col column">
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12">
            <q-btn
              class="field-btn-giant bg-grey-10 text-white border-neon"
              @click="iniciarFlujo('cc_scan')"
            >
              <div class="row items-center full-width justify-center">
                <q-icon name="camera_alt" size="4em" class="q-mr-lg text-primary" />
                <div class="column items-start">
                  <span class="text-h4 text-weight-bolder text-primary">ESCANEAR CC</span>
                  <span class="text-subtitle1 text-grey-4">CÁMARA IA</span>
                </div>
              </div>
            </q-btn>
          </div>
        </div>

        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-6">
            <q-btn class="field-btn-giant bg-primary text-black" @click="iniciarFlujo('mover')">
              <div class="column items-center">
                <q-icon name="sync_alt" size="4em" />
                <span class="text-h5 text-weight-bold q-mt-sm">MOVER</span>
              </div>
            </q-btn>
          </div>
          <div class="col-6">
            <q-btn class="field-btn-giant bg-primary text-black" @click="iniciarFlujo('peso')">
              <div class="column items-center">
                <q-icon name="straighten" size="4em" />
                <span class="text-h5 text-weight-bold q-mt-sm">PESAR</span>
              </div>
            </q-btn>
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-btn class="field-btn-giant bg-primary text-black" @click="iniciarFlujo('sanidad')">
              <div class="column items-center">
                <q-icon name="vaccines" size="4em" />
                <span class="text-h5 text-weight-bold q-mt-sm">SANIDAD</span>
              </div>
            </q-btn>
          </div>
          <div class="col-6">
            <q-btn class="field-btn-giant bg-primary text-black" @click="iniciarFlujo('alimentar')">
              <div class="column items-center">
                <q-icon name="restaurant" size="4em" />
                <span class="text-h5 text-weight-bold q-mt-sm">COMIDA</span>
              </div>
            </q-btn>
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentView === 'camera_scan'" class="col column bg-black relative-position">
      <video ref="videoRef" autoplay playsinline class="absolute-full fit object-cover"></video>
      <div
        class="absolute-full column justify-between z-10 q-pa-md"
        style="background: rgba(0, 0, 0, 0.1)"
      >
        <div class="row justify-between items-center">
          <q-btn round color="black" icon="close" size="lg" @click="stopCameraAndBack" />
          <div class="bg-black q-px-md q-py-xs rounded-borders">
            <span class="text-h6 text-white"
              >LOTE: {{ flowState.selectedLote?.identificacion }}</span
            >
          </div>
        </div>
        <div class="col flex flex-center relative-position">
          <div class="scan-reticle"></div>
          <div v-if="scanProcessing" class="absolute-center text-center">
            <q-spinner-grid color="primary" size="4em" />
            <div class="text-h5 text-weight-bold bg-black q-px-sm q-mt-sm">ANALIZANDO...</div>
          </div>
        </div>
        <div class="row justify-center q-pb-lg">
          <q-btn
            round
            color="white"
            text-color="black"
            icon="camera"
            size="35px"
            class="shadow-10"
            :disable="scanProcessing"
            @click="capturarCC"
          />
        </div>
      </div>
    </div>

    <div v-if="currentView === 'scan_result'" class="col column bg-field-dark flex flex-center">
      <div class="text-center full-width q-pa-lg">
        <div class="text-h5 text-grey-4 q-mb-lg">CONDICIÓN CORPORAL</div>
        <div class="text-display text-primary text-weight-bolder q-mb-lg" style="font-size: 8rem">
          {{ scanResultValue }}
        </div>
        <q-rating
          v-model="scanResultValue"
          max="9"
          size="4em"
          color="primary"
          icon="star_border"
          icon-selected="star"
          class="q-mb-xl"
        />
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-btn
              outline
              color="red"
              label="REINTENTAR"
              size="xl"
              class="full-width"
              @click="reintentarScan"
            />
          </div>
          <div class="col-6">
            <q-btn
              color="primary"
              text-color="black"
              label="GUARDAR"
              size="xl"
              class="full-width text-weight-bold"
              @click="guardarScanCC"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentView === 'select_lote'" class="col column">
      <div class="field-header bg-grey-9 q-pa-md row items-center">
        <q-btn flat round icon="arrow_back" size="lg" @click="currentView = 'menu'" />
        <span class="text-h5 text-weight-bold q-ml-md">SELECCIONAR LOTE</span>
      </div>
      <q-scroll-area class="col bg-field-dark">
        <div class="q-pa-md q-gutter-y-md">
          <div
            v-for="lote in dataStore.lotes"
            :key="lote.id"
            class="field-card row items-center justify-between"
            @click="seleccionarLote(lote)"
          >
            <div class="column">
              <span class="text-h3 text-weight-bolder">{{ lote.identificacion }}</span>
              <span class="text-h5 text-grey-5">{{ lote.cantidad_animales }} cabezas</span>
            </div>
            <q-icon name="chevron_right" size="4em" color="primary" />
          </div>
        </div>
      </q-scroll-area>
    </div>

    <div v-if="currentView === 'numpad_input'" class="col column bg-field-dark">
      <div class="field-header bg-grey-9 q-pa-md row items-center">
        <q-btn flat round icon="close" size="lg" @click="currentView = 'menu'" />
        <span class="text-h5 text-weight-bold q-ml-md">{{ numpadTitle }}</span>
      </div>
      <div class="col-grow row items-center justify-center border-bottom-neon q-py-lg">
        <div class="text-display text-primary">{{ numpadValue || '0' }}</div>
        <div class="text-h4 text-grey-5 q-ml-md">{{ numpadUnit }}</div>
      </div>
      <div class="col-auto q-pa-sm">
        <div class="row q-col-gutter-sm">
          <div class="col-4" v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9]" :key="n">
            <q-btn class="numpad-btn bg-grey-9 text-white" :label="n" @click="addNumpad(n)" />
          </div>
          <div class="col-4">
            <q-btn class="numpad-btn bg-grey-9 text-white" label="." @click="addNumpad('.')" />
          </div>
          <div class="col-4">
            <q-btn class="numpad-btn bg-grey-9 text-white" label="0" @click="addNumpad(0)" />
          </div>
          <div class="col-4">
            <q-btn class="numpad-btn bg-red-9 text-white" icon="backspace" @click="delNumpad" />
          </div>
        </div>
        <q-btn
          class="full-width q-mt-md field-btn-confirm bg-primary text-black"
          label="CONFIRMAR"
          size="xl"
          @click="confirmarNumpad"
        />
      </div>
    </div>

    <q-inner-loading
      :showing="globalLoading"
      dark
      label="Procesando..."
      label-class="text-primary"
      label-style="font-size: 1.5em"
    />
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useDataStore } from 'stores/data-store'
import { useQuasar } from 'quasar'

const props = defineProps(['isOnline'])
const emit = defineEmits(['sync-status-change'])
const dataStore = useDataStore()
const $q = useQuasar()

// --- Variables ---
const currentView = ref('menu')
const temperatura = ref('28')
const globalLoading = ref(false)
const videoRef = ref(null)
const scanProcessing = ref(false)
const scanResultValue = ref(5)
const flowState = reactive({ action: null, selectedLote: null, selectedItem: null })
const numpadValue = ref('')
const numpadTitle = ref('')
const numpadUnit = ref('')

// --- Notificaciones Gigantes ---
function notificarExito(msg) {
  $q.notify({
    message: msg,
    icon: 'check_circle',
    position: 'center',
    timeout: 2500,
    classes: 'field-notify field-notify-success',
  })
}

function notificarError(msg, caption = '') {
  $q.notify({
    message: msg,
    caption: caption,
    icon: 'error',
    position: 'center',
    timeout: 3000,
    classes: 'field-notify field-notify-error',
  })
}

// --- Guardado ---
async function guardarAccion(tipo, payload, mensajeExito) {
  globalLoading.value = true
  try {
    if (props.isOnline) {
      try {
        if (tipo === 'evaluacion') await dataStore.createRegistro('evaluaciones', payload)
        notificarExito(mensajeExito)
      } catch (errorOnline) {
        if (errorOnline.code === '23514') {
          notificarError('Dato Inválido', 'Revisa el peso/formato')
          return
        }
        // Corrección 1: Quitamos el tercer parámetro innecesario
        guardarLocal(tipo, payload)
      }
    } else {
      // Corrección 1: Quitamos el tercer parámetro innecesario
      guardarLocal(tipo, payload)
    }
  } catch {
    // Corrección 2: Eliminamos errorFatal que no se usa
    notificarError('Error Crítico')
  } finally {
    globalLoading.value = false
    currentView.value = 'menu'
  }
}

// Corrección 3: Eliminamos mensajeExito de los argumentos
function guardarLocal(tipo, payload) {
  try {
    const queue = JSON.parse(localStorage.getItem('nutrogan_offline_queue') || '[]')
    queue.push({ id: Date.now(), tipo, payload, timestamp: new Date().toISOString() })
    localStorage.setItem('nutrogan_offline_queue', JSON.stringify(queue))
    window.dispatchEvent(new CustomEvent('queue-updated'))

    $q.notify({
      message: 'GUARDADO OFFLINE',
      caption: 'Se subirá al conectar',
      icon: 'save',
      position: 'center',
      timeout: 2500,
      classes: 'field-notify field-notify-success',
    })
  } catch {
    // Corrección 4: Eliminamos 'e' que no se usa
    notificarError('Memoria Llena')
  }
}

// --- Sincronización ---
async function procesarCola() {
  const queueRaw = localStorage.getItem('nutrogan_offline_queue')
  if (!queueRaw) return
  const queue = JSON.parse(queueRaw)
  if (queue.length === 0) return

  emit('sync-status-change', { syncing: true, count: queue.length })
  const failed = []
  let successCount = 0

  try {
    for (const item of queue) {
      try {
        if (item.tipo === 'evaluacion') await dataStore.createRegistro('evaluaciones', item.payload)
        successCount++
      } catch (e) {
        if (e.code !== '23514') failed.push(item)
      }
    }
    localStorage.setItem('nutrogan_offline_queue', JSON.stringify(failed))
    if (successCount > 0) notificarExito(`SUBIDOS: ${successCount}`)
  } finally {
    emit('sync-status-change', { syncing: false, count: failed.length })
  }
}

// --- Lógica Cámara ---
function reintentarScan() {
  currentView.value = 'camera_scan'
  startCamera()
}
async function startCamera() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      if (videoRef.value) videoRef.value.srcObject = stream
    } catch {
      // Corrección 5: Eliminamos 'err' que no se usa
      notificarError('Sin Cámara', 'No se pudo acceder')
    }
  }
}
function stopCameraAndBack() {
  const stream = videoRef.value?.srcObject
  if (stream) stream.getTracks().forEach((track) => track.stop())
  currentView.value = 'menu'
}
function capturarCC() {
  scanProcessing.value = true
  setTimeout(() => {
    scanResultValue.value = Math.floor(Math.random() * 4) + 4
    scanProcessing.value = false
    currentView.value = 'scan_result'
    const stream = videoRef.value?.srcObject
    if (stream) stream.getTracks().forEach((track) => track.stop())
  }, 1500)
}
async function guardarScanCC() {
  if (!flowState.selectedLote) return
  const payload = {
    lote_id: flowState.selectedLote.id,
    fecha_evaluacion: new Date().toISOString().split('T')[0],
    condicion_corporal: scanResultValue.value,
    observaciones: 'Escaneo Modo Campo',
    peso_promedio_kg: null,
  }
  await guardarAccion('evaluacion', payload, 'CC GUARDADA')
}

// --- Flujo ---
function iniciarFlujo(accion) {
  flowState.action = accion
  flowState.selectedLote = null
  if (
    accion === 'cc_scan' ||
    accion === 'mover' ||
    accion === 'peso' ||
    accion === 'sanidad' ||
    accion === 'alimentar'
  ) {
    currentView.value = 'select_lote'
  } else {
    notificarError('En desarrollo')
  }
}
function seleccionarLote(lote) {
  flowState.selectedLote = lote
  if (flowState.action === 'cc_scan') {
    currentView.value = 'camera_scan'
    setTimeout(startCamera, 100)
  } else if (flowState.action === 'peso') {
    abrirNumpad('PESO (KG)', 'KG')
  } else {
    // Simulación simple para otros
    notificarExito('Seleccionado')
    currentView.value = 'menu'
  }
}

// --- Numpad ---
function abrirNumpad(t, u) {
  numpadTitle.value = t
  numpadUnit.value = u
  currentView.value = 'numpad_input'
}
function addNumpad(n) {
  numpadValue.value += n
}
function delNumpad() {
  numpadValue.value = numpadValue.value.slice(0, -1)
}
async function confirmarNumpad() {
  const val = parseFloat(numpadValue.value)
  if (!val) return
  if (flowState.action === 'peso') {
    const payload = {
      lote_id: flowState.selectedLote.id,
      fecha_evaluacion: new Date().toISOString().split('T')[0],
      peso_promedio_kg: val,
      observaciones: 'Pesaje Campo',
    }
    await guardarAccion('evaluacion', payload, 'PESO GUARDADO')
  }
}

onMounted(async () => {
  window.addEventListener('try-sync', procesarCola)
  if (dataStore.lotes.length === 0 && props.isOnline) await dataStore.fetchAll()
  temperatura.value = dataStore.clima?.current?.temperature_2m || '28'
})
onUnmounted(() => {
  window.removeEventListener('try-sync', procesarCola)
})
</script>

<style scoped>
.field-btn-giant {
  width: 100%;
  height: 160px;
  border-radius: 16px;
  transition: all 0.1s;
  border: 2px solid transparent;
}
.field-btn-giant:active {
  transform: scale(0.98);
  border-color: #39ff14;
}
.border-left-neon {
  border-left: 10px solid #39ff14;
}
.border-neon {
  border: 2px solid #39ff14;
}
.border-bottom-neon {
  border-bottom: 4px solid #39ff14;
}

.field-card {
  background: #1a1a1a;
  padding: 24px;
  border-radius: 12px;
  border-bottom: 1px solid #333;
}
.field-card:active {
  background: #39ff14;
  color: black;
}
.field-card:active .text-grey-5,
.field-card:active .q-icon {
  color: black !important;
}

.object-cover {
  object-fit: cover;
}
.scan-reticle {
  width: 80%;
  height: 250px;
  border: 4px solid #39ff14;
  border-radius: 12px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
}
.text-display {
  font-size: 5rem;
  font-weight: 900;
}
.numpad-btn {
  height: 70px;
  font-size: 2rem;
  width: 100%;
  font-weight: 900;
}
</style>
