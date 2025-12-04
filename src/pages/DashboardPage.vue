<template>
  <q-page class="map-page bg-dark text-white">
    <div class="absolute-top-left q-ma-md" style="z-index: 4000; pointer-events: none">
      <div
        class="page-title-box"
        style="pointer-events: auto; font-size: 2rem; font-weight: 700; margin-bottom: 0"
      >
        Dashboard
      </div>
    </div>

    <div class="map-container relative-position shadow-10">
      <l-map
        ref="mapRef"
        v-model:zoom="zoom"
        :center="mapCenter"
        :options="{
          zoomControl: false,
          attributionControl: false,
          fadeAnimation: true,
          dragging: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
        }"
        style="height: 100%; width: 100%; z-index: 0"
        @ready="onMapReady"
      >
        <l-tile-layer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          layer-type="base"
          name="Stadia Dark"
        />
        <l-geo-json v-if="potrerosGeoJson" :geojson="potrerosGeoJson" :options="geoJsonOptions" />
      </l-map>

      <div class="markers-overlay absolute-full no-pointer-events" style="z-index: 2000">
        <div
          v-for="potrero in potrerosConPosicion"
          :key="potrero.id"
          class="map-marker-wrapper all-pointer-events"
          :style="{ top: potrero.y + 'px', left: potrero.x + 'px' }"
        >
          <div
            class="pro-marker cursor-pointer column flex-center"
            :class="{
              occupied: potrero.loteAsignado,
              free: !potrero.loteAsignado,
              'drop-target-active': isDraggingFromCorral && !potrero.loteAsignado,
            }"
            @click.stop="selectPotrero(potrero)"
            @dragover.prevent
            @drop="onDropOnPotrero(potrero)"
            :draggable="!!potrero.loteAsignado"
            @dragstart="onDragStartMap(potrero, $event)"
          >
            <div
              v-if="potrero.loteAsignado"
              class="map-lote-icon"
              :style="{
                '-webkit-mask-image': `url(${getLoteIconPath(potrero.loteAsignado)})`,
                'mask-image': `url(${getLoteIconPath(potrero.loteAsignado)})`,
              }"
            ></div>

            <div v-else class="custom-grass-icon"></div>

            <div v-if="potrero.loteAsignado" class="marker-count">
              {{ potrero.loteAsignado.cantidad_animales }}
            </div>
          </div>

          <div class="marker-label">{{ potrero.nombre }}</div>
        </div>
      </div>

      <transition name="slide-right">
        <div
          v-if="selectedPotrero"
          class="absolute-top-right q-ma-md z-max all-pointer-events"
          style="z-index: 3000"
        >
          <ProDetailCard
            :potrero-data="selectedPotrero.potreroData"
            :lote-data="selectedPotrero.loteData"
            @close="selectedPotrero = null"
            @view-history="irADetalle(selectedPotrero.loteData?.id)"
            @drag-lote="onCardDragStart"
          />
        </div>
      </transition>

      <div
        class="absolute-bottom-right q-ma-md column z-top all-pointer-events"
        style="z-index: 3000"
      >
        <q-btn round color="dark" text-color="white" icon="my_location" @click="centrarMapa(true)">
          <q-tooltip>Mi Ubicación</q-tooltip>
        </q-btn>

        <div class="column bg-dark rounded-borders overflow-hidden shadow-2 q-mt-sm">
          <q-btn flat dense icon="add" color="white" @click="zoom++" />
          <q-separator dark />
          <q-btn flat dense icon="remove" color="white" @click="zoom--" />
        </div>
      </div>

      <div
        v-if="isDraggingFromCorral"
        class="absolute-full flex flex-center drop-hint no-pointer-events"
        style="z-index: 1000"
      >
        <div class="hint-pill bounce">
          <q-icon name="south" class="q-mr-sm" /> Suelta sobre un marcador VERDE
        </div>
      </div>
    </div>

    <div class="corral-section column relative-position">
      <div class="corral-header row items-center justify-between q-px-lg q-py-sm bg-glass">
        <div class="row items-center">
          <q-img
            src="icons/corral.svg"
            style="width: 32px; height: 32px"
            class="q-mr-sm"
            fit="contain"
          />
          <div class="column">
            <span class="text-subtitle1 text-weight-bold leading-none text-white">MI CORRAL</span>
            <span class="text-caption text-grey-5">Lotes sin asignar</span>
          </div>
        </div>
        <q-badge outline color="primary" :label="`${lotesDisponibles.length} Lotes`" />
      </div>

      <div
        class="corral-content col relative-position scroll q-pa-md"
        @dragover.prevent
        @drop="onDropCorral"
        :class="{ 'drag-target-active': isDraggingFromMap }"
      >
        <div
          v-if="lotesDisponibles.length === 0"
          class="absolute-center text-center text-grey-7 z-0"
        >
          <q-icon name="check_circle_outline" size="4em" class="q-mb-sm opacity-50" />
          <div>Corral Vacío</div>
        </div>

        <div class="row q-col-gutter-md z-10 relative-position full-width">
          <div
            v-for="lote in lotesDisponibles"
            :key="lote.id"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <q-card
              class="lote-card cursor-grab"
              flat
              draggable="true"
              @dragstart="onDragStartCorral($event, lote)"
              @dragend="onDragEnd"
              @click="selectLote(lote)"
            >
              <q-card-section class="row items-center no-wrap q-pa-sm">
                <div class="corral-icon-box q-mr-md">
                  <div
                    class="corral-icon-shape"
                    :style="{
                      '-webkit-mask-image': `url(${getLoteIconPath(lote)})`,
                      'mask-image': `url(${getLoteIconPath(lote)})`,
                    }"
                  ></div>
                </div>
                <div class="column overflow-hidden col">
                  <div class="text-subtitle2 text-weight-bold text-white ellipsis">
                    {{ lote.identificacion }}
                  </div>
                  <div class="text-caption text-grey-4">
                    <q-badge :color="getObjetivoColor(lote.objetivo)" class="q-mr-xs">
                      {{ lote.objetivo }}
                    </q-badge>
                    | {{ lote.cantidad_animales }} cabezas
                  </div>
                </div>
                <q-icon name="drag_indicator" color="grey-7" />
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div
          v-if="isDraggingFromMap"
          class="absolute-full flex flex-center drop-overlay-active no-pointer-events"
        >
          <div class="drop-target-box bounce">
            <q-icon name="input" size="3em" class="q-mb-sm text-cyan-4" />
            <div class="text-h5 text-weight-bold text-cyan-4">SOLTAR AQUÍ</div>
            <div class="text-caption text-cyan-2">Devolver lote al corral</div>
          </div>
        </div>
      </div>
    </div>

    <q-inner-loading :showing="globalLoading" dark class="z-max">
      <q-spinner-gears size="50px" color="primary" />
      <div class="text-white q-mt-sm font-weight-bold">{{ loadingMessage }}</div>
    </q-inner-loading>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useDataStore } from 'stores/data-store'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import 'leaflet/dist/leaflet.css'
