<template>
  <q-page padding class="dashboard-pro-bg text-white">
    <div class="row items-center justify-between q-mb-md">
      <div class="page-title-box" style="margin-bottom: 0">Análisis Satelital (NDVI)</div>
      <q-btn flat round dense icon="arrow_back" @click="$router.push('/recursos')" />
    </div>

    <div class>
      <div class="col-12 col-lg-10 col-xl-8">
        <q-card flat class="kpi-card q-mt-md">
          <q-card-section>
            <div class="text-h6">Análisis de Vigor del Forraje</div>
            <div class="text-caption text-grey-4">
              Estima la biomasa (cantidad) de tus potreros usando imágenes satelitales (Sentinel-2).
            </div>
          </q-card-section>

          <q-card-section class="q-pa-lg">
            <q-banner class="bg-grey-9 text-white items-start" rounded>
              <template v-slot:avatar>
                <q-icon name="info" color="primary" />
              </template>
              <div class="text-caption">
                <strong>NDVI (Índice de Vegetación de Diferencia Normalizada):</strong>
                <ul class="q-my-sm q-pl-md">
                  <li>0.6 - 1.0: Vegetación densa y saludable (verde)</li>
                  <li>0.2 - 0.6: Vegetación moderada (amarillo)</li>
                  <li>0.0 - 0.2: Vegetación escasa o estresada (rojo)</li>
                  <li>&lt; 0: Agua, suelo desnudo o sin vegetación</li>
                </ul>
              </div>
            </q-banner>

            <q-btn
              @click="ejecutarAnalisisNDVI"
              :loading="loading"
              label="Actualizar Datos NDVI"
              icon="satellite_alt"
              color="primary"
              class="q-mt-lg full-width"
              size="lg"
            >
              <template v-slot:loading>
                <q-spinner-dots />
                Analizando... (Esto puede tardar 1-3 minutos)
              </template>
            </q-btn>
          </q-card-section>
        </q-card>

        <q-card v-if="ultimoAnalisis" flat class="kpi-card q-mt-md">
          <q-card-section>
            <div class="text-h6">Último Análisis</div>
            <div class="row q-gutter-sm q-mt-sm">
              <q-chip color="primary" text-color="white" icon="check_circle">
                {{ ultimoAnalisis.exitosos }} Exitosos
              </q-chip>
              <q-chip
                v-if="ultimoAnalisis.fallidos > 0"
                color="warning"
                text-color="white"
                icon="warning"
              >
                {{ ultimoAnalisis.fallidos }} Con problemas
              </q-chip>
              <q-chip color="grey" text-color="white" icon="access_time">
                {{ formatearFecha(ultimoAnalisis.fecha) }}
              </q-chip>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <q-card flat class="kpi-card q-mt-md">
      <q-list>
        <q-item-label header class="text-white">Resultados por Potrero</q-item-label>

        <q-item v-if="dataStore.potreros.length === 0 && !loading" class="text-grey-5 q-pa-md">
          <q-item-section>
            No se encontraron potreros activos. Asegúrate de haberlos creado en "Mis Potreros".
          </q-item-section>
        </q-item>

        <q-item v-if="loading && dataStore.potreros.length === 0" class="q-pa-md">
          <q-item-section>
            <q-spinner-dots color="primary" size="2em" />
            <q-item-label caption class="text-grey-4">Cargando potreros...</q-item-label>
          </q-item-section>
        </q-item>

        <div v-for="potrero in potrerosOrdenados" :key="potrero.id">
          <q-item>
            <q-item-section avatar>
              <q-avatar
                :color="getAvatarColor(potrero.ultimo_ndvi)"
                text-color="white"
                :icon="getPotreroIcon(potrero)"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-medium">{{ potrero.nombre }}</q-item-label>
              <q-item-label caption class="text-grey-4">
                <span class="text-weight-medium">NDVI: </span>
                <span
                  v-if="typeof potrero.ultimo_ndvi === 'number'"
                  class="text-weight-bold"
                  :style="{ color: getNdviColor(potrero.ultimo_ndvi) }"
                >
                  {{ potrero.ultimo_ndvi.toFixed(4) }}
                </span>
                <span v-else class="text-grey-5">Sin datos</span>
                <q-chip
                  v-if="typeof potrero.ultimo_ndvi === 'number'"
                  :color="getChipColor(potrero.ultimo_ndvi)"
                  text-color="white"
                  size="sm"
                  class="q-ml-sm"
                  dense
                >
                  {{ getEstadoForraje(potrero.ultimo_ndvi) }}
                </q-chip>
              </q-item-label>
              <q-item-label caption class="text-grey-4">
                <span v-if="potrero.fecha_ultimo_ndvi">
                  <q-icon name="event" size="xs" />
                  {{ formatearFecha(potrero.fecha_ultimo_ndvi) }}
                </span>
                <span v-if="potrero.superficie_ha" class="q-ml-md">
                  <q-icon name="crop_free" size="xs" />
                  {{ potrero.superficie_ha }} ha
                </span>
                <span v-if="areaCalculada[potrero.id]" class="q-ml-md text-orange">
                  <q-icon name="warning" size="xs" />
                  Área real: {{ areaCalculada[potrero.id].toFixed(1) }} ha
                </span>
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="column items-end">
                <q-linear-progress
                  :value="normalizeNdvi(potrero.ultimo_ndvi)"
                  :color="getNdviColor(potrero.ultimo_ndvi)"
                  style="width: 120px; height: 8px"
                  rounded
                  dark
                  class="q-mb-sm"
                />
                <div class="row q-gutter-xs">
                  <q-btn
                    v-if="!potrero.geometria"
                    size="sm"
                    flat
                    dense
                    color="warning"
                    icon="draw"
                    @click="$router.push(`/recursos/potreros/draw/${potrero.id}`)"
                  >
                    <q-tooltip class="bg-black">Dibujar polígono</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-else
                    size="sm"
                    flat
                    dense
                    color="primary"
                    icon="refresh"
                    @click="analizarPotreroIndividual(potrero)"
                    :loading="loadingIndividual[potrero.id]"
                  >
                    <q-tooltip class="bg-black">Actualizar solo este potrero</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </q-item-section>
          </q-item>
          <q-separator dark class="q-mx-md" />
        </div>
      </q-list>
    </q-card>

    <q-dialog v-model="mostrarErrores" class="glass-dialog-form">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Potreros con problemas</div>
        </q-card-section>
        <q-list dense separator dark>
          <q-item v-for="(error, index) in erroresAnalisis" :key="index">
            <q-item-section>
              <q-item-label>{{ error.potrero }}</q-item-label>
              <q-item-label caption class="text-red-4">{{ error.error }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="white" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useDataStore } from 'stores/data-store'
