<template>
  <q-page padding class="dashboard-pro-bg text-white">
    <div class="row items-center justify-between q-mb-md">
      <div class="page-title-box" style="margin-bottom: 0">Gestión de Agua</div>
      <div class="row items-center q-gutter-md">
        <q-btn color="primary" icon="add" label="Nueva Fuente" @click="abrirFormFuente(null)" />
        <q-btn flat round dense icon="arrow_back" @click="$router.push('/recursos')" />
      </div>
    </div>

    <q-card flat class="kpi-card q-mb-xl overflow-hidden">
      <q-card-section class="row items-center justify-between q-pb-sm">
        <div>
          <div class="text-h6">Mapa de Hidratación</div>
          <div class="text-caption text-grey-4">
            Distribución de fuentes sobre potreros activos.
          </div>
        </div>
        <div class="row q-gutter-sm">
          <q-badge color="green-13" text-color="black" label="Óptimo" />
          <q-badge color="orange" text-color="white" label="Precaución" />
          <q-badge color="red" text-color="white" label="Peligro" />
        </div>
      </q-card-section>

      <q-separator dark />

      <q-card-section class="q-pa-none map-wrapper">
        <l-map
          ref="mapRef"
          v-model:zoom="zoom"
          :center="mapCenter"
          :options="{ zoomControl: false }"
          style="height: 100%; width: 100%"
          @ready="onMapReady"
        >
          <l-tile-layer
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
            layer-type="base"
            name="Stadia Dark"
          />

          <l-geo-json v-if="potrerosGeoJson" :geojson="potrerosGeoJson" :options="geoJsonOptions" />

          <l-marker
            v-for="fuente in fuentesConGeo"
            :key="fuente.id"
            :lat-lng="getCoords(fuente.geometria)"
            :icon="getIcono(fuente)"
          >
            <l-popup class="custom-popup">
              <div class="text-subtitle2 text-weight-bold">{{ fuente.nombre }}</div>
              <div class="text-caption">{{ fuente.tipo }}</div>
              <q-badge
                :color="getColorEstado(fuente.ultimo_estado)"
                text-color="black"
                class="q-mt-xs"
              >
                {{ fuente.ultimo_estado || 'Sin datos' }}
              </q-badge>
            </l-popup>
          </l-marker>

          <div class="leaflet-bottom leaflet-right" style="margin: 20px; pointer-events: auto">
            <div class="column bg-dark rounded-borders shadow-2 overflow-hidden">
              <q-btn flat dense icon="add" color="white" @click="zoom++" />
              <q-separator dark />
              <q-btn flat dense icon="remove" color="white" @click="zoom--" />
            </div>
          </div>
        </l-map>
      </q-card-section>
    </q-card>

    <div class="row items-center q-mb-md">
      <q-icon name="grid_view" color="primary" size="sm" class="q-mr-sm" />
      <div class="text-h5 text-weight-bold">Inventario de Fuentes</div>
      <q-badge color="grey-8" class="q-ml-sm">{{ dataStore.fuentesAgua.length }}</q-badge>
    </div>

    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner-dots color="primary" size="3em" />
      <div class="text-grey-4 q-mt-md">Cargando fuentes de agua...</div>
    </div>

    <div v-else class="row q-col-gutter-md">
      <div v-if="dataStore.fuentesAgua.length === 0" class="col-12 text-center text-grey-5 q-pa-xl">
        <q-icon name="water_off" size="4em" />
        <div class="text-h6 q-mt-md">No hay fuentes de agua registradas.</div>
        <q-btn
          color="primary"
          icon="add"
          label="Crear la primera"
          class="q-mt-md"
          @click="abrirFormFuente(null)"
        />
      </div>

      <div
        v-for="fuente in dataStore.fuentesAgua"
        :key="fuente.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <SmartWaterCard
          :fuente="fuente"
          @editar="abrirFormFuente"
          @eliminar="confirmarEliminar"
          @nuevo-analisis="abrirFormAnalisis"
          @ver-historial="abrirHistorial"
        />
      </div>
    </div>

    <q-dialog v-model="dialogos.formFuente" persistent class="glass-dialog-form">
      <FormFuenteAgua :fuente-editar="fuenteSeleccionada" @close="dialogos.formFuente = false" />
    </q-dialog>

    <q-dialog v-model="dialogos.formAnalisis" persistent class="glass-dialog-form">
      <FormAnalisisAgua
        v-if="fuenteSeleccionada"
        :fuente-id="fuenteSeleccionada.id"
        :fuente-nombre="fuenteSeleccionada.nombre"
        @close="dialogos.formAnalisis = false"
      />
    </q-dialog>

    <q-dialog v-model="dialogos.historial" class="glass-dialog-form">
      <DialogAnalisisHistorial
        v-if="fuenteSeleccionada"
        v-model="dialogos.historial"
        :fuente="fuenteSeleccionada"
      />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useDataStore } from 'stores/data-store'
