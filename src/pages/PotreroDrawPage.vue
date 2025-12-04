<template>
  <q-page padding class="dashboard-pro-bg text-white">
    <div class="row items-center q-mb-md">
      <q-btn flat round dense icon="arrow_back" @click="$router.back()" />
      <div class="page-title-box q-ml-md" style="margin-bottom: 0; font-size: 1.75rem">
        {{ potreroNombre }}
      </div>
      <q-space />
      <q-btn
        label="Guardar Polígono"
        color="primary"
        icon="save"
        @click="guardarGeometria"
        :loading="loading"
        :disable="!potreroGeoJson"
      />
    </div>

    <q-banner inline-actions rounded class="bg-grey-9 text-white q-mb-md">
      <template v-slot:avatar>
        <q-icon name="info" />
      </template>
      <span class="text-weight-medium">Consejos para un polígono válido:</span>
      <ul class="q-my-sm q-pl-md text-caption">
        <li>Usa la herramienta <q-icon name="draw" /> para dibujar.</li>
        <li>Haz clic en el primer punto para cerrar el polígono.</li>
      </ul>
    </q-banner>

    <q-banner
      v-if="areaActual !== null"
      inline-actions
      rounded
      :class="bannerClass"
      class="q-mb-md"
    >
      <template v-slot:avatar>
        <q-icon :name="areaIcon" />
      </template>
      <div class="text-weight-medium">
        Área actual: {{ areaActual.toFixed(2) }} hectáreas
        <span v-if="areaActual < 0.5" class="text-red-9"> (Mínimo requerido: 0.5 ha) </span>
      </div>
    </q-banner>

    <div class="map-container shadow-2">
      <l-map
        v-if="mapReady"
        ref="mapRef"
        v-model:zoom="zoom"
        :center="mapCenter"
        style="height: 100%; width: 100%"
        @ready="onMapReady"
      >
        <l-tile-layer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          layer-type="base"
          name="Esri World Imagery"
        />

        <l-geo-json
          v-if="potreroGeoJson && !editando"
          :geojson="potreroGeoJson"
          :options="geoJsonOptions"
        />
      </l-map>

      <div v-if="!mapReady" class="absolute-full flex flex-center bg-grey-2">
        <q-spinner-dots color="primary" size="3em" />
        <div class="q-ml-md text-grey">Cargando mapa...</div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'
import { useDataStore } from 'stores/data-store'
import axios from 'axios'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet-draw'
// Fix iconos Leaflet
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })
import { LMap, LTileLayer, LGeoJson } from '@vue-leaflet/vue-leaflet'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const dataStore = useDataStore()
const potreroId = route.params.id
const potreroNombre = ref('Cargando...')

const loading = ref(false)
const mapReady = ref(false)
const editando = ref(false)
const zoom = ref(15)
const mapCenter = ref([-26.1775, -58.1756])
const areaActual = ref(null)

const potreroGeoJson = ref(null)
const drawLayerGroup = shallowRef(null) // ShallowRef para evitar problemas de Proxy

const geoJsonStyle = {
  color: '#FF0000',
  weight: 3,
  opacity: 0.8,
  fillOpacity: 0.2,
  fillColor: '#FF0000',
}
const geoJsonOptions = computed(() => ({ style: () => geoJsonStyle }))

const bannerClass = computed(() =>
  !areaActual.value
    ? 'bg-grey-2'
    : areaActual.value < 0.5
      ? 'bg-red-1 text-red-9'
      : 'bg-green-1 text-green-9',
)
const areaIcon = computed(() =>
  !areaActual.value ? 'crop_free' : areaActual.value < 0.5 ? 'error' : 'check_circle',
)

watch(potreroGeoJson, (newVal) => {
  if (newVal) areaActual.value = calcularAreaHa(newVal)
  else areaActual.value = null
})

