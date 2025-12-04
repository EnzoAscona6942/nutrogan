<template>
  <q-card class="glass-dialog-form" style="width: 700px; max-width: 90vw">
    <q-form @submit.prevent="guardarFuente">
      <q-card-section>
        <div class="text-h6">{{ esEdicion ? 'Editar' : 'Nueva' }} Fuente de Agua</div>
      </q-card-section>

      <q-card-section class="row q-col-gutter-md">
        <div class="col-12 col-md-6 q-gutter-md">
          <q-input
            v-model="form.nombre"
            label="Nombre de la Fuente"
            outlined
            dark
            color="white"
            :rules="[(val) => !!val || 'Requerido']"
            autofocus
          />
          <q-select
            v-model="form.tipo"
            label="Tipo de Fuente"
            outlined
            dark
            color="white"
            :options="['Bebedero', 'Tanque', 'Represa', 'Pozo', 'Arroyo', 'Otro']"
            :rules="[(val) => !!val || 'Requerido']"
            popup-content-class="glass-dialog-form"
          />
          <q-select
            v-model="form.potrero_id"
            label="Asociar a Potrero (Opcional)"
            outlined
            dark
            color="white"
            :options="opcionesPotreros"
            emit-value
            map-options
            clearable
            hint="Dejar vacío si está en un corral"
            popup-content-class="glass-dialog-form"
          />
          <q-toggle
            v-model="form.es_inteligente"
            label="Es un bebedero inteligente (con sensor)"
            color="primary"
            dark
          />
        </div>

        <div class="col-12 col-md-6">
          <div class="text-caption text-grey-4 q-mb-xs">
            Haz clic en el mapa para (re)ubicar la fuente
          </div>
          <div
            class="map-container-form"
            style="height: 350px; border-radius: 8px; overflow: hidden; background: #111"
          >
            <l-map
              ref="mapRef"
              v-model:zoom="zoom"
              :center="mapCenter"
              :options="{ zoomControl: false }"
              style="height: 100%; width: 100%"
              @ready="onMapReady"
              @click="onMapClick"
            >
              <l-tile-layer
                url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                layer-type="base"
                name="Stadia Dark"
              />

              <l-geo-json
                v-if="potrerosGeoJson"
                :geojson="potrerosGeoJson"
                :options="geoJsonOptions"
              />

              <l-marker
                v-for="f in fuentesExistentes"
                :key="f.id"
                :lat-lng="[f.geometria.coordinates[1], f.geometria.coordinates[0]]"
                :icon="getIcono(f)"
              >
                <l-popup class="custom-popup">
                  <div class="text-caption text-black">
                    <strong>{{ f.nombre }}</strong> <br />
                    {{ f.tipo }}
                  </div>
                </l-popup>
              </l-marker>

              <l-marker v-if="form.geometria" :lat-lng="markerPos" :icon="markerIconEdit" />

              <div class="leaflet-bottom leaflet-right" style="margin: 10px; pointer-events: auto">
                <div class="column bg-dark rounded-borders shadow-2 overflow-hidden">
                  <q-btn flat dense icon="add" color="white" @click="zoom++" size="sm" />
                  <q-separator dark />
                  <q-btn flat dense icon="remove" color="white" @click="zoom--" size="sm" />
                </div>
              </div>
            </l-map>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="white" v-close-popup />
        <q-btn
          :label="esEdicion ? 'Actualizar' : 'Crear Fuente'"
          type="submit"
          color="primary"
          :loading="loading"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useDataStore } from 'stores/data-store'
import { useAuthStore } from 'stores/auth-store'
import { useQuasar } from 'quasar'
import { LMap, LTileLayer, LMarker, LGeoJson, LPopup } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