import { useQuasar } from 'quasar'
import { LMap, LTileLayer, LMarker, LGeoJson, LPopup } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import { supabase } from 'boot/supabase'

import SmartWaterCard from 'components/agua/SmartWaterCard.vue'
import FormFuenteAgua from 'components/agua/FormFuenteAgua.vue'
import FormAnalisisAgua from 'components/agua/FormAnalisisAgua.vue'
import DialogAnalisisHistorial from 'components/agua/DialogAnalisisHistorial.vue'

const dataStore = useDataStore()
const $q = useQuasar()

const loading = ref(false)

const dialogos = reactive({
  formFuente: false,
  formAnalisis: false,
  historial: false,
})
const fuenteSeleccionada = ref(null)

const mapRef = ref(null)
const zoom = ref(14)
const mapCenter = ref([-26.1775, -58.1756]) // Formosa

const fuentesConGeo = computed(() => {
  return dataStore.fuentesAgua.filter((f) => f.geometria)
})

const potrerosGeoJson = computed(() => {
  const features = dataStore.potreros
    .filter((p) => p.geometria)
    .map((p) => ({
      type: 'Feature',
      properties: { nombre: p.nombre },
      geometry: p.geometria,
    }))
  return { type: 'FeatureCollection', features }
})

// Estilo para los polígonos en el mapa oscuro
const geoJsonOptions = computed(() => ({
  style: {
    color: '#39ff14', // Borde Verde Neón
    weight: 1,
    opacity: 0.6,
    fillColor: '#39ff14',
    fillOpacity: 0.05, // Relleno muy sutil
  },
}))

function getCoords(geometria) {
  if (geometria && geometria.type === 'Point' && geometria.coordinates) {
    // Leaflet usa [Lat, Lng], GeoJSON usa [Lng, Lat]
    return [geometria.coordinates[1], geometria.coordinates[0]]
  }
  return [-26.17, -58.17]
}

function getColorEstado(estado) {
  if (estado === 'Óptimo') return 'positive'
  if (estado === 'Precaución') return 'warning'
  if (estado === 'Peligro') return 'negative'
  return 'grey'
}

function getIcono(fuente) {
  let fillColor = '#9e9e9e'
  if (fuente.ultimo_estado === 'Óptimo') fillColor = '#00e676' // Verde Brillante
  if (fuente.ultimo_estado === 'Precaución') fillColor = '#ffea00' // Amarillo
  if (fuente.ultimo_estado === 'Peligro') fillColor = '#ff1744' // Rojo Neón

  const svg = `
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 0px 8px ${fillColor});">
      <path d="M12 2C7 2 3 7 3 10.5C3 12.1627 3.65992 13.8824 5.30514 15.6558C7.54572 18.068 10.5186 21.0963 11.5367 22.0833C11.724 22.2662 12.016 22.2662 12.2033 22.0833C13.2214 21.0963 16.1943 18.068 18.4349 15.6558C20.7628 13.2985 21 11.6033 21 10.5C21 7 17 2 12 2Z"
        stroke="#ffffff" stroke-width="1.5" fill="${fillColor}"/>
      <path d="M12 6C12 6 13.5 9 13.5 10.5C13.5 11.3284 12.8284 12 12 12C11.1716 12 10.5 11.3284 10.5 10.5C10.5 9 12 6 12 6Z" fill="rgba(255,255,255,0.4)"/>
    </svg>
  `
  return L.divIcon({
    className: 'custom-water-drop-icon',
    html: svg,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -35],
  })
}

