<template>
  <q-card class="establishment-dashboard full-height column no-shadow relative-position">
    <div class="map-header relative-position">
      <l-map
        ref="mapRef"
        :zoom="zoom"
        :center="markerPosition"
        :options="{ zoomControl: false, attributionControl: false }"
        style="height: 100%; width: 100%"
        @ready="onMapReady"
      >
        <l-tile-layer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          layer-type="base"
          name="Stadia Dark"
        />
        <l-marker
          :lat-lng="markerPosition"
          draggable
          @update:latLng="updatePinPosition"
          :icon="pinIcon"
        >
          <l-popup class="custom-popup">
            <div class="text-caption text-weight-bold">Ubicación del Casco</div>
            <div class="text-caption text-grey">Arrastra para corregir</div>
          </l-popup>
        </l-marker>
      </l-map>

      <div class="map-gradient-overlay"></div>

      <div class="absolute-top-right q-ma-md">
        <q-btn
          round
          dense
          flat
          icon="save"
          color="primary"
          class="glass-btn"
          :loading="loading"
          @click="guardarCambios"
        >
          <q-tooltip>Guardar Cambios</q-tooltip>
        </q-btn>
      </div>
    </div>

    <div class="info-body col column bg-dark-surface q-px-md q-pb-md">
      <div class="row items-end justify-between q-mt-n-lg relative-position z-10 q-mb-md">
        <div class="col">
          <div class="text-caption text-primary text-weight-bold q-mb-xs tracking-wide">
            ESTABLECIMIENTO
          </div>
          <q-input
            v-model="form.nombre"
            borderless
            dense
            class="text-h5 text-white font-display input-transparent"
            placeholder="Nombre del Campo"
          />
          <div class="row q-gutter-x-sm q-mt-xs">
            <q-input
              v-model="form.ciudad"
              borderless
              dense
              class="text-caption text-grey-5 input-compact"
              placeholder="Ciudad"
              style="width: 100px"
            />
            <span class="text-grey-7">|</span>
            <q-input
              v-model="form.provincia"
              borderless
              dense
              class="text-caption text-grey-5 input-compact"
              placeholder="Provincia"
              style="width: 100px"
            />
          </div>
        </div>
      </div>

      <q-separator dark class="q-mb-md opacity-20" />

      <q-scroll-area class="col">
        <div class="q-gutter-y-md">
          <div class="metric-card border-l-primary">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle2 text-grey-4">
                <q-icon name="pets" class="q-mr-xs" /> Rodeo Activo
              </div>
              <div class="text-h6 text-white font-numeric">
                {{ stats.totalCabezas }} <span class="text-caption text-grey-6">cbz</span>
              </div>
            </div>
            <div class="row q-col-gutter-xs">
              <div v-for="(qty, cat) in stats.lotesPorCategoria" :key="cat" class="col-4">
                <div class="bg-dark-soft q-pa-xs rounded-borders text-center">
                  <div class="text-xs text-grey-5 text-uppercase">{{ cat }}</div>
                  <div class="text-subtitle2 text-primary font-numeric">{{ qty }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="metric-card border-l-cyan">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle2 text-grey-4">
                <q-icon name="fence" class="q-mr-xs" /> Uso de Suelo
              </div>
              <div class="text-h6 text-white font-numeric">
                {{ stats.totalPotreros }} <span class="text-caption text-grey-6">lotes</span>
              </div>
            </div>
            <div class="row items-center q-gutter-x-md">
              <div class="column items-center">
                <q-circular-progress
                  :value="(stats.potrerosOcupados / (stats.totalPotreros || 1)) * 100"
                  size="50px"
                  :thickness="0.2"
                  color="cyan-4"
                  track-color="grey-9"
                  class="q-ma-xs"
                />
              </div>
              <div class="col">
                <div class="row justify-between q-mb-xs">
                  <span class="text-caption text-cyan-4">● Ocupados</span>
                  <span class="text-caption text-white">{{ stats.potrerosOcupados }}</span>
                </div>
                <div class="row justify-between">
                  <span class="text-caption text-grey-6">● Descanso</span>
                  <span class="text-caption text-white">{{ stats.potrerosDescanso }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="metric-card border-l-orange">
            <div class="row items-center justify-between">
              <div class="text-subtitle2 text-grey-4">
                <q-icon name="water_drop" class="q-mr-xs" /> Hidratación
              </div>
              <q-badge
                color="orange-9"
                text-color="white"
                :label="`${stats.totalFuentes} Fuentes`"
              />
            </div>
            <div class="q-mt-sm text-caption text-grey-5">
              Infraestructura hídrica disponible para el rodeo.
            </div>
          </div>
        </div>
      </q-scroll-area>
    </div>
  </q-card>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useDataStore } from 'stores/data-store'
import { useQuasar } from 'quasar'
import { supabase } from 'boot/supabase'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const store = useDataStore()
const $q = useQuasar()
const loading = ref(false)

// Mapa
const zoom = ref(13)
const markerPosition = ref([-26.1775, -58.1756]) // Default Formosa
const mapRef = ref(null)

// Formulario
const form = reactive({
  nombre: '',
  ciudad: '',
  provincia: '',
  pin_location: null,
})

// --- ESTADÍSTICAS COMPUTADAS (Inteligencia de Negocio) ---
const stats = computed(() => {
  const lotes = store.lotes || []
  const potreros = store.potreros || []
  const fuentes = store.fuentesAgua || []

  // 1. Rodeo
  const totalCabezas = lotes.reduce((sum, l) => sum + (l.cantidad_animales || 0), 0)
  const lotesPorCategoria = {}

  lotes.forEach((l) => {
    const cat = l.objetivo || 'Otros'
    lotesPorCategoria[cat] = (lotesPorCategoria[cat] || 0) + 1
  })

  // 2. Ocupación de Suelo
  // Un potrero está ocupado si algún lote lo referencia en 'potrero_actual_id'
  const potrerosOcupadosIds = new Set(lotes.map((l) => l.potrero_actual_id).filter((id) => id))
  const potrerosOcupados = potrerosOcupadosIds.size
  const totalPotreros = potreros.length
  const potrerosDescanso = totalPotreros - potrerosOcupados

  // 3. Agua
  const totalFuentes = fuentes.length

  return {
    totalCabezas,
    lotesPorCategoria, // { 'Cría': 5, 'Recría': 2 }
    totalPotreros,
    potrerosOcupados,
    potrerosDescanso,
    totalFuentes,
  }
})

// Icono Personalizado para el Pin
const pinIcon = L.divIcon({
  className: 'custom-pin-icon',
  html: `<div style="background-color: #39ff14; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px #39ff14;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

function onMapReady(map) {
  setTimeout(() => map.invalidateSize(), 500)
}

function updatePinPosition(latLng) {
  markerPosition.value = [latLng.lat, latLng.lng]
  form.pin_location = { lat: latLng.lat, lng: latLng.lng }
}

async function guardarCambios() {
  loading.value = true
  try {
    if (!store.establecimientoActual?.id) return

    const updateData = {
      nombre: form.nombre,
      ciudad: form.ciudad,
      provincia: form.provincia,
      pin_location: form.pin_location, // Guardamos el JSON del pin
    }

    const { error } = await supabase
      .from('establecimientos')
      .update(updateData)
      .eq('id', store.establecimientoActual.id)

    if (error) throw error

    // Actualizar store localmente para reflejo inmediato
    Object.assign(store.establecimientoActual, updateData)

    $q.notify({ type: 'positive', message: 'Datos actualizados' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al guardar' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (store.establecimientoActual) {
    Object.assign(form, store.establecimientoActual)

    // Recuperar pin guardado o usar default
    if (store.establecimientoActual.pin_location) {
      const pin = store.establecimientoActual.pin_location
      if (pin.lat && pin.lng) markerPosition.value = [pin.lat, pin.lng]
    }
  }

  // Asegurar carga de datos para las stats
  if (store.potreros.length === 0) store.fetchAll()
})
</script>

<style scoped lang="scss">
.establishment-dashboard {
  background: #121214;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  overflow: hidden;
}

/* Mapa Header (45% altura) */
.map-header {
  height: 45%;
  min-height: 200px;
  width: 100%;
  background: #000;
}
.map-gradient-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background: linear-gradient(to bottom, transparent, #121214);
  pointer-events: none;
  z-index: 1000;
}

/* Cuerpo Info (55% altura) */
.bg-dark-surface {
  background: #121214;
}

.input-transparent :deep(.q-field__control) {
  padding: 0;
  background: transparent !important;
}
.input-transparent :deep(.q-field__native) {
  font-weight: 700;
  letter-spacing: -0.5px;
  &::placeholder {
    color: rgba(255, 255, 255, 0.2);
  }
}
.input-compact :deep(.q-field__control) {
  height: 24px;
  min-height: 24px;
  padding: 0;
  background: transparent !important;
}
.input-compact :deep(.q-field__native) {
  padding: 0;
}

/* Tarjetas Métricas */
.metric-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid #555;
  transition: background 0.2s;
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}
.border-l-primary {
  border-left-color: #39ff14;
}
.border-l-cyan {
  border-left-color: #00e5ff;
}
.border-l-orange {
  border-left-color: #ff9800;
}

.bg-dark-soft {
  background: rgba(0, 0, 0, 0.3);
}
.text-xs {
  font-size: 0.65rem;
  font-weight: 700;
}
.font-display {
  font-family: 'Outfit', sans-serif;
}
.font-numeric {
  font-family: 'Fira Code', monospace;
}
.tracking-wide {
  letter-spacing: 1px;
}
.opacity-20 {
  opacity: 0.2;
}

.glass-btn {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.leaflet-popup-content-wrapper) {
  background: rgba(20, 20, 20, 0.9);
  color: white;
  border-radius: 8px;
}
:deep(.leaflet-popup-tip) {
  background: rgba(20, 20, 20, 0.9);
}
</style>
