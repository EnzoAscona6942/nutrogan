<template>
  <q-card flat class="kpi-card text-white">
    <q-card-section class="q-pb-sm">
      <div class="row items-start no-wrap">
        <div class="col">
          <div class="text-h6 ellipsis">{{ fuente.nombre }}</div>
          <div class="text-caption text-grey-4">
            <q-icon :name="tipoIcon" size="xs" /> {{ fuente.tipo }}
            <span v-if="fuente.potreros">
              • <q-icon name="fence" size="xs" /> {{ fuente.potreros.nombre }}
            </span>
            <span v-else-if="!fuente.potrero_id"> • <q-icon name="home" size="xs" /> Corral </span>
          </div>
        </div>
        <div class="col-auto">
          <q-btn flat round dense icon="more_vert">
            <q-menu dark>
              <q-list dense>
                <q-item clickable v-close-popup @click="emit('editar', fuente)">
                  <q-item-section avatar><q-icon name="edit" size="xs" /></q-item-section>
                  <q-item-section>Editar Fuente</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="emit('eliminar', fuente)">
                  <q-item-section avatar
                    ><q-icon name="delete" size="xs" color="red"
                  /></q-item-section>
                  <q-item-section class="text-red">Eliminar Fuente</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <q-badge :color="estado.color" text-color="white" :label="estado.label" />
      <div class="text-caption text-grey-4 q-mt-sm">Último análisis: {{ ultimoAnalisisFecha }}</div>
    </q-card-section>

    <q-separator dark />

    <q-card-section v-if="ultimoAnalisis">
      <div class="row text-center q-col-gutter-sm">
        <div class="col-3">
          <div class="text-caption text-grey-4">pH</div>
          <div class="text-weight-medium">{{ ultimoAnalisis.ph || 'N/A' }}</div>
        </div>
        <div class="col-3">
          <div class="text-caption text-grey-4">Sales (ppm)</div>
          <div class="text-weight-medium">{{ ultimoAnalisis.solidos_totales || 'N/A' }}</div>
        </div>
        <div class="col-3">
          <div class="text-caption text-grey-4">Nitratos</div>
          <div class="text-weight-medium">{{ ultimoAnalisis.nitratos || 'N/A' }}</div>
        </div>
        <div class="col-3">
          <div class="text-caption text-grey-4">Arsénico</div>
          <div class="text-weight-medium">{{ ultimoAnalisis.arsenico || 'N/A' }}</div>
        </div>
      </div>
    </q-card-section>

    <q-card-section v-else class="text-center text-grey-5">
      <q-icon name="science_off" size="md" />
      <div class="text-caption q-mt-sm">Sin análisis de calidad registrados</div>
    </q-card-section>

    <q-separator dark />

    <q-card-actions class="q-pa-md" vertical>
      <q-btn
        label="Cargar Análisis Manual"
        color="primary"
        outline
        icon="science"
        class="full-width"
        @click="emit('nuevoAnalisis', fuente)"
      />
      <q-btn
        v-if="fuente.analisis_de_agua && fuente.analisis_de_agua.length > 0"
        label="Ver Historial"
        color="grey-5"
        flat
        icon="history"
        class="full-width q-mt-sm"
        @click="emit('verHistorial', fuente)"
      />
    </q-card-actions>

    <div v-if="fuente.es_inteligente || fuente.tipo === 'Represa'">
      <q-separator dark />
      <q-card-section>
        <div class="text-caption text-grey-4 text-weight-medium">Acciones Inteligentes</div>

        <q-btn
          v-if="fuente.es_inteligente"
          label="Sincronizar Sensor"
          color="blue-grey-5"
          outline
          icon="sensors"
          class="full-width q-mt-sm"
          :loading="loadingSensor"
          @click="simularSensor"
        >
          <q-tooltip class="bg-black">Simulación: Leer datos del bebedero IoT</q-tooltip>
        </q-btn>

        <q-btn
          v-if="fuente.tipo === 'Represa'"
          label="Analizar Nivel (Sentinel)"
          color="teal"
          outline
          icon="satellite_alt"
          class="full-width q-mt-sm"
          :loading="loadingSentinel"
          @click="simularSentinel"
        >
          <q-tooltip class="bg-black"
            >Simulación: Usar Sentinel Hub para medir el área de agua (NDWI)</q-tooltip
          >
        </q-btn>
      </q-card-section>
    </div>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from 'stores/data-store'