import { LMap, LTileLayer, LGeoJson } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import ProDetailCard from 'components/dashboard/ProDetailCard.vue'
import { useSound } from 'src/composables/useSound'

const dataStore = useDataStore()
const $q = useQuasar()
const router = useRouter()
const { playMuu } = useSound()

const zoom = ref(14)
const mapCenter = ref([-26.1775, -58.1756])
let mapObject = null
const mapRef = ref(null)

const selectedPotrero = ref(null)
const isDraggingFromCorral = ref(false)
const isDraggingFromMap = ref(false)
const draggingPayload = ref(null)
const markerPositions = ref({})
const globalLoading = ref(false)
const loadingMessage = ref('Procesando...')

const lotesDisponibles = computed(() => dataStore.lotes.filter((l) => !l.potrero_actual_id))

const potrerosGeoJson = computed(() => {
  const features = dataStore.potreros
    .filter((p) => p.geometria)
    .map((p) => {
      let geometry = typeof p.geometria === 'string' ? JSON.parse(p.geometria) : p.geometria
      if (geometry.type === 'Feature') geometry = geometry.geometry
      const ocupado = !!lotesEnPotrero(p.id)
      return { type: 'Feature', properties: { id: p.id, ocupado }, geometry }
    })
  return { type: 'FeatureCollection', features }
})

