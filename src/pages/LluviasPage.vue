<template>
  <q-page padding class="dashboard-pro-bg text-white">
    <div class="row items-center justify-between q-mb-md">
      <div class="page-title-box" style="margin-bottom: 0">Central de Clima</div>
      <q-btn flat round dense icon="arrow_back" @click="$router.push('/recursos')" />
    </div>

    <q-card flat class="kpi-card">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey-4"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="dashboard" label="Dashboard" icon="dashboard" />
        <q-tab name="historial" label="Historial API" icon="history" />
        <q-tab name="mapa" label="Mapa Climático" icon="map" />
        <q-tab name="manual" label="Carga Manual" icon="edit" />
      </q-tabs>
      <q-separator dark />

      <q-tab-panels v-model="tab" animated keep-alive class="bg-transparent">
        <q-tab-panel name="dashboard">
          <div class="row items-center q-mb-md">
            <div class="col-10 text-h6">Dashboard Climático</div>
            <div class="col-2 text-right">
              <q-btn
                @click="cargarDatosClima(true)"
                icon="refresh"
                color="primary"
                flat
                round
                dense
                :loading="loading"
              />
            </div>
          </div>

          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-5">
              <q-card flat class="filter-card q-mb-lg">
                <q-card-section>
                  <div class="text-h6">Condiciones Actuales</div>
                </q-card-section>
                <q-card-section class="row items-center justify-around" v-if="climaActual">
                  <div class="text-center">
                    <q-icon
                      :name="getWeatherIcon(climaActual.weathercode)"
                      :color="getWeatherColor(climaActual.weathercode)"
                      size="3em"
                    />
                    <div class="text-caption text-grey-4">
                      {{ getWeatherDescription(climaActual.weathercode) }}
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="text-h4 text-weight-light">{{ climaActual.temperature_2m }}°C</div>
                    <div class="text-caption text-grey-4">Temperatura</div>
                  </div>
                  <div class="text-center">
                    <div class="text-h5 text-weight-light">
                      {{ climaActual.windspeed_10m }}
                      <span class="text-caption">km/h</span>
                    </div>
                    <div class="text-caption text-grey-4">Viento</div>
                  </div>
                </q-card-section>
                <q-card-section v-else class="text-center text-grey-5 q-pa-lg">
                  <q-spinner-dots v-if="loading" color="primary" size="2em" />
                  <div v-else>Presiona "Actualizar"</div>
                </q-card-section>
              </q-card>

              <q-card flat class="filter-card">
                <q-card-section>
                  <div class="text-h6">Pronóstico 5 Días</div>
                </q-card-section>
                <q-scroll-area horizontal style="height: 210px; width: 100%">
                  <div class="row no-wrap q-pa-md q-gutter-md">
                    <div v-if="loading && climaForecast.length === 0" class="text-center">
                      <q-spinner-dots color="primary" size="2em" />
                    </div>
                    <div v-for="dia in climaForecast" :key="dia.fecha" class="forecast-card">
                      <div class="text-caption text-weight-bold">
                        {{ getDiaSemana(dia.fecha) }}
                      </div>
                      <q-icon
                        :name="getWeatherIcon(dia.weathercode)"
                        :color="getWeatherColor(dia.weathercode)"
                        size="2.5em"
                        class="q-my-sm"
                      />
                      <div class="text-weight-medium">
                        {{ dia.temp_max }}° / {{ dia.temp_min }}°
                      </div>
                      <q-badge :label="`${dia.milimetros} mm`" color="blue" class="q-mt-sm" />
                    </div>
                  </div>
                </q-scroll-area>
              </q-card>
            </div>

            <div class="col-12 col-md-7">
              <AiAnalysisCard
                :analysis-result="iaAnalysisResult"
                :loading="iaLoading"
                :error="iaError"
                @request-analysis="runAnalysis"
                style="height: 100%"
              />
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="historial">
          <q-card flat class="filter-card">
            <q-card-section>
              <div class="text-h6">Historial 30 días (API)</div>
              <div class="text-caption text-grey-4">Datos automáticos de Open-Meteo.</div>
              <q-btn
                @click="handleGuardarResumen"
                label="Guardar Resumen 7 Días"
                icon="save"
                color="secondary"
                outline
                class="q-mt-sm"
                :loading="loading"
                :disable="climaHistorial.length === 0"
              >
                <q-tooltip class="bg-indigo"
                  >Guarda un resumen de la lluvia acumulada de los últimos 7 días.</q-tooltip
                >
              </q-btn>
              <q-btn
                @click="cargarDatosClima"
                label="Actualizar"
                icon="refresh"
                color="primary"
                outline
                class="q-mt-sm q-ml-sm"
                :loading="loading"
              />
            </q-card-section>

            <q-list dark bordered separator>
              <q-item v-if="loading && climaHistorial.length === 0" class="text-center q-pa-md">
                <q-item-section><q-spinner-dots color="primary" size="2em" /></q-item-section>
              </q-item>
              <q-item v-if="!loading && climaHistorial.length === 0" class="text-grey-5">
                <q-item-section class="text-center q-pa-md">Presiona "Actualizar".</q-item-section>
              </q-item>
              <div v-for="(dia, index) in climaHistorial" :key="index">
                <q-item>
                  <q-item-section avatar>
                    <q-avatar
                      :icon="getWeatherIcon(dia.weathercode)"
                      :color="getWeatherColor(dia.weathercode)"
                      text-color="white"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ formatearFecha(dia.fecha) }}</q-item-label>
                    <q-item-label caption class="text-grey-4">
                      Máx: {{ dia.temp_max }}°C / Mín: {{ dia.temp_min }}°C
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side top>
                    <q-badge
                      :label="`${dia.milimetros} mm`"
                      :color="dia.milimetros > 0 ? 'blue' : 'grey-8'"
                      class="text-body2"
                    />
                  </q-item-section>
                </q-item>
                <q-separator dark inset="item" />
              </div>
            </q-list>
          </q-card>
        </q-tab-panel>

        <q-tab-panel name="mapa">
          <q-card flat class="filter-card" style="height: 100%">
            <q-card-section>
              <div class="text-h6">Mapa Climático (OpenWeatherMap)</div>
              <div class="text-caption text-grey-4">
                Capas visuales de clima sobre tus potreros.
              </div>
            </q-card-section>
            <q-card-section class="q-pa-none">
              <div id="map-lluvias" style="height: 70vh; border-radius: 8px"></div>
            </q-card-section>
          </q-card>
        </q-tab-panel>

        <q-tab-panel name="manual">
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-5">
              <q-card flat class="filter-card">
                <q-card-section>
                  <div class="text-h6">Nuevo Registro Manual</div>
                </q-card-section>
                <q-form @submit.prevent="handleRegistroManual">
                  <q-card-section class="q-gutter-md">
                    <q-input
                      filled
                      dark
                      color="white"
                      v-model="newRegistro.fecha"
                      type="date"
                      label="Fecha"
                      stack-label
                    />
                    <q-input
                      filled
                      dark
                      color="white"
                      v-model.number="newRegistro.milimetros"
                      type="number"
                      step="0.1"
                      label="Milímetros (mm)"
                      :rules="[(val) => val >= 0 || 'Debe ser >= 0']"
                    >
                      <template v-slot:prepend>
                        <q-icon name="water_drop" />
                      </template>
                    </q-input>
                    <q-input
                      filled
                      dark
                      color="white"
                      v-model="newRegistro.observaciones"
                      type="textarea"
                      label="Observaciones"
                    />
                  </q-card-section>
                  <q-card-actions align="right" class="q-pa-md">
                    <q-btn
                      label="Guardar Lluvia"
                      type="submit"
                      color="primary"
                      :loading="loading"
                    />
                  </q-card-actions>
                </q-form>
              </q-card>
            </div>
            <div class="col-12 col-md-7">
              <q-card flat class="kpi-card" style="height: 100%">
                <q-card-section>
                  <div class="text-h6">Historial de Lluvias (Guardadas)</div>
                  <div class="text-caption text-grey-4">Registros manuales y resúmenes de API.</div>
                </q-card-section>
                <q-list dark separator bordered class="rounded-borders">
                  <q-item
                    v-if="dataStore.registrosLluvia.length === 0 && !loading"
                    class="text-grey-5"
                  >
                    <q-item-section class="text-center q-pa-md"
                      >No hay registros guardados.</q-item-section
                    >
                  </q-item>
                  <q-item v-for="lluvia in dataStore.registrosLluvia" :key="lluvia.id">
                    <q-item-section avatar>
                      <q-avatar
                        :icon="
                          lluvia.observaciones?.includes('API') ? 'summarize' : 'edit_calendar'
                        "
                        :color="lluvia.observaciones?.includes('API') ? 'secondary' : 'blue-7'"
                        text-color="white"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ formatearFecha(lluvia.fecha) }}</q-item-label>
                      <q-item-label caption class="text-grey-4">{{
                        lluvia.observaciones || 'Carga manual'
                      }}</q-item-label>
                    </q-item-section>
                    <q-item-section side top>
                      <q-badge :label="`${lluvia.milimetros} mm`" color="blue" class="text-body2" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed, nextTick } from 'vue'