async function onMapReady(mapObject) {
  drawLayerGroup.value = new L.FeatureGroup()
  mapObject.addLayer(drawLayerGroup.value)

  if (potreroGeoJson.value) {
    const layer = L.geoJSON(potreroGeoJson.value, { style: geoJsonStyle })
    layer.eachLayer((l) => drawLayerGroup.value.addLayer(l))

    await nextTick()
    try {
      mapObject.fitBounds(layer.getBounds(), { padding: [50, 50] })
    } catch {
      // Ignorar error de fitBounds
    }
  }

  const drawControl = new L.Control.Draw({
    position: 'topleft',
    draw: {
      polygon: {
        allowIntersection: false,
        shapeOptions: geoJsonStyle,
        drawError: { color: '#e1e100', message: '<strong>Error:</strong> ¡Cruce de líneas!' },
      },
      marker: false,
      circlemarker: false,
      polyline: false,
      rectangle: false,
      circle: false,
    },
    edit: { featureGroup: drawLayerGroup.value },
  })

  mapObject.addControl(drawControl)

  // --- CORRECCIÓN: Usar strings literales para los eventos ---

  mapObject.on('draw:created', (e) => {
    const layer = e.layer
    drawLayerGroup.value.clearLayers()
    drawLayerGroup.value.addLayer(layer)

    const geoJSON = layer.toGeoJSON()
    potreroGeoJson.value = geoJSON

    // Mantener editando=true para que <l-geo-json> no se renderice y cause conflicto
    editando.value = true
  })

  mapObject.on('draw:edited', (e) => {
    const layers = e.layers
    layers.eachLayer((layer) => {
      potreroGeoJson.value = layer.toGeoJSON()
    })
    editando.value = true
  })

  mapObject.on('draw:deleted', () => {
    potreroGeoJson.value = null
    areaActual.value = null
  })

  mapObject.on('draw:drawstart', () => (editando.value = true))
  mapObject.on('draw:editstart', () => (editando.value = true))
}

function calcularAreaHa(geojson) {
  let geometry = geojson
  if (geometry && geometry.type === 'Feature') geometry = geometry.geometry
  if (!geometry || geometry.type !== 'Polygon' || !geometry.coordinates?.[0]) return null

  const coords = geometry.coordinates[0]
  if (coords.length < 4) return 0

  let area = 0
  for (let i = 0; i < coords.length - 1; i++) {
    area += coords[i][0] * coords[i + 1][1] - coords[i + 1][0] * coords[i][1]
  }
  area = Math.abs(area / 2)
  const latMedia = coords[0][1] * (Math.PI / 180)
  const mPerLat = 111132.95
  const mPerLng = 111412.84 * Math.cos(latMedia)

  const areaMetros = area * (mPerLat * mPerLng)
  return areaMetros / 10000
}

async function reverseGeocode(lat, lng) {
  try {
    const { data } = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
    )
    return {
      ciudad: data.address?.city || data.address?.town || '',
      provincia: data.address?.state || '',
    }
  } catch {
    return { ciudad: null, provincia: null }
  }
}

async function guardarEnSupabase() {
  loading.value = true
  const geo = JSON.parse(JSON.stringify(potreroGeoJson.value))
  if (geo.crs) delete geo.crs
  const geometry = geo.type === 'Feature' ? geo.geometry : geo

  const [lng, lat] = geometry.coordinates[0][0]
  const loc = await reverseGeocode(lat, lng)

  try {
    const { error } = await supabase
      .from('potreros')
      .update({
        geometria: geometry,
        superficie_ha: areaActual.value,
        ciudad: loc.ciudad,
        provincia: loc.provincia,
      })
      .eq('id', potreroId)

    if (error) throw error

    await dataStore.fetchPotreros()
    $q.notify({ color: 'positive', message: 'Polígono guardado exitosamente' })
    router.back()
  } catch (e) {
    $q.notify({ color: 'negative', message: 'Error al guardar: ' + e.message })
  } finally {
    loading.value = false
  }
}

async function guardarGeometria() {
  if (!potreroGeoJson.value) return
  if ((areaActual.value || 0) < 0.5) {
    $q.dialog({
      title: 'Área pequeña',
      message: 'Menos de 0.5ha. ¿Guardar igual?',
      cancel: true,
      persistent: true,
    }).onOk(guardarEnSupabase)
  } else {
    guardarEnSupabase()
  }
}

onMounted(async () => {
  if (dataStore.potreros.length === 0) await dataStore.fetchPotreros()
  const p = dataStore.getPotreroById(potreroId)
  if (p) {
    potreroNombre.value = p.nombre
    if (p.geometria) {
      potreroGeoJson.value = typeof p.geometria === 'string' ? JSON.parse(p.geometria) : p.geometria
    }
    mapReady.value = true
  } else {
    router.back()
  }
})
</script>

<style>
.leaflet-draw-toolbar a {
  background-color: white;
  border: 1px solid #ccc;
}
.dashboard-pro-bg {
  background-image: url('src/assets/nutrogan-bg.png');
  background-size: cover;
  min-height: 100vh;
}
.page-title-box {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}
.map-container {
  height: 65vh;
  border-radius: 8px;
  overflow: hidden;
}
</style>
