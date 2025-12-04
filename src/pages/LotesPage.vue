<template>
  <q-page padding class="dashboard-pro-bg">
    <div class="page-title-box">Mis Lotes de Animales</div>

    <q-card flat bordered class="q-mb-md filter-card">
      <q-card-section class="row items-center q-gutter-md">
        <q-input
          v-model="filtro"
          placeholder="Buscar lote por nombre u objetivo..."
          outlined
          dense
          class="col-grow"
          dark
          color="white"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="white" />
          </template>
        </q-input>
        <q-btn color="primary" label="Nuevo Lote" icon="add" @click="abrirDialogoNuevo" />
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-md">
      <div v-if="loading.lotes" class="col-12 text-center q-pa-xl">
        <q-spinner-dots color="white" size="3em" />
      </div>
      <div v-if="lotesFiltrados.length === 0 && !loading.lotes" class="col-12">
        <q-card flat class="lote-card-pro text-white">
          <q-card-section class="text-center q-pa-lg">
            <q-icon
              name="img:https://api.iconify.design/mdi:cow-off.svg"
              size="4em"
              color="grey-5"
            />
            <div class="text-h6 q-mt-md text-grey-5">
              {{ filtro ? 'No se encontraron lotes' : 'No hay lotes registrados' }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div v-for="lote in lotesFiltrados" :key="lote.id" class="col-12 col-md-6 col-lg-4">
        <q-card flat class="lote-card-pro text-white">
          <q-item clickable class="lote-card-header" @click="verDetalleLote(lote.id)">
            <q-item-section avatar>
              <q-avatar square size="52px" color="transparent">
                <q-img :src="getLoteIconPath(lote)" @error="onIconError" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-h6 ellipsis">{{ lote.identificacion }}</q-item-label>
              <q-item-label caption class="text-grey-4">
                {{ lote.objetivo || 'Sin objetivo' }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-btn flat round dense icon="more_vert" @click.stop>
                <q-menu dark>
                  <q-list dense style="min-width: 150px">
                    <q-item clickable v-close-popup @click="verDetalleLote(lote.id)">
                      <q-item-section avatar> <q-icon name="visibility" /> </q-item-section>
                      <q-item-section>Ver Detalle</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="editarLote(lote)">
                      <q-item-section avatar> <q-icon name="edit" /> </q-item-section>
                      <q-item-section>Editar Lote</q-item-section>
                    </q-item>
                    <q-separator dark />
                    <q-item
                      clickable
                      v-close-popup
                      @click="confirmarEliminar(lote)"
                      class="text-red"
                    >
                      <q-item-section avatar> <q-icon name="delete" color="red" /> </q-item-section>
                      <q-item-section>Desactivar Lote</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-item-section>
          </q-item>

          <q-separator dark />

          <q-card-section>
            <div class="row text-center stat-bar">
              <div class="col stat-item">
                <div class="text-caption text-grey-4">Animales</div>
                <div class="text-h6">{{ lote.cantidad_animales || 0 }}</div>
              </div>
              <div class="col stat-item">
                <div class="text-caption text-grey-4">Peso Ingreso</div>
                <div class="text-h6">{{ lote.peso_ingreso_kg || 0 }} kg</div>
              </div>
              <div class="col">
                <div class="text-caption text-grey-4">Ubicación</div>
                <div class="text-subtitle2 ellipsis" :title="getUbicacion(lote)">
                  <q-icon
                    :name="lote.potrero_actual_id ? 'fence' : 'home'"
                    size="xs"
                    class="q-mr-xs"
                  />
                  {{ getUbicacion(lote) }}
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator dark />
          <q-card-actions class="q-pa-sm q-gutter-sm justify-around">
            <q-btn
              v-if="lote.objetivo === 'Cría'"
              flat
              dense
              icon="camera_alt"
              label="Escanear CC"
              class="action-btn-pro text-cyan-4"
              @click.stop="$router.push(`/lote/${lote.id}/scan_cc`)"
            />
            <q-btn
              v-else
              flat
              dense
              icon="straighten"
              label="Evaluar Peso"
              class="action-btn"
              @click.stop="abrirDialogoEvaluar(lote)"
            />

            <q-btn
              flat
              dense
              icon="sync_alt"
              label="Mover"
              class="action-btn"
              @click.stop="abrirDialogoMover(lote)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 400px" class="glass-dialog">
        <q-form @submit="guardarLote" class="q-gutter-md">
          <q-card-section>
            <div class="text-h6">{{ modoEdicion ? 'Editar' : 'Nuevo' }} Lote</div>
          </q-card-section>
          <q-card-section class="q-pt-none q-gutter-md">
            <q-input
              v-model="formLote.identificacion"
              label="Identificación del Lote (Ej: LT-001)"
              outlined
              dark
              :rules="[(val) => !!val || 'Requerido']"
              autofocus
            />
            <q-select
              v-model="formLote.objetivo"
              label="Objetivo"
              outlined
              dark
              :options="['Recría', 'Cría', 'Engorde', 'Otro']"
              :rules="[(val) => !!val || 'Requerido']"
            />
            <q-input
              v-model.number="formLote.cantidad_animales"
              label="Cantidad de Animales"
              type="number"
              outlined
              dark
              :rules="[(val) => val > 0 || 'Debe ser > 0']"
            />
            <q-input
              v-model.number="formLote.peso_ingreso_kg"
              label="Peso Promedio de Ingreso (kg)"
              type="number"
              step="0.1"
              outlined
              dark
              :rules="[(val) => val > 0 || 'Debe ser > 0']"
            />
            <q-input
              v-if="!modoEdicion"
              v-model="formLote.fecha_evaluacion"
              label="Fecha de Ingreso / Evaluación"
              type="date"
              stack-label
              outlined
              dark
              :rules="[(val) => !!val || 'Requerido']"
            />
          </q-card-section>
          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Cancelar" v-close-popup @click="resetForm" />
            <q-btn label="Guardar Lote" type="submit" color="primary" :loading="loading.guardar" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogEvaluar">
      <QuickEvaluateForm
        v-if="loteSeleccionado"
        :lote-prop="loteSeleccionado"
        @close="dialogEvaluar = false"
      />
    </q-dialog>

    <q-dialog v-model="dialogMover">
      <QuickMoveForm
        v-if="loteSeleccionado"
        :lote-prop="loteSeleccionado"
        @close="dialogMover = false"
      />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from 'stores/data-store'
import { useQuasar } from 'quasar'

// ¡¡QuickCCScanForm YA NO SE IMPORTA AQUÍ!!
import QuickEvaluateForm from 'src/components/QuickEvaluateForm.vue'
import QuickMoveForm from 'src/components/QuickMoveForm.vue'

const router = useRouter()
const dataStore = useDataStore()
const $q = useQuasar()

const loading = reactive({ lotes: true, guardar: false })
const filtro = ref('')
const fechaHoy = new Date().toISOString().split('T')[0]

// --- Estado Diálogo Nuevo/Editar (Existente) ---
const showDialog = ref(false)
const modoEdicion = ref(false)
const getFormVacio = () => ({
  id: null,
  identificacion: '',
  objetivo: null,
  cantidad_animales: null,
  peso_ingreso_kg: null,
  fecha_evaluacion: fechaHoy,
})
const formLote = reactive(getFormVacio())

// --- Estado Diálogos de Acción Rápida ---
const dialogEvaluar = ref(false)
const dialogMover = ref(false)
// const dialogCCScan = ref(false) // <-- ¡ELIMINADO!
const loteSeleccionado = ref(null)

// --- Carga de Datos ---
onMounted(async () => {
  loading.lotes = true
  if (dataStore.lotes.length === 0) {
    try {
      await dataStore.fetchLotes()
    } catch (error) {
      $q.notify({ color: 'negative', message: 'Error al cargar lotes: ' + error.message })
    }
  }
  if (dataStore.potreros.length === 0) {
    await dataStore.fetchPotreros()
  }
  loading.lotes = false
})

// --- Lógica de Filtro ---
const lotesFiltrados = computed(() => {
  if (!filtro.value) {
    return dataStore.lotes
  }
  const f = filtro.value.toLowerCase()
  return dataStore.lotes.filter(
    (l) =>
      l.identificacion.toLowerCase().includes(f) ||
      (l.objetivo && l.objetivo.toLowerCase().includes(f)),
  )
})

// --- Lógica de Navegación y Helpers Visuales ---
function verDetalleLote(loteId) {
  router.push(`/lote/${loteId}`)
}

function getUbicacion(lote) {
  if (lote.potrero_actual_id) {
    return dataStore.getPotreroById(lote.potrero_actual_id)?.nombre || 'Potrero Desconocido'
  }
  return 'En Corral'
}

function getLoteIconPath(lote) {
  const objetivo = lote.objetivo ? String(lote.objetivo).toLowerCase() : 'default'
  let iconName = 'default2'

  if (objetivo === 'cría') iconName = 'cria2'
  else if (objetivo === 'recría') iconName = 'recria2'
  else if (objetivo === 'engorde') iconName = 'engorde2'

  return `icons/${iconName}.svg` // Asume /public/icons/cria.svg, etc.
}

function onIconError(event) {
  event.target.src = 'icons/default2.svg' // Fallback
}

// --- Lógica de Diálogos (Original) ---
function resetForm() {
  Object.assign(formLote, getFormVacio())
  modoEdicion.value = false
}

function abrirDialogoNuevo() {
  resetForm()
  showDialog.value = true
}

function editarLote(lote) {
  loteSeleccionado.value = lote // <-- Añadido por si acaso
  resetForm()
  modoEdicion.value = true
  formLote.id = lote.id
  formLote.identificacion = lote.identificacion
  formLote.objetivo = lote.objetivo
  formLote.cantidad_animales = lote.cantidad_animales
  formLote.peso_ingreso_kg = lote.peso_ingreso_kg
  formLote.fecha_evaluacion = null
  showDialog.value = true
}

async function guardarLote() {
  loading.guardar = true
  try {
    const datosLote = {
      // establecimiento_id se añade en createRegistro
      identificacion: formLote.identificacion,
      objetivo: formLote.objetivo,
      cantidad_animales: formLote.cantidad_animales,
      peso_ingreso_kg: formLote.peso_ingreso_kg,
      activo: true,
    }

    if (modoEdicion.value) {
      await dataStore.updateRegistro('lotes', formLote.id, datosLote)
      $q.notify({ type: 'positive', message: 'Lote actualizado' })
    } else {
      const nuevoLote = await dataStore.createRegistro('lotes', datosLote)
      const evaluacionInicial = {
        lote_id: nuevoLote.id,
        fecha_evaluacion: formLote.fecha_evaluacion,
        peso_promedio_kg: formLote.peso_ingreso_kg,
        observaciones: 'Evaluación inicial de ingreso',
      }
      await dataStore.createRegistro('evaluaciones', evaluacionInicial)
      $q.notify({ type: 'positive', message: 'Lote y evaluación inicial creados' })
    }
    showDialog.value = false
    resetForm()
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Error al guardar el lote: ' + error.message,
    })
  } finally {
    loading.guardar = false
  }
}