const props = defineProps({
  fuenteEditar: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const dataStore = useDataStore()
const authStore = useAuthStore()
const $q = useQuasar()
const loading = ref(false)

const form = reactive({
  id: null,
  nombre: '',
  tipo: null,
  potrero_id: null,
  es_inteligente: false,
  geometria: null,
  establecimiento_id: authStore.profile?.establecimiento_id,
})

const esEdicion = computed(() => !!props.fuenteEditar)

const opcionesPotreros = computed(() =>
  dataStore.potreros.map((p) => ({ label: p.nombre, value: p.id })),
)

// --- Lógica del Mapa ---
const mapRef = ref(null)
const zoom = ref(14)
const mapCenter = ref([-26.1775, -58.1756]) // Default

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

// Estilo Neón para el mapa oscuro
const geoJsonOptions = computed(() => ({
  style: {
    color: '#39ff14',
    weight: 1,
    opacity: 0.5,
    fillColor: '#39ff14',
    fillOpacity: 0.1,
  },
}))

// Filtramos para mostrar todas las fuentes EXCEPTO la que estamos editando (para no duplicarla)
const fuentesExistentes = computed(() => {
  return dataStore.fuentesAgua.filter((f) => f.geometria && f.id !== form.id)
})

// Icono para la fuente que estamos creando/editando (Verde Brillante y más grande)
const markerIconEdit = L.divIcon({
  className: 'custom-water-drop-icon',
  html: `
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 10px #39ff14);">
      <path d="M12 2C7 2 3 7 3 10.5C3 12.1627 3.65992 13.8824 5.30514 15.6558C7.54572 18.068 10.5186 21.0963 11.5367 22.0833C11.724 22.2662 12.016 22.2662 12.2033 22.0833C13.2214 21.0963 16.1943 18.068 18.4349 15.6558C20.7628 13.2985 21 11.6033 21 10.5C21 7 17 2 12 2Z"
        stroke="#ffffff" stroke-width="2" fill="#39ff14"/>
       <circle cx="12" cy="12" r="3" fill="rgba(255,255,255,0.6)" />
    </svg>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -45],
})

// Función para generar iconos de las OTRAS fuentes según su estado
function getIcono(fuente) {
  let fillColor = '#9e9e9e'
  if (fuente.ultimo_estado === 'Óptimo') fillColor = '#00e676'
  if (fuente.ultimo_estado === 'Precaución') fillColor = '#ffea00'
  if (fuente.ultimo_estado === 'Peligro') fillColor = '#ff1744'

  // Icono un poco más pequeño para las referencias
  const svg = `
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C7 2 3 7 3 10.5C3 12.1627 3.65992 13.8824 5.30514 15.6558C7.54572 18.068 10.5186 21.0963 11.5367 22.0833C11.724 22.2662 12.016 22.2662 12.2033 22.0833C13.2214 21.0963 16.1943 18.068 18.4349 15.6558C20.7628 13.2985 21 11.6033 21 10.5C21 7 17 2 12 2Z"
        stroke="#000000" stroke-width="1" fill="${fillColor}" fill-opacity="0.7"/>
    </svg>
  `
  return L.divIcon({
    className: 'custom-water-drop-icon',
    html: svg,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -25],
  })
}

const markerPos = computed(() => {
  if (form.geometria) {
    return [form.geometria.coordinates[1], form.geometria.coordinates[0]] // Lat, Lng
  }
  return null
})

function onMapReady() {
  // Forzar redimensionado para evitar gris
  setTimeout(() => {
    if (mapRef.value && mapRef.value.leafletObject) {
      mapRef.value.leafletObject.invalidateSize()
    }
  }, 300)

  if (props.fuenteEditar && props.fuenteEditar.geometria) {
    mapCenter.value = [
      props.fuenteEditar.geometria.coordinates[1],
      props.fuenteEditar.geometria.coordinates[0],
    ]
  } else if (dataStore.potreros.length > 0 && dataStore.potreros[0].geometria) {
    // Centrar en el primer potrero si no hay fuente editándose
    try {
      const coords = dataStore.potreros[0].geometria.coordinates[0][0]
      mapCenter.value = [coords[1], coords[0]]
    } catch (e) {
      console.error('Error centrando mapa:', e)
    }
  }
}

function onMapClick(event) {
  const { lat, lng } = event.latlng
  form.geometria = {
    type: 'Point',
    coordinates: [lng, lat], // GeoJSON es [Lng, Lat]
  }
}

async function guardarFuente() {
  loading.value = true
  try {
    if (esEdicion.value) {
      const updateData = { ...form }
      delete updateData.id
      delete updateData.establecimiento_id
      await dataStore.updateFuenteAgua(form.id, updateData)
      $q.notify({ type: 'positive', message: 'Fuente actualizada' })
    } else {
      const createData = { ...form }
      delete createData.id
      await dataStore.createFuenteAgua(createData)
      $q.notify({ type: 'positive', message: 'Fuente de agua creada' })
    }
    emit('close')
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

onMounted(() => {
  if (props.fuenteEditar) {
    form.id = props.fuenteEditar.id
    form.nombre = props.fuenteEditar.nombre
    form.tipo = props.fuenteEditar.tipo
    form.potrero_id = props.fuenteEditar.potrero_id
    form.es_inteligente = props.fuenteEditar.es_inteligente
    form.geometria = props.fuenteEditar.geometria ? { ...props.fuenteEditar.geometria } : null
  }
})
</script>

<style lang="scss" scoped>
.map-container-form {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

/* Estilos para los popups dentro del mapa oscuro */
:deep(.leaflet-popup-content-wrapper) {
  background: rgba(255, 255, 255, 0.9);
  color: black;
  border-radius: 6px;
}
:deep(.leaflet-popup-tip) {
  background: rgba(255, 255, 255, 0.9);
}
</style>