import { useAuthStore } from 'stores/auth-store'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'
// 1. IMPORTAR COMPOSABLE DE SONIDO
import { useSound } from 'src/composables/useSound'

const dataStore = useDataStore()
const authStore = useAuthStore()
const $q = useQuasar()

// 2. INICIALIZAR SONIDO
const { playNdvi } = useSound()

// Estados
const loading = ref(false)
const loadingIndividual = reactive({})
const ultimoAnalisis = ref(null)
const erroresAnalisis = ref([])
const mostrarErrores = ref(false)
const areaCalculada = reactive({})

// Cargar potreros al montar
onMounted(() => {
  if (dataStore.potreros.length === 0) {
    loading.value = true
    dataStore.fetchPotreros().finally(() => {
      loading.value = false
      calcularAreas()
    })
  } else {
    calcularAreas()
  }
})

// Calcular áreas de los polígonos
function calcularAreas() {
  dataStore.potreros.forEach((potrero) => {
    if (potrero.geometria) {
      const area = calcularAreaHa(potrero.geometria)
      if (area && Math.abs(area - (potrero.superficie_ha || 0)) > 10) {
        areaCalculada[potrero.id] = area
      }
    }
  })
}

// Función para calcular área
function calcularAreaHa(geometria) {
  let geojson = geometria
  if (typeof geojson === 'string') {
    try {
      geojson = JSON.parse(geojson)
    } catch {
      return null
    }
  }

  if (geojson.type === 'Feature') geojson = geojson.geometry
  if (!geojson || geojson.type !== 'Polygon') return null

  const coords = geojson.coordinates[0]
  let area = 0
  for (let i = 0; i < coords.length - 1; i++) {
    const [x1, y1] = coords[i]
    const [x2, y2] = coords[i + 1]
    area += x1 * y2 - x2 * y1
  }
  area = Math.abs(area / 2)

  const lat = coords[0][1]
  const metroPorGrado = 111320
  area = area * Math.pow(metroPorGrado, 2) * Math.abs(Math.cos((lat * Math.PI) / 180))

  return area / 10000
}

// Ordenar potreros por NDVI
const potrerosOrdenados = computed(() => {
  if (!dataStore.potreros) return []
  return [...dataStore.potreros].sort((a, b) => {
    const ndviA = a.ultimo_ndvi ?? -1
    const ndviB = b.ultimo_ndvi ?? -1
    return ndviB - ndviA
  })
})