function onMapReady() {
  setTimeout(() => {
    if (mapRef.value && mapRef.value.leafletObject) {
      mapRef.value.leafletObject.invalidateSize()
    }
  }, 200)

  if (potrerosGeoJson.value.features.length > 0) {
    try {
      const firstGeo = potrerosGeoJson.value.features[0].geometry.coordinates[0][0]
      mapCenter.value = [firstGeo[1], firstGeo[0]]
      zoom.value = 14
    } catch (e) {
      console.error(e)
    }
  } else if (fuentesConGeo.value.length > 0) {
    const firstFuenteCoords = getCoords(fuentesConGeo.value[0].geometria)
    mapCenter.value = firstFuenteCoords
    zoom.value = 15
  }
}

function abrirFormFuente(fuente) {
  fuenteSeleccionada.value = fuente
  dialogos.formFuente = true
}

async function abrirFormAnalisis(fuente) {
  // Carga Lazy del historial si no existe
  if (!fuente.analisis_de_agua || fuente.analisis_de_agua.length === 0) {
    const { data } = await supabase
      .from('analisis_de_agua')
      .select('*')
      .eq('fuente_id', fuente.id)
      .order('fecha_analisis', { ascending: false })
    if (data) fuente.analisis_de_agua = data
  }
  fuenteSeleccionada.value = fuente
  dialogos.formAnalisis = true
}

async function abrirHistorial(fuente) {
  if (!fuente.analisis_de_agua || fuente.analisis_de_agua.length === 0) {
    $q.notify({ type: 'ongoing', message: 'Cargando historial...' })
    const { data, error } = await supabase
      .from('analisis_de_agua')
      .select('*')
      .eq('fuente_id', fuente.id)
      .order('fecha_analisis', { ascending: false })

    if (error) {
      $q.notify({ type: 'negative', message: 'Error al cargar' })
    } else {
      fuente.analisis_de_agua = data
      $q.notify({ type: 'positive', message: 'Actualizado' })
    }
  }
  fuenteSeleccionada.value = fuente
  dialogos.historial = true
}

function confirmarEliminar(fuente) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Eliminar "${fuente.nombre}"?`,
    cancel: true,
    persistent: true,
    ok: { label: 'Eliminar', color: 'negative' },
    dark: true,
    class: 'glass-dialog-form',
  }).onOk(async () => {
    try {
      await dataStore.deleteFuenteAgua(fuente.id)
      $q.notify({ type: 'positive', message: 'Fuente eliminada' })
    } catch {
      $q.notify({ type: 'negative', message: 'Error al eliminar' })
    }
  })
}

onMounted(async () => {
  loading.value = true
  try {
    if (dataStore.fuentesAgua.length === 0) await dataStore.fetchFuentesAgua()
    if (dataStore.potreros.length === 0) await dataStore.fetchPotreros()
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
/* Estilos Generales */
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
  background: rgba(15, 15, 20, 0.7); /* Más oscuro para el mapa */
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  /* Importante: permite que el mapa defina la altura */
  height: auto;
}

/* Contenedor del Mapa */
.map-wrapper {
  height: 65vh; /* Altura vertical considerablemente mayor */
  min-height: 500px; /* Altura mínima para pantallas pequeñas */
  width: 100%;
  position: relative;
  background-color: #111; /* Fondo mientras carga */
}

/* Ajustes de Leaflet Dark */
:deep(.leaflet-popup-content-wrapper) {
  background: rgba(20, 20, 20, 0.9);
  color: white;
  border: 1px solid #39ff14;
  border-radius: 8px;
  backdrop-filter: blur(4px);
}
:deep(.leaflet-popup-tip) {
  background: rgba(20, 20, 20, 0.9);
  border: 1px solid #39ff14; /* Borde para el triangulito */
}

/* Estilos de Diálogo */
:deep(.glass-dialog-form .q-card) {
  background: rgba(40, 40, 40, 0.9) !important;
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