import { useDataStore } from 'stores/data-store'
import { useAuthStore } from 'stores/auth-store'
import { useQuasar } from 'quasar'
import { supabase } from 'boot/supabase'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import AiAnalysisCard from 'components/clima/AiAnalysisCard.vue'

const dataStore = useDataStore()
const authStore = useAuthStore()
const $q = useQuasar()
const loading = ref(false)
const tab = ref('dashboard')

const newRegistro = reactive({
  fecha: new Date().toISOString().split('T')[0],
  milimetros: null,
  observaciones: '',
})

const iaAnalysisResult = ref(
  '<p class="text-grey-5 text-center q-pa-md">Presiona el ícono de recargar 🔄 para obtener datos del clima y generar un análisis.</p>',
)
const iaLoading = ref(false)
const iaError = ref(null)

async function runAnalysis() {
  if (!aiContext.value || aiContext.value.includes('esperando datos')) {
    iaAnalysisResult.value =
      '<p class="text-grey-5 text-center q-pa-md">Datos del clima no disponibles. Presiona recargar 🔄.</p>'
    return
  }

  iaLoading.value = true
  iaError.value = null

  try {
    const { data, error: funcError } = await supabase.functions.invoke('asistente-ia', {
      body: {
        prompt: aiContext.value,
        dataContext: {},
      },
    })
    if (funcError) throw funcError
    iaAnalysisResult.value = data.response || 'No se recibió respuesta de la IA.'
  } catch (err) {
    console.error('Error al llamar a la Edge Function:', err)
    iaError.value = err.message || 'Error desconocido'
    $q.notify({
      type: 'negative',
      message: 'Error al contactar al Asistente IA',
      caption: err.message,
    })
  } finally {
    iaLoading.value = false
  }
}

