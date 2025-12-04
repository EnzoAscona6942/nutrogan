<template>
  <q-page padding class="dashboard-pro-bg">
    <div v-if="loading.lote" class="text-center q-pa-xl">
      <q-spinner-dots color="white" size="3em" />
      <div class="text-caption text-white q-mt-md">Cargando datos del lote...</div>
    </div>

    <div v-if="dataStore.loteActual && !loading.lote" class="text-white">
      <div class="flex items-center">
        <q-btn flat round dense icon="arrow_back" @click="$router.back()" class="q-mr-sm" />
        <q-avatar square size="52px" color="transparent" class="q-mr-md">
          <q-img :src="getLoteIconPath(dataStore.loteActual)" @error="onIconError" />
        </q-avatar>
        <div>
          <div class="text-h4">{{ dataStore.loteActual.identificacion }}</div>
          <div class="text-subtitle1">
            <q-badge :color="getObjetivoColor(dataStore.loteActual.objetivo)">
              {{ dataStore.loteActual.objetivo }}
            </q-badge>
            - {{ dataStore.loteActual.cantidad_animales }} animales
          </div>
        </div>
      </div>

      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat class="kpi-card">
            <q-card-section>
              <div class="text-caption text-grey-4">Peso Prom. Actual</div>
              <div class="text-h6">{{ kpi_peso_actual }} kg</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat class="kpi-card">
            <q-card-section>
              <div class="text-caption text-grey-4">GDPV (kg/día)</div>
              <div class="text-h6">{{ kpi_gdpv }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat class="kpi-card">
            <q-card-section>
              <div class="text-caption text-grey-4">Costo por Kg Ganado</div>
              <div class="text-h6">${{ kpi_costo_kg }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat class="kpi-card" :class="kpi_tasa_prenez === 'N/A' ? 'kpi-card-na' : ''">
            <q-card-section>
              <div class="text-caption text-grey-4">Tasa de Preñez</div>
              <div class="text-h6">{{ kpi_tasa_prenez }}%</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-card class="q-mt-lg main-tabs-card">
        <q-tabs
          v-model="tab"
          dense
          class="text-grey-5"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="evaluacion" label="Evaluación" icon="straighten" />
          <q-tab name="sanidad" label="Sanidad" icon="vaccines" />
          <q-tab name="reproduccion" label="Reproducción" icon="pets" />
          <q-tab name="consumo" label="Consumo" icon="restaurant" />
        </q-tabs>

        <q-separator dark />

        <q-tab-panels v-model="tab" animated class="bg-transparent text-white">
          <q-tab-panel name="evaluacion">
            <div class="flex justify-between items-center q-mb-md">
              <div class="text-h6">Historial de Evaluaciones</div>
              <q-btn
                label="Registrar Evaluación"
                color="primary"
                icon="add"
                @click="abrirDialogo('evaluacion')"
              />
            </div>
            <q-list bordered separator dark class="rounded-borders">
              <q-item v-if="dataStore.evaluaciones.length === 0" class="text-grey-6">
                <q-item-section class="text-center q-pa-md"
                  >Sin evaluaciones registradas.</q-item-section
                >
              </q-item>
              <q-item v-for="ev in dataStore.evaluaciones" :key="ev.id">
                <q-item-section avatar><q-icon color="primary" name="straighten" /></q-item-section>
                <q-item-section>
                  <q-item-label>{{ formatearFecha(ev.fecha_evaluacion) }}</q-item-label>
                  <q-item-label caption class="text-grey-4">{{
                    ev.observaciones || 'Sin obs.'
                  }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-weight-medium"
                    >Peso: {{ ev.peso_promedio_kg }} kg</q-item-label
                  >
                  <q-item-label caption class="text-grey-4"
                    >CC: {{ ev.condicion_corporal || 'N/A' }}</q-item-label
                  >
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>

          <q-tab-panel name="sanidad">
            <div class="flex justify-between items-center q-mb-md">
              <div class="text-h6">Historial de Sanidad</div>
              <q-btn
                label="Registrar Evento"
                color="primary"
                icon="add"
                @click="abrirDialogo('sanidad')"
              />
            </div>
            <q-list bordered separator dark class="rounded-borders">
              <q-item v-if="dataStore.eventosSanitarios.length === 0" class="text-grey-6">
                <q-item-section class="text-center q-pa-md">Sin eventos sanitarios.</q-item-section>
              </q-item>
              <q-item v-for="ev in dataStore.eventosSanitarios" :key="ev.id">
                <q-item-section avatar><q-icon color="blue-4" name="vaccines" /></q-item-section>
                <q-item-section>
                  <q-item-label>{{ ev.tipo_evento }}</q-item-label>
                  <q-item-label caption class="text-grey-4">{{
                    ev.descripcion || 'Sin descripción'
                  }}</q-item-label>
                </q-item-section>
                <q-item-section side top>
                  <q-item-label caption class="text-grey-4">{{
                    formatearFecha(ev.fecha)
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>

          <q-tab-panel name="reproduccion">
            <div class="flex justify-between items-center q-mb-md">
              <div class="text-h6">Historial Reproductivo</div>
              <q-btn
                label="Registrar Evento"
                color="primary"
                icon="add"
                @click="abrirDialogo('reproduccion')"
              />
            </div>
            <q-list bordered separator dark class="rounded-borders">
              <q-item v-if="dataStore.eventosReproductivos.length === 0" class="text-grey-6">
                <q-item-section class="text-center q-pa-md"
                  >Sin eventos reproductivos.</q-item-section
                >
              </q-item>
              <q-item v-for="ev in dataStore.eventosReproductivos" :key="ev.id">
                <q-item-section avatar><q-icon color="pink-4" name="pets" /></q-item-section>
                <q-item-section>
                  <q-item-label>{{ ev.tipo_evento }}</q-item-label>
                  <q-item-label caption class="text-grey-4">{{
                    ev.descripcion || 'Sin descripción'
                  }}</q-item-label>
                </q-item-section>
                <q-item-section side top>
                  <q-item-label caption class="text-grey-4">{{
                    formatearFecha(ev.fecha)
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>

          <q-tab-panel name="consumo">
            <div class="flex justify-between items-center q-mb-md">
              <div class="text-h6">Historial de Consumo</div>
              <q-btn
                label="Registrar Consumo"
                color="primary"
                icon="add"
                @click="abrirDialogo('consumo')"
              />
            </div>
            <q-list bordered separator dark class="rounded-borders">
              <q-item v-if="dataStore.consumos.length === 0" class="text-grey-6">
                <q-item-section class="text-center q-pa-md"
                  >Sin consumos registrados.</q-item-section
                >
              </q-item>
              <q-item v-for="c in dataStore.consumos" :key="c.id">
                <q-item-section avatar><q-icon color="green-4" name="restaurant" /></q-item-section>
                <q-item-section>
                  <q-item-label
                    >Dieta: {{ c.dietas?.nombre || c.alimentos?.nombre || 'N/A' }}</q-item-label
                  >
                  <q-item-label caption class="text-grey-4">
                    {{ formatearFecha(c.fecha_inicio) }} -
                    {{ c.fecha_fin ? formatearFecha(c.fecha_fin) : 'Actual' }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-weight-medium"
                    >${{ c.costo_total_periodo || 0 }}</q-item-label
                  >
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>

    <q-dialog v-model="dialogos.evaluacion" persistent>
      <q-card class="glass-dialog-form" style="width: 450px">
        <q-card-section>
          <div class="text-h6">Registrar Evaluación</div>
        </q-card-section>
        <q-form
          @submit.prevent="
            handleCreate('evaluaciones', newEvaluacion, resetEvaluacion, 'evaluacion')
          "
          class="q-gutter-md"
        >
          <q-card-section class="q-pt-none q-gutter-md">
            <q-input
              filled
              dark
              v-model="newEvaluacion.fecha_evaluacion"
              type="date"
              stack-label
              color="white"
              :rules="[(val) => !!val || 'Requerido']"
            />
            <q-input
              filled
              dark
              v-model.number="newEvaluacion.peso_promedio_kg"
              type="number"
              label="Peso Promedio (kg)"
              step="0.1"
              color="white"
              :rules="[(val) => (val !== null && val >= 0) || 'Requerido (puede ser 0)']"
            />
            <q-item-label header class="q-pl-none text-white"
              >Condición Corporal (CC) (1-9)</q-item-label
            >
            <q-rating
              v-model="newEvaluacion.condicion_corporal"
              max="9"
              size="2.5em"
              color="primary"
              icon="star_border"
              icon-selected="star"
            />
            <q-input
              filled
              dark
              v-model="newEvaluacion.observaciones"
              type="textarea"
              label="Observaciones"
              color="white"
            />
          </q-card-section>
          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn label="Guardar" type="submit" color="primary" :loading="loading.guardar" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogos.sanidad" persistent>
      <q-card class="glass-dialog-form" style="width: 450px">
        <q-card-section>
          <div class="text-h6">Registrar Evento Sanitario</div>
        </q-card-section>
        <q-form
          @submit.prevent="
            handleCreate('eventos_sanitarios', newSanitario, resetSanitario, 'sanidad')
          "
          class="q-gutter-md"
        >
          <q-card-section class="q-pt-none q-gutter-md">
            <q-input
              filled
              dark
              v-model="newSanitario.fecha"
              type="date"
              stack-label
              color="white"
              :rules="[(val) => !!val || 'Requerido']"
            />
            <q-input
              filled
              dark
              v-model="newSanitario.tipo_evento"
              label="Tipo de Evento (Ej: Vacunación)"
              color="white"
              :rules="[(val) => !!val || 'Requerido']"
            />
            <q-input
              filled
              dark
              v-model="newSanitario.descripcion"
              type="textarea"
              label="Descripción / Producto"
              color="white"
            />
          </q-card-section>
          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn label="Guardar" type="submit" color="primary" :loading="loading.guardar" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogos.reproduccion" persistent>
      <q-card class="glass-dialog-form" style="width: 450px">
        <q-card-section>
          <div class="text-h6">Registrar Evento Reproductivo</div>
        </q-card-section>
        <q-form
          @submit.prevent="
            handleCreate(
              'eventos_reproductivos',
              newReproductivo,
              resetReproductivo,
              'reproduccion',
            )
          "
          class="q-gutter-md"
        >
          <q-card-section class="q-pt-none q-gutter-md">
            <q-input
              filled
              dark
              v-model="newReproductivo.fecha"
              type="date"
              stack-label
              color="white"
              :rules="[(val) => !!val || 'Requerido']"
            />
            <q-select
              filled
              dark
              v-model="newReproductivo.tipo_evento"
              label="Tipo de Evento"
              color="white"
              :options="['Servicio', 'Tacto (Preñada)', 'Tacto (Vacía)', 'Parto', 'Aborto']"
              :rules="[(val) => !!val || 'Requerido']"
            />
            <q-input
              filled
              dark
              v-model="newReproductivo.descripcion"
              type="textarea"
              label="Descripción (Ej: Toro Nro)"
              color="white"
            />
          </q-card-section>
          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn label="Guardar" type="submit" color="primary" :loading="loading.guardar" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogos.consumo">
      <q-card class="glass-dialog-form">
        <q-card-section>
          <div class="text-h6">Registrar Consumo</div>
        </q-card-section>
        <q-card-section>
          <p>Este módulo se gestiona desde "Mi Despensa" (Inventario).</p>
          <p>
            Para registrar un consumo, ve a la despensa, selecciona un alimento y haz clic en
            "Usar", asignándolo a este lote.
          </p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Entendido" color="primary" v-close-popup />
          <q-btn
            label="Ir a Despensa"
            color="primary"
            @click="$router.push('/recursos/despensa')"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useDataStore } from 'stores/data-store'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const dataStore = useDataStore()
const loteId = route.params.id

const loading = reactive({ lote: true, guardar: false })
const tab = ref('evaluacion')
const fechaHoy = new Date().toISOString().split('T')[0]

// --- NUEVO ESTADO PARA DIÁLOGOS ---
const dialogos = reactive({
  evaluacion: false,
  sanidad: false,
  reproduccion: false,
  consumo: false,
})

// --- Modelos de Formularios (Sin cambios) ---
const getNewEvaluacion = () => ({
  lote_id: loteId,
  fecha_evaluacion: fechaHoy,
  peso_promedio_kg: null,
  condicion_corporal: 5, // Default a 5
  observaciones: '',
})
const getNewSanitario = () => ({
  lote_id: loteId,
  fecha: fechaHoy,
  tipo_evento: '',
  descripcion: '',
})
const getNewReproductivo = () => ({
  lote_id: loteId,
  fecha: fechaHoy,
  tipo_evento: null,
  descripcion: '',
})

const newEvaluacion = reactive(getNewEvaluacion())
const newSanitario = reactive(getNewSanitario())
const newReproductivo = reactive(getNewReproductivo())

// --- Funciones de Reset (Sin cambios) ---
const resetEvaluacion = () => Object.assign(newEvaluacion, getNewEvaluacion())
const resetSanitario = () => Object.assign(newSanitario, getNewSanitario())
const resetReproductivo = () => Object.assign(newReproductivo, getNewReproductivo())

// --- NUEVA FUNCIÓN PARA ABRIR DIÁLOGOS ---
function abrirDialogo(tipo) {
  // Resetea el formulario correspondiente antes de abrir
  if (tipo === 'evaluacion') resetEvaluacion()
  if (tipo === 'sanidad') resetSanitario()
  if (tipo === 'reproduccion') resetReproductivo()

  dialogos[tipo] = true
}

// --- Carga de Datos (Sin cambios) ---
onMounted(async () => {
  loading.lote = true
  try {
    await dataStore.fetchLoteDetalle(loteId)
  } catch (error) {
    $q.notify({ color: 'negative', message: 'Error al cargar el lote: ' + error.message })
    router.back()
  } finally {
    loading.lote = false
  }
})

// --- FUNCIÓN DE GUARDADO ACTUALIZADA ---
async function handleCreate(tabla, dataObject, resetFunction, dialogTipo) {
  loading.guardar = true
  try {
    await dataStore.createRegistro(tabla, dataObject)
    $q.notify({ type: 'positive', message: 'Registro guardado' })
    resetFunction()
    dialogos[dialogTipo] = false // <-- Cierra el diálogo al guardar
  } catch (error) {
    $q.notify({ color: 'negative', message: 'Error: ' + error.message })
  } finally {
    loading.guardar = false
  }
}

// --- Helper de Fecha (Ajuste UTC) ---
function formatearFecha(fechaISO) {
  if (!fechaISO) return 'N/A'
  const date = new Date(fechaISO + 'T00:00:00-03:00') // Asumir hora local
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// --- Helpers Visuales ---
function getLoteIconPath(lote) {
  const objetivo = lote.objetivo ? String(lote.objetivo).toLowerCase() : 'default'
  let iconName = 'default'

  if (objetivo === 'cría') iconName = 'cria'
  else if (objetivo === 'recría') iconName = 'recria'
  else if (objetivo === 'engorde') iconName = 'engorde'

  return `icons/${iconName}.svg`
}

function onIconError(event) {
  event.target.src = 'icons/default.svg'
}

function getObjetivoColor(objetivo) {
  if (objetivo === 'Cría') return 'pink-5'
  if (objetivo === 'Recría') return 'orange-5'
  if (objetivo === 'Engorde') return 'green-5'
  return 'grey-5'
}

// --- KPIs (Lógica actualizada para N/A) ---
const kpi_peso_actual = computed(() => {
  if (!dataStore.evaluaciones || dataStore.evaluaciones.length === 0)
    return dataStore.loteActual?.peso_ingreso_kg || 0
  return dataStore.evaluaciones[0].peso_promedio_kg
})
const kpi_gdpv = computed(() => {
  if (!dataStore.evaluaciones || dataStore.evaluaciones.length < 2) return 'N/A'
  return dataStore.getGDPV(dataStore.evaluaciones)
})
const kpi_costo_kg = computed(() => {
  if (!dataStore.evaluaciones || dataStore.evaluaciones.length < 2 || !dataStore.loteActual)
    return 'N/A'
  return dataStore.getCostoKgGanado(
    dataStore.evaluaciones,
    dataStore.consumos,
    dataStore.loteActual.cantidad_animales,
  )
})
const kpi_tasa_prenez = computed(() => {
  if (dataStore.loteActual?.objetivo !== 'Cría' || !dataStore.loteActual) return 'N/A'
  const tasa = dataStore.getTasaPrenez(
    dataStore.eventosReproductivos,
    dataStore.loteActual.cantidad_animales,
  )
  return tasa === '0.0' ? '0' : tasa // Evitar "0.0%"
})
</script>

<style lang="scss" scoped>
.dashboard-pro-bg {
  background-image: url('src/assets/nutrogan-bg.jpg'); // Asegúrate que la ruta sea correcta
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
}

.kpi-card {
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  height: 100%;
}
.kpi-card-na {
  background: rgba(0, 0, 0, 0.1); // Hacer más sutil si es N/A
  color: rgba(255, 255, 255, 0.4);
}

.main-tabs-card {
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

// Estilo de Diálogo "Glass"
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
:deep(.glass-dialog-form .q-item__label--header) {
  color: rgba(255, 255, 255, 0.9);
}
:deep(.glass-dialog-form .q-rating__icon) {
  color: rgba(255, 255, 255, 0.5);
}
</style>