const potrerosConPosicion = computed(() => {
  return dataStore.potreros
    .filter((p) => p.geometria)
    .map((p) => {
      const pos = markerPositions.value[p.id] || { x: -1000, y: -1000 }
      return {
        ...p,
        x: pos.x,
        y: pos.y,
        loteAsignado: lotesEnPotrero(p.id),
      }
    })
})

const geoJsonOptions = computed(() => ({
  style: (feature) => ({
    color: feature.properties.ocupado ? '#00e5ff' : '#39ff14',
    weight: 2,
    opacity: 0.6,
    fillColor: feature.properties.ocupado ? '#0037ff' : '#39ff14',
    fillOpacity: 0.15,
  }),
}))

function updateMarkerPositions() {
  if (!mapObject) return

  const newPositions = {}
  dataStore.potreros.forEach((p) => {
    if (!p.geometria) return
    let coords = []
    try {
      let geo = typeof p.geometria === 'string' ? JSON.parse(p.geometria) : p.geometria
      if (geo.type === 'Feature') geo = geo.geometry
      coords = geo.coordinates[0]
    } catch {
      return
    }

    if (!coords) return
    let latSum = 0,
      lngSum = 0
    coords.forEach((c) => {
      lngSum += c[0]
      latSum += c[1]
    })
    const centerLat = latSum / coords.length
    const centerLng = lngSum / coords.length

    try {
      const point = mapObject.latLngToContainerPoint([centerLat, centerLng])
      newPositions[p.id] = { x: point.x, y: point.y }
    } catch {
      // Ignorar proyecciones fuera de pantalla
    }
  })
  markerPositions.value = newPositions
}

function onMapReady(map) {
  mapObject = map
  map.on('move', updateMarkerPositions)
  map.on('zoom', updateMarkerPositions)
  map.on('resize', updateMarkerPositions)

  setTimeout(() => {
    if (mapObject && mapObject.getContainer()) {
      try {
        mapObject.invalidateSize()
      } catch {
        // ignore
      }
      updateMarkerPositions()
    }
  }, 400)
}

let notificacionGPS = null

function centrarMapa(intentarAltaPrecision = true) {
  if (!mapObject) return

  if (!('geolocation' in navigator)) {
    $q.notify({
      message: 'Tu navegador no soporta geolocalización',
      color: 'warning',
      icon: 'warning',
    })
    return
  }

  if (intentarAltaPrecision) {
    if (notificacionGPS) notificacionGPS()
    notificacionGPS = $q.notify({
      message: 'Buscando señal GPS...',
      color: 'primary',
      icon: 'gps_fixed',
      timeout: 0,
      actions: [{ icon: 'close', color: 'white' }],
    })
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      if (notificacionGPS) notificacionGPS()
      const { latitude, longitude } = position.coords

      mapObject.flyTo([latitude, longitude], 16, {
        animate: true,
        duration: 1.5,
      })

      L.circleMarker([latitude, longitude], {
        radius: 8,
        fillColor: '#3388ff',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      })
        .addTo(mapObject)
        .bindPopup('Tu Ubicación')
        .openPopup()

      $q.notify({
        message: 'Ubicación encontrada',
        color: 'positive',
        icon: 'check',
        timeout: 2000,
      })
    },
    (error) => {
      if (intentarAltaPrecision) {
        centrarMapa(false)
        return
      }
      if (notificacionGPS) notificacionGPS()
      let msg = 'No se pudo obtener la ubicación.'
      if (error.code === 1) msg = 'Permiso de ubicación denegado.'
      $q.notify({
        message: msg,
        color: 'negative',
        icon: 'location_disabled',
      })
    },
    {
      enableHighAccuracy: intentarAltaPrecision,
      timeout: 5000,
      maximumAge: 0,
    },
  )
}

function onDragStartCorral(event, lote) {
  isDraggingFromCorral.value = true
  draggingPayload.value = { type: 'corral_lote', loteId: lote.id }
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', JSON.stringify(draggingPayload.value))
  selectedPotrero.value = null
}

function onCardDragStart(payload) {
  isDraggingFromMap.value = true
  draggingPayload.value = payload
}

function onDragStartMap(potrero, event) {
  if (!potrero.loteAsignado) return
  isDraggingFromMap.value = true
  draggingPayload.value = {
    type: 'card_lote',
    loteId: potrero.loteAsignado.id,
    potreroOrigenId: potrero.id,
  }
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', JSON.stringify(draggingPayload.value))
}