onMounted(async () => {
  if (dataStore.registrosLluvia.length === 0) {
    await dataStore.fetchRegistrosLluvia()
  }
  if (!dataStore.clima.current) {
    iaAnalysisResult.value =
      '<p class="text-grey-5 text-center q-pa-md">Presiona el ícono de recargar 🔄 para obtener datos del clima y generar un análisis.</p>'
  }
})

async function handleRegistroManual() {
  if (!authStore.profile)
    return $q.notify({ color: 'negative', message: 'Error de autenticación.' })
  loading.value = true
  try {
    const data = {
      ...newRegistro,
      milimetros: newRegistro.milimetros || 0,
      establecimiento_id: authStore.profile.establecimiento_id,
    }
    await dataStore.createRegistro('registros_lluvia', data)
    newRegistro.milimetros = null
    newRegistro.observaciones = ''
    $q.notify({ color: 'positive', message: 'Lluvia registrada' })
  } catch (error) {
    $q.notify({ color: 'negative', message: 'Error: ' + error.message })
  } finally {
    loading.value = false
  }
}

async function handleGuardarResumen() {
  if (!authStore.profile || !recomendacionAgua.value.raw) {
    return $q.notify({
      color: 'negative',
      message: 'No hay datos de clima para resumir.',
    })
  }
  loading.value = true
  try {
    const lluviaAcumulada = recomendacionAgua.value.raw
    const fechaHoy = new Date().toISOString().split('T')[0]

    const data = {
      fecha: fechaHoy,
      milimetros: lluviaAcumulada.toFixed(1),
      observaciones: `Resumen API (últimos 7 días)`,
      establecimiento_id: authStore.profile.establecimiento_id,
    }
    await dataStore.createRegistro('registros_lluvia', data)
    $q.notify({
      color: 'positive',
      message: `Resumen de ${data.milimetros} mm guardado.`,
    })
  } catch (error) {
    console.error('Error al guardar resumen de API:', error)
    $q.notify({
      color: 'negative',
      message: 'Error guardando en Supabase: ' + error.message,
    })
  } finally {
    loading.value = false
  }
}

async function cargarDatosClima(forceAiRun = false) {
  loading.value = true
  try {
    if (dataStore.potreros.length === 0) {
      await dataStore.fetchPotreros()
    }
    await dataStore.fetchClima()

    if (forceAiRun || iaAnalysisResult.value.includes('Presiona el ícono')) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      runAnalysis()
    }
  } catch {
    $q.notify({ color: 'negative', message: 'Error al cargar datos de clima.' })
  } finally {
    loading.value = false
  }
}