// Función principal de análisis
async function ejecutarAnalisisNDVI() {
  // 3. SONIDO AL INICIAR
  playNdvi()

  loading.value = true
  erroresAnalisis.value = []

  const notif = $q.notify({
    type: 'ongoing',
    message: 'Conectando con satélites Sentinel-2...',
    caption: 'Este proceso puede tardar varios minutos',
    timeout: 0,
    spinner: true,
  })

  try {
    const establecimientoId = authStore.profile?.establecimiento_id
    if (!establecimientoId) {
      throw new Error('Error de autenticación: No se encontró el establecimiento')
    }

    const { data, error } = await supabase.functions.invoke('analizar-ndvi', {
      body: { establecimiento_id: establecimientoId },
    })

    if (error) throw error

    // Actualizar datos locales
    if (data.resultados && data.resultados.length > 0) {
      data.resultados.forEach((resultado) => {
        const potreroEnStore = dataStore.potreros.find((p) => p.id === resultado.id)
        if (potreroEnStore && resultado.estado === 'exitoso') {
          potreroEnStore.ultimo_ndvi = resultado.ndvi
          potreroEnStore.fecha_ultimo_ndvi = resultado.fecha
        }
      })
    }

    // Guardar resumen
    if (data.resumen) {
      ultimoAnalisis.value = {
        exitosos: data.resumen.exitosos,
        fallidos: data.resumen.fallidos,
        fecha: new Date().toISOString(),
      }
    }

    // Manejar errores
    if (data.errores && data.errores.length > 0) {
      erroresAnalisis.value = data.errores
      mostrarErrores.value = true
    }

    notif({
      type: 'positive',
      message: data.message || '¡Análisis completado!',
      caption: `${data.resumen?.exitosos || 0} potreros actualizados correctamente`,
      timeout: 5000,
      actions:
        data.errores?.length > 0
          ? [
              {
                label: 'Ver errores',
                color: 'yellow',
                handler: () => {
                  mostrarErrores.value = true
                },
              },
            ]
          : undefined,
    })
  } catch (error) {
    console.error('Error al invocar la función:', error)
    notif({
      type: 'negative',
      message: 'Error al ejecutar análisis',
      caption: error.message,
      timeout: 5000,
    })
  } finally {
    loading.value = false
  }
}

// Analizar un potrero individual
async function analizarPotreroIndividual(potrero) {
  // También sonido aquí si lo deseas
  playNdvi()
  loadingIndividual[potrero.id] = true

  try {
    const { data, error } = await supabase.functions.invoke('analizar-ndvi', {
      body: {
        establecimiento_id: authStore.profile?.establecimiento_id,
        potrero_ids: [potrero.id],
      },
    })

    if (error) throw error

    // Actualizar solo este potrero
    if (data.resultados && data.resultados.length > 0) {
      const resultado = data.resultados[0]
      if (resultado.estado === 'exitoso') {
        potrero.ultimo_ndvi = resultado.ndvi
        potrero.fecha_ultimo_ndvi = resultado.fecha

        $q.notify({
          type: 'positive',
          message: `${potrero.nombre} actualizado`,
          caption: `NDVI: ${resultado.ndvi.toFixed(4)}`,
        })
      }
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Error al analizar ${potrero.nombre}`,
      caption: error.message,
    })
  } finally {
    loadingIndividual[potrero.id] = false
  }
}

// Funciones de visualización
function getNdviColor(ndvi) {
  if (typeof ndvi !== 'number') return 'grey'
  if (ndvi < 0) return 'blue-grey'
  if (ndvi < 0.2) return 'red'
  if (ndvi < 0.4) return 'orange'
  if (ndvi < 0.6) return 'yellow-8'
  return 'green'
}

function getAvatarColor(ndvi) {
  if (typeof ndvi !== 'number') return 'grey'
  if (ndvi < 0) return 'blue-grey'
  if (ndvi < 0.2) return 'red'
  if (ndvi < 0.4) return 'orange'
  if (ndvi < 0.6) return 'yellow-8'
  return 'green'
}

function getChipColor(ndvi) {
  if (ndvi >= 0.6) return 'green'
  if (ndvi >= 0.4) return 'yellow-8'
  if (ndvi >= 0.2) return 'orange'
  return 'red'
}

function getPotreroIcon(potrero) {
  if (!potrero.geometria) return 'crop_free'
  if (typeof potrero.ultimo_ndvi !== 'number') return 'cloud_off'
  if (potrero.ultimo_ndvi >= 0.6) return 'grass'
  if (potrero.ultimo_ndvi >= 0.2) return 'eco'
  return 'warning'
}

function getEstadoForraje(ndvi) {
  if (ndvi >= 0.6) return 'Excelente'
  if (ndvi >= 0.4) return 'Bueno'
  if (ndvi >= 0.2) return 'Regular'
  return 'Pobre'
}

function normalizeNdvi(ndvi) {
  if (typeof ndvi !== 'number') return 0
  return Math.max(0, Math.min(1, (ndvi + 1) / 2)) // Normalizar de -1,1 a 0,1
}

function formatearFecha(fecha) {
  if (!fecha) return 'Sin fecha'
  const date = new Date(fecha)
  const ahora = new Date()
  const diffHoras = (ahora - date) / (1000 * 60 * 60)

  if (diffHoras < 1) return 'Hace menos de 1 hora'
  if (diffHoras < 24) return `Hace ${Math.floor(diffHoras)} horas`
  if (diffHoras < 48) return 'Ayer'

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== ahora.getFullYear() ? 'numeric' : undefined,
  })
}
</script>

<style lang="scss" scoped>
.dashboard-pro-bg {
  background-image: url('public\images\mi-fondo-ndvi.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
}

.page-title-box {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.kpi-card {
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  height: 100%;
}

:deep(.glass-dialog-form .q-card) {
  background: rgba(40, 40, 40, 0.8) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}
:deep(.glass-dialog-form .q-field__label) {
  color: rgba(255, 255, 255, 0.7);
}
:deep(.glass-dialog-form .q-field__native) {
  color: white;
}
</style>