function onDragEnd() {
  isDraggingFromCorral.value = false
  isDraggingFromMap.value = false
  draggingPayload.value = null
}

async function onDropOnPotrero(potrero) {
  if (isDraggingFromCorral.value && draggingPayload.value?.type === 'corral_lote') {
    if (potrero.loteAsignado) {
      $q.notify({ message: 'Potrero ocupado', color: 'warning' })
      onDragEnd()
      return
    }

    try {
      globalLoading.value = true
      loadingMessage.value = 'Asignando lote...'
      await dataStore.moverLote(draggingPayload.value.loteId, potrero.id)
      await dataStore.fetchLotes()
      playMuu()
      $q.notify({ message: 'Lote Asignado', color: 'positive', icon: 'check' })
    } catch (err) {
      console.error(err)
      $q.notify({ message: 'Error al mover.', color: 'negative' })
    } finally {
      globalLoading.value = false
      onDragEnd()
    }
  }
}

async function onDropCorral(e) {
  let data = draggingPayload.value
  if (!data) {
    try {
      data = JSON.parse(e.dataTransfer.getData('text/plain'))
    } catch {
      /* ignore */
    }
  }

  if (data && data.type === 'card_lote') {
    try {
      globalLoading.value = true
      loadingMessage.value = 'Regresando al corral...'
      await dataStore.moverLoteACorral(data.loteId, data.potreroOrigenId)
      await dataStore.fetchLotes()
      playMuu()
      $q.notify({ message: 'Lote en Corral', color: 'info', icon: 'home' })
      selectedPotrero.value = null
    } catch (err) {
      console.error(err)
      $q.notify({ message: 'Error al mover.', color: 'negative' })
    } finally {
      globalLoading.value = false
      onDragEnd()
    }
  }
  onDragEnd()
}

function selectPotrero(potrero) {
  const lote = potrero.loteAsignado
  selectedPotrero.value = {
    potreroData: {
      id: potrero.id,
      nombre: potrero.nombre,
      superficie: potrero.superficie_ha?.toFixed(1) || 0,
      ndvi: potrero.ultimo_ndvi?.toFixed(2) || '-',
      ubicacion: `${potrero.ciudad || ''}`,
    },
    loteData: lote
      ? {
          id: lote.id,
          identificacion: lote.identificacion,
          cantidad: lote.cantidad_animales,
          objetivo: lote.objetivo,
          peso: lote.peso_ingreso_kg || '-',
          fechaIngreso: formatearFecha(potrero.fecha_entrada),
          icon: getLoteIconPath(lote),
        }
      : null,
  }
}

function selectLote(lote) {
  $q.notify({
    message: `${lote.identificacion}`,
    caption: 'Arrastra al mapa para asignar',
    color: 'dark',
    icon: 'touch_app',
  })
}

function irADetalle(id) {
  if (id) router.push(`/lote/${id}`)
}

function lotesEnPotrero(id) {
  return dataStore.lotes.find((l) => l.potrero_actual_id === id)
}

function getLoteIconPath(lote) {
  const objetivo = lote.objetivo ? String(lote.objetivo).toLowerCase() : 'default'
  let iconName = 'default'

  if (objetivo.includes('recría') || objetivo.includes('recria')) {
    iconName = 'recria'
  } else if (objetivo.includes('cría') || objetivo.includes('cria')) {
    iconName = 'cria'
  } else if (objetivo.includes('engorde')) {
    iconName = 'engorde'
  }

  // Aseguramos ruta absoluta para la máscara CSS
  return `/icons/${iconName}.svg`
}

function getObjetivoColor(obj) {
  if (obj === 'Engorde') return 'green-9'
  if (obj === 'Recría') return 'cyan-9'
  if (obj === 'Cría') return 'blue-10'
  return 'blue-grey-8'
}

function formatearFecha(f) {
  return f ? new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }) : '-'
}

onMounted(async () => {
  await dataStore.fetchAll()
})
watch(
  () => dataStore.potreros,
  () => {
    nextTick(updateMarkerPositions)
  },
  { deep: true },
)
</script>