// --- LÓGICA DE MAPA ---
const OWM_API_KEY = '7c37004f4cd6287bd1788020ef3b8dd4'
let map = null
let mapInitialized = false
let potrerosLayer = L.featureGroup()

// Al usar keep-alive, el mapa no se destruye, pero Leaflet se "marea"
// si el contenedor se oculta y reaparece. invalidateSize() lo arregla.
watch(tab, (newTab) => {
  if (newTab === 'mapa') {
    if (!mapInitialized) {
      setTimeout(tryInitMap, 100)
    } else if (map) {
      setTimeout(() => {
        map.invalidateSize()
        try {
          const bounds = potrerosLayer.getBounds()
          if (bounds.isValid()) {
            map.fitBounds(bounds)
          }
        } catch {
          /* no-op */
        }
      }, 100)
    }
  }
})

function tryInitMap() {
  if (dataStore.potreros.length > 0) {
    initMap()
  } else {
    console.warn('Esperando potreros para iniciar el mapa...')
    cargarDatosClima().then(() => {
      nextTick(() => {
        initMap()
      })
    })
  }
}

function initMap() {
  if (!document.getElementById('map-lluvias') || map) return
  mapInitialized = true
  console.log('Iniciando mapa con dibujo GeoJSON nativo...')

  map = L.map('map-lluvias').setView([-38.4, -63.6], 4)

  const baseMap = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: 'Tiles &copy; Esri',
      maxZoom: 18,
    },
  ).addTo(map)

  const nubesLayer = L.tileLayer(
    `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`,
    { attribution: 'OpenWeatherMap', opacity: 0.7 },
  )
  const lluviaLayer = L.tileLayer(
    `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`,
    { attribution: 'OpenWeatherMap', opacity: 0.8 },
  )
  const tempLayer = L.tileLayer(
    `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`,
    { attribution: 'OpenWeatherMap', opacity: 0.5 },
  )

  potrerosLayer.clearLayers()

  const potreroStyle = {
    color: '#55ff00',
    weight: 2,
    opacity: 1,
    fillColor: '#55ff00',
    fillOpacity: 0.2,
  }

  dataStore.potreros.forEach((potrero) => {
    if (potrero.geometria) {
      try {
        const geometria =
          typeof potrero.geometria === 'string' ? JSON.parse(potrero.geometria) : potrero.geometria

        const layer = L.geoJSON(geometria, {
          style: potreroStyle,
        })
        layer.bindPopup(`<strong>${potrero.nombre || 'Potrero'}</strong>`)
        potrerosLayer.addLayer(layer)
      } catch (e) {
        console.error(`Error al parsear geometría del potrero ${potrero.nombre}:`, e)
      }
    }
  })

  potrerosLayer.addTo(map)

  try {
    const bounds = potrerosLayer.getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds)
    }
  } catch (e) {
    console.warn('No se pudo hacer zoom a los potreros', e)
  }

  L.control
    .layers(
      { 'Satélite (Esri)': baseMap },
      {
        'Mis Potreros': potrerosLayer,
        Nubes: nubesLayer,
        Precipitación: lluviaLayer.addTo(map),
        Temperatura: tempLayer,
      },
      { position: 'topright' },
    )
    .addTo(map)
}

const climaActual = computed(() => {
  return dataStore.clima?.current || null
})
const climaHistorial = computed(() => {
  return dataStore.clima?.historial || []
})
const climaForecast = computed(() => {
  return dataStore.clima?.forecast || []
})
const recomendacionAgua = computed(() => {
  if (!climaHistorial.value || climaHistorial.value.length === 0) {
    return {
      titulo: 'Sin datos',
      raw: 0,
    }
  }
  const ultimos7dias = climaHistorial.value.slice(0, 7)
  const lluviaAcumulada = ultimos7dias.reduce((acc, dia) => acc + dia.milimetros, 0)
  return {
    raw: lluviaAcumulada,
    titulo: 'Resumen 7 días',
  }
})