import { useQuasar } from 'quasar'

const props = defineProps({
  fuente: { type: Object, required: true },
})
const emit = defineEmits(['editar', 'eliminar', 'nuevoAnalisis', 'verHistorial'])

const dataStore = useDataStore()
const $q = useQuasar()
const loadingSensor = ref(false)
const loadingSentinel = ref(false)

// --- OPTIMIZACIÓN 1: Mapeos constantes (Mejor que switch) ---
const ESTADO_CONFIG = {
  Peligro: { label: 'Peligro', color: 'negative', icon: 'warning' },
  Precaución: { label: 'Precaución', color: 'warning', icon: 'info' },
  Óptimo: { label: 'Óptimo', color: 'positive', icon: 'check_circle' },
}
const ESTADO_DEFAULT = { label: 'Sin Datos', color: 'grey', icon: 'help' }

const TIPO_ICON_CONFIG = {
  Bebedero: 'mdi-water-pump',
  Tanque: 'mdi-tank',
  Represa: 'mdi-waves',
  Pozo: 'mdi-bore-hole',
}
const ICON_DEFAULT = 'mdi-water'

// --- Computed Properties Simplificadas ---
const estado = computed(() => {
  return ESTADO_CONFIG[props.fuente.ultimo_estado] || ESTADO_DEFAULT
})

const tipoIcon = computed(() => {
  return TIPO_ICON_CONFIG[props.fuente.tipo] || ICON_DEFAULT
})

const ultimoAnalisis = computed(() => {
  // Uso de Optional Chaining (?.) para seguridad
  return props.fuente.analisis_de_agua?.[0] || null
})

const ultimoAnalisisFecha = computed(() => {
  if (ultimoAnalisis.value?.fecha_analisis) {
    const date = new Date(ultimoAnalisis.value.fecha_analisis + 'T00:00:00-03:00')
    return date.toLocaleDateString('es-AR')
  }
  return 'Nunca'
})

// --- Simulaciones ---
function simularSensor() {
  loadingSensor.value = true
  $q.notify({ type: 'info', message: 'Sincronizando con sensor IoT...', icon: 'sensors' })

  setTimeout(async () => {
    try {
      const dataSimulada = {
        fuente_id: props.fuente.id,
        fecha_analisis: new Date().toISOString().split('T')[0],
        metodo: 'Sensor',
        ph: (Math.random() * (7.8 - 7.2) + 7.2).toFixed(1),
        solidos_totales: (Math.random() * (1500 - 800) + 800).toFixed(0),
        conductividad_electrica: (Math.random() * (2000 - 1000) + 1000).toFixed(0),
        dureza: (Math.random() * (300 - 100) + 100).toFixed(0),
        nitratos: (Math.random() * 10).toFixed(0),
        arsenico: 0,
        observaciones: 'Lectura automática de sensor IoT',
      }

      await dataStore.agregarAnalisisDeAgua(dataSimulada)

      $q.notify({
        type: 'positive',
        message: 'Sensor Sincronizado',
        caption: `pH: ${dataSimulada.ph}, Sólidos: ${dataSimulada.solidos_totales} ppm. Estado: Óptimo.`,
      })
    } catch {
      $q.notify({ type: 'negative', message: 'Error al simular sensor' })
    } finally {
      loadingSensor.value = false
    }
  }, 1500)
}

function simularSentinel() {
  loadingSentinel.value = true
  $q.notify({ type: 'info', message: 'Contactando a Sentinel Hub...', icon: 'satellite_alt' })

  setTimeout(() => {
    // No hay lógica compleja que pueda fallar aquí, es puramente visual
    const areaSimulada = (Math.random() * 5 + 1).toFixed(1)
    $q.notify({
      type: 'positive',
      message: 'Análisis de Represa Completo (Simulación)',
      caption: `Superficie de agua detectada: ${areaSimulada} ha.`,
    })
    loadingSentinel.value = false
  }, 2500)
}
</script>

<style lang="scss" scoped>
/* CAMBIO 4: Usamos 'kpi-card' que ya está definida en AguaPage */
.kpi-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