<style lang="scss" scoped>
/* Estilos generales (Mapa y Layout) */
.map-container {
  flex: 1;
  width: 100%;
  min-height: 400px;
  border-bottom: 4px solid #009dff;
  background: #11111138;
  z-index: 1;
  position: relative;
}
.corral-section {
  height: 350px;
  flex-shrink: 0;
  background:
    linear-gradient(to bottom, rgba(150, 150, 150, 0), rgba(0, 255, 145, 0.456)),
    url('src/assets/nutrogan-bg2.png');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  z-index: 2;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.8);
  border-top: 1px solid rgba(0, 251, 255, 0.385);
}
.page-title-box {
  background: #000000;
  color: #ffffff;
  border: 2px solid #ffffff;
  border-radius: 20px;
  padding: 8px 24px;
  display: inline-block;
  font-family: 'Outfit', sans-serif;
  font-size: 1.5rem;
  margin-bottom: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

/* Marcadores Mapa */
.markers-overlay {
  z-index: 1000;
}
.map-marker-wrapper {
  position: absolute;
  transform: translate(-50%, -50%);
  transition:
    top 0.05s,
    left 0.05s;
}
.pro-marker {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border: 2px solid;
  background: rgba(0, 0, 0, 0.7);
  &.free {
    border-color: #39ff14;
    color: #39ff14;
    &:hover {
      transform: scale(1.2);
      box-shadow: 0 0 20px #39ff14;
      background: #000;
    }
  }
  &.occupied {
    border-color: #00e5ff;
    color: #00e5ff;
    background: rgba(0, 50, 60, 0.9);
    &:hover {
      transform: scale(1.2);
      box-shadow: 0 0 20px #00e5ff;
    }
  }
  &.drop-target-active {
    transform: scale(1.3);
    box-shadow: 0 0 30px #39ff14;
    animation: pulse 1s infinite;
    background: rgba(57, 255, 20, 0.3);
  }
}

/* --- ICONOS SVG (MÁSCARAS) --- */

/* Icono Pasto (Mapa Libre) */
.custom-grass-icon {
  width: 26px;
  height: 26px;
  background-color: currentColor;
  -webkit-mask-image: url('/icons/potrero.svg');
  mask-image: url('/icons/potrero.svg');
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}

/* Icono Animal (Mapa Ocupado) */
.map-lote-icon {
  width: 28px;
  height: 28px;
  background-color: currentColor;
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}

/* CAJA ICONO CORRAL (Fondo Negro, Borde Verde) */
.corral-icon-box {
  width: 50px;
  height: 50px;
  min-width: 50px;
  border-radius: 12px;
  background-color: #000000; /* Fondo negro sólido */
  border: 2px solid #39ff14; /* Borde verde */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 12px rgba(57, 255, 20, 0.2);
}

/* FORMA ANIMAL CORRAL (Relleno Verde) */
.corral-icon-shape {
  width: 30px;
  height: 30px;
  background-color: #39ff14; /* Animal verde */
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}

.marker-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #0037ff;
  color: white;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 10px;
  border: 1px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}
.marker-label {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 4px;
  margin-top: 4px;
  white-space: nowrap;
}
.corral-header {
  background: rgba(25, 26, 30, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.corral-content {
  overflow-y: auto;
  background-image: radial-gradient(circle at 50% 0%, rgba(45, 224, 13, 0.03), transparent 70%);
}
.lote-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.2s;
  &:hover {
    background: rgba(4, 4, 4, 0.08);
    border-color: #39ff14;
    transform: translateY(-2px);
  }
}
.drop-hint {
  background: rgba(183, 102, 102, 0.4);
  z-index: 2000;
}
.hint-pill {
  background: rgba(0, 0, 0, 0.9);
  border: 2px dashed #39ff14;
  color: #39ff14;
  padding: 10px 20px;
  border-radius: 50px;
  font-weight: bold;
}
.drop-overlay-active {
  background: rgba(0, 229, 255, 0.15);
  backdrop-filter: blur(4px);
  z-index: 100;
}
.drop-target-box {
  border: 3px dashed #00e5ff;
  padding: 40px;
  border-radius: 20px;
  color: #00e5ff;
  font-weight: 900;
  background: rgba(0, 0, 0, 0.8);
  text-align: center;
}
.bounce {
  animation: bounce 1s infinite;
}
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(57, 255, 20, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(57, 255, 20, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(57, 255, 20, 0);
  }
}
.z-max {
  z-index: 2000;
}
</style>