const aiContext = computed(() => {
  if (!climaActual.value) return 'El usuario está en la página de clima, esperando datos.'

  const datosClima = {
    condicionesActuales: {
      temperatura: climaActual.value.temperature_2m,
      viento: climaActual.value.windspeed_10m,
      codigoClima: climaActual.value.weathercode,
      descripcion: getWeatherDescription(climaActual.value.weathercode),
    },
    pronosticoProximos5dias: climaForecast.value.map((dia) => ({
      fecha: dia.fecha,
      temp_max: dia.temp_max,
      temp_min: dia.temp_min,
      precipitacion: dia.milimetros,
      descripcion: getWeatherDescription(dia.weathercode),
    })),
    resumenLluviaUltimos7dias: {
      total_mm: recomendacionAgua.value.raw?.toFixed(1),
    },
  }

  return `
    El usuario está en la "Central de Clima" de Nutrogan, una app de gestión ganadera.
    Rol: Eres un Asistente experto en Agronomía y Ganadería.
    Tarea: Analiza los siguientes datos climáticos y genera alertas y recomendaciones
    accionables para un productor ganadero. Enfócate en el impacto sobre el
    forraje, las aguadas, el estrés calórico de los animales y la planificación de tareas.

    DATOS:
    ${JSON.stringify(datosClima, null, 2)}

    ---
    INSTRUCCIÓN DE FORMATO:
    Devuelve tu respuesta formateada en HTML simple.
    - Usa <h4> para los títulos (ej: "<h4>Alertas</h4>").
    - Usa <ul> y <li> para las listas de recomendaciones.
    - Usa <strong> para destacar palabras clave (ej: "Estrés Calórico").
    No incluyas <html> o <body> tags, solo el contenido.
  `
})

function getWeatherIcon(code) {
  if ([0, 1].includes(code)) return 'sunny'
  if ([2].includes(code)) return 'partly_cloudy_day'
  if ([3].includes(code)) return 'cloud'
  if ([45, 48].includes(code)) return 'foggy'
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'water_drop'
  if ([56, 57, 66, 67].includes(code)) return 'ac_unit'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'ac_unit'
  if ([95, 96, 99].includes(code)) return 'thunderstorm'
  return 'cloud'
}
function getWeatherColor(code) {
  if ([0, 1, 2].includes(code)) return 'yellow-7'
  if ([45, 48, 3].includes(code)) return 'grey-6'
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'blue-5'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'cyan'
  if ([95, 96, 99].includes(code)) return 'deep-purple-5'
  return 'grey-6'
}
function getWeatherDescription(code) {
  const descriptions = {
    0: 'Cielo Despejado',
    1: 'Mayormente Despejado',
    2: 'Parcialmente Nublado',
    3: 'Nublado',
    45: 'Niebla',
    48: 'Niebla densa',
    61: 'Lluvia Ligera',
    63: 'Lluvia Moderada',
    65: 'Lluvia Fuerte',
    80: 'Chaparrones Ligeros',
    95: 'Tormenta',
  }
  return descriptions[code] || 'Condiciones'
}

function getDiaSemana(fechaISO) {
  const date = new Date(fechaISO + 'T00:00:00-03:00')
  const hoy = new Date()
  const d1 = date.getDate()
  const m1 = date.getMonth()
  const y1 = date.getFullYear()
  const d2 = hoy.getDate()
  const m2 = hoy.getMonth()
  const y2 = hoy.getFullYear()

  if (d1 === d2 && m1 === m2 && y1 === y2) {
    return 'Hoy'
  }
  return date.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '').toUpperCase()
}
function formatearFecha(fechaISO) {
  if (!fechaISO) return 'N/A'
  const date = new Date(fechaISO + 'T00:00:00-03:00')
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
</script>

<style lang="scss" scoped>
/* ESTILOS "PRO" */
.dashboard-pro-bg {
  background-image: url('src/assets/nutrogan-bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
}
.page-title-box {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
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
.filter-card {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  height: 100%;
}

.forecast-card {
  min-width: 120px; /* Ancho mínimo para no aplastar */
  width: 120px;
  text-align: center;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex; /* Flexbox para centrar contenido */
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

:deep(.leaflet-popup-content-wrapper) {
  background: #333 !important;
  color: white !important;
  border-radius: 8px;
}
:deep(.leaflet-popup-tip) {
  background: #333 !important;
}
:deep(.leaflet-control-layers) {
  background: rgba(40, 40, 40, 0.9) !important;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}
:deep(.leaflet-control-layers-base label) {
  color: white;
}
:deep(.leaflet-control-layers-overlays label) {
  color: white;
}
:deep(.leaflet-control-zoom-in),
:deep(.leaflet-control-zoom-out) {
  background-color: rgba(40, 40, 40, 0.9) !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