function confirmarEliminar(lote) {
  $q.dialog({
    title: 'Confirmar Desactivación',
    message: `¿Estás seguro de desactivar el lote "${lote.identificacion}"? El lote se ocultará pero sus datos se conservarán.`,
    cancel: true,
    persistent: true,
    ok: { label: 'Desactivar', color: 'negative' },
    dark: true,
    class: 'glass-dialog',
  }).onOk(async () => {
    loading.lotes = true
    try {
      await dataStore.deactivateRegistro('lotes', lote.id)
      $q.notify({ type: 'positive', message: 'Lote desactivado' })
    } catch (error) {
      $q.notify({ color: 'negative', message: 'Error: ' + error.message })
    } finally {
      loading.lotes = false
    }
  })
}

// --- Lógica de Diálogos (Acciones Rápidas) ---
function abrirDialogoEvaluar(lote) {
  loteSeleccionado.value = lote
  dialogEvaluar.value = true
}

function abrirDialogoMover(lote) {
  loteSeleccionado.value = lote
  dialogMover.value = true
}

// ¡ESTA FUNCIÓN YA NO SE USA!
// function abrirDialogoCCScan(lote) { ... }
</script>

<style lang="scss" scoped>
// Fondo "Pro" (copiado de DashboardPage)
.dashboard-pro-bg {
  // ¡¡IMPORTANTE!! Asegúrate que esta ruta sea correcta
  background-image: url('src/assets/nutrogan-bg.png');
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

// Tarjeta de Filtro estilo "glass"
.filter-card {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

// Tarjeta "Pro" (Glassmorphism)
.lote-card-pro {
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    background: rgba(0, 0, 0, 0.4);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
}

.lote-card-header {
  transition: background-color 0.2s ease;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
}

.stat-bar {
  .stat-item {
    border-right: 1px solid rgba(255, 255, 255, 0.2);
  }
}

.action-btn {
  color: rgba(255, 255, 255, 0.7);
  flex-grow: 1;
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
}

// Botón "Pro" de CC
.action-btn-pro {
  flex-grow: 1;
  font-weight: 600;
  color: #26c6da; // (Color Cyan-4)
  &:hover {
    background: rgba(38, 198, 218, 0.1);
  }
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Estilo de Diálogo "Glass"
:deep(.glass-dialog .q-card) {
  background: rgba(40, 40, 40, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}
:deep(.glass-dialog .q-field__label) {
  color: rgba(255, 255, 255, 0.7);
}
:deep(.glass-dialog .q-field__native) {
  color: white;
}
</style>
