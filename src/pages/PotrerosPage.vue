<template>
  <q-page padding class="dashboard-pro-bg text-white">
    <div class="row items-center justify-between q-mb-md">
      <div class="page-title-box" style="margin-bottom: 0">Mis Potreros</div>
      <q-btn flat round dense icon="arrow_back" @click="$router.push('/recursos')" />
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="kpi-card">
          <q-card-section>
            <div class="text-h6">{{ estadisticas.total }}</div>
            <div class="text-caption text-grey-4">Total Potreros</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="kpi-card">
          <q-card-section>
            <div class="text-h6">{{ estadisticas.conGeometria }}</div>
            <div class="text-caption text-grey-4">Con Polígono</div>
            <q-linear-progress
              :value="estadisticas.porcentajeConGeometria"
              color="primary"
              class="q-mt-sm"
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="kpi-card">
          <q-card-section>
            <div class="text-h6">{{ estadisticas.conNdvi }}</div>
            <div class="text-caption text-grey-4">Con NDVI</div>
            <q-linear-progress
              :value="estadisticas.porcentajeConNdvi"
              color="green"
              class="q-mt-sm"
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="kpi-card">
          <q-card-section>
            <div class="text-h6">{{ estadisticas.areaTotal.toFixed(1) }} ha</div>
            <div class="text-caption text-grey-4">Área Total (Calculada)</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card flat class="q-mb-md filter-card">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-6">
            <q-input
              v-model="filtro"
              placeholder="Buscar potrero..."
              outlined
              dense
              dark
              color="white"
              clearable
              @clear="filtro = ''"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="white" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <div class="row q-gutter-sm justify-end">
              <q-btn-dropdown color="white" outline label="Ordenar" icon="sort" class="btn-glass">
                <q-list dark>
                  <q-item clickable v-close-popup @click="ordenarPor = 'nombre'">
                    <q-item-section> <q-item-label>Por nombre</q-item-label> </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="ordenarPor = 'area'">
                    <q-item-section> <q-item-label>Por área</q-item-label> </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="ordenarPor = 'ndvi'">
                    <q-item-section> <q-item-label>Por NDVI</q-item-label> </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
              <q-btn
                color="primary"
                label="Nuevo Potrero"
                icon="add"
                @click="mostrarDialogoNuevo = true"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-md">
      <div v-for="potrero in potrerosFiltrados" :key="potrero.id" class="col-12 col-md-6 col-lg-4">
        <q-card flat class="kpi-card potrero-card" :class="{ 'sin-geometria': !potrero.geometria }">
          <q-card-section class="q-pb-sm">
            <div class="row items-center no-wrap">
              <q-avatar rounded size="48px" class="bg-dark-soft q-mr-md shadow-2">
                <div
                  class="potrero-type-icon"
                  :style="{
                    '-webkit-mask-image': `url(${getPotreroIconPath(potrero)})`,
                    'mask-image': `url(${getPotreroIconPath(potrero)})`,
                    'background-color': getNdviColorHex(potrero.ultimo_ndvi),
                  }"
                ></div>
              </q-avatar>
              <div class="col">
                <div class="text-h6 ellipsis">{{ potrero.nombre }}</div>
                <div class="text-caption text-grey-4">
                  {{ potrero.tipo || 'Sin tipo' }}
                  <span v-if="potrero.ciudad">
                    • <q-icon name="location_on" size="xs" /> {{ potrero.ciudad }}
                  </span>
                </div>
              </div>
              <q-btn flat round dense icon="more_vert" @click.stop>
                <q-menu dark>
                  <q-list dense style="min-width: 150px">
                    <q-item clickable v-close-popup @click="editarPotrero(potrero)">
                      <q-item-section avatar> <q-icon name="edit" /> </q-item-section>
                      <q-item-section>Editar</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      @click="$router.push(`/recursos/potreros/draw/${potrero.id}`)"
                    >
                      <q-item-section avatar> <q-icon name="draw" /> </q-item-section>
                      <q-item-section>
                        {{ potrero.geometria ? 'Editar' : 'Dibujar' }} polígono
                      </q-item-section>
                    </q-item>
                    <q-separator dark />
                    <q-item
                      clickable
                      v-close-popup
                      @click="confirmarEliminar(potrero)"
                      class="text-red"
                    >
                      <q-item-section avatar> <q-icon name="delete" color="red" /> </q-item-section>
                      <q-item-section>Eliminar</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </q-card-section>

          <q-separator dark />

          <q-card-section class="q-pt-sm">
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <div class="text-caption text-grey-4">Área</div>
                <div class="text-weight-medium">
                  <span v-if="potrero.superficie_ha && potrero.superficie_ha > 0">
                    {{ potrero.superficie_ha.toFixed(2) }} ha
                  </span>
                  <span v-else class="text-grey-5">
                    0 ha <q-icon name="warning" color="warning" size="xs" />
                  </span>
                </div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-4">NDVI</div>
                <div class="text-weight-medium">
                  <span
                    v-if="typeof potrero.ultimo_ndvi === 'number'"
                    :style="{ color: getNdviColorHex(potrero.ultimo_ndvi) }"
                  >
                    {{ potrero.ultimo_ndvi.toFixed(3) }}
                  </span>
                  <span v-else class="text-grey-5"> Sin datos </span>
                </div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-4">Estado</div>
                <q-chip
                  :style="{ backgroundColor: getNdviColorHex(potrero.ultimo_ndvi) }"
                  text-color="black"
                  size="sm"
                  dense
                >
                  {{ getEstadoPotrero(potrero) }}
                </q-chip>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-4">Actualizado</div>
                <div class="text-caption text-grey-4">
                  {{ formatearFecha(potrero.fecha_ultimo_ndvi || potrero.updated_at) }}
                </div>
              </div>
            </div>

            <div v-if="typeof potrero.ultimo_ndvi === 'number'" class="q-mt-md">
              <div class="text-caption text-grey-4 q-mb-xs">Vigor del forraje</div>
              <q-linear-progress
                :value="normalizeNdvi(potrero.ultimo_ndvi)"
                :style="{ color: getNdviColorHex(potrero.ultimo_ndvi) }"
                size="8px"
                rounded
                dark
              />
            </div>

            <div v-if="!potrero.geometria" class="q-mt-md">
              <q-banner class="bg-orange-9 text-white" dense rounded>
                <template v-slot:avatar>
                  <q-icon name="warning" color="white" />
                </template>
                <span class="text-caption">
                  Dibuja el polígono para habilitar el análisis NDVI y la ubicación.
                </span>
              </q-banner>
            </div>
          </q-card-section>

          <q-separator dark />

          <q-card-actions>
            <q-btn
              v-if="!potrero.geometria"
              flat
              color="primary"
              icon="draw"
              label="Dibujar polígono"
              @click="$router.push(`/recursos/potreros/draw/${potrero.id}`)"
              class="full-width"
            />
            <template v-else>
              <q-btn
                flat
                color="primary"
                icon="satellite_alt"
                label="Analizar"
                @click="analizarPotrero(potrero)"
                :loading="analizando[potrero.id]"
              />
              <q-space />

            </template>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="mostrarDialogoNuevo" persistent class="glass-dialog-form">
      <q-card style="min-width: 400px">
        <q-form @submit="guardarPotrero" class="q-gutter-md">
          <q-card-section>
            <div class="text-h6">{{ potreroEditando ? 'Editar' : 'Nuevo' }} Potrero</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input
              v-model="formPotrero.nombre"
              label="Nombre del potrero"
              outlined
              dark
              color="white"
              :rules="[(val) => !!val || 'El nombre es requerido']"
              autofocus
            />
            <q-select
              v-model="formPotrero.tipo"
              label="Tipo"
              outlined
              dark
              color="white"
              :options="tiposPotrero"
              emit-value
              map-options
              class="q-mt-md"
            />
            <q-input
              v-model="formPotrero.descripcion"
              label="Descripción (opcional)"
              type="textarea"
              outlined
              dark
              color="white"
              rows="3"
              class="q-mt-md"
            />
            <q-banner inline-actions rounded class="bg-grey-9 text-white q-mt-md">
              <template v-slot:avatar>
                <q-icon name="info" />
              </template>
              <span class="text-caption">
                La <strong>superficie (ha)</strong> y la <strong>ubicación</strong> se calcularán
                automáticamente después de <strong>dibujar el polígono</strong>.
              </span>
            </q-banner>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Cancelar" color="white" v-close-popup @click="resetForm" />
            <q-btn label="Guardar" color="primary" type="submit" :loading="guardando" />
          </q-card-actions>
        </q-form>
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

const dataStore = useDataStore()
const authStore = useAuthStore()
const $q = useQuasar()

const filtro = ref('')
const ordenarPor = ref('nombre')
const mostrarDialogoNuevo = ref(false)
const guardando = ref(false)
const analizando = reactive({})
const potreroEditando = ref(null)

const getFormVacio = () => ({
  nombre: '',
  tipo: null,
  descripcion: '',
})
const formPotrero = reactive(getFormVacio())

const tiposPotrero = [
  { label: 'Pastura', value: 'pastura' },
  { label: 'Campo natural', value: 'campo-natural' },
  { label: 'Verdeo', value: 'verdeo' },
  { label: 'Reserva', value: 'reserva' },
  { label: 'Otro', value: 'otro' },
]

const estadisticas = computed(() => {
  const potreros = dataStore.potreros || []
  const total = potreros.length
  const conGeometria = potreros.filter((p) => p.geometria).length
  const conNdvi = potreros.filter((p) => typeof p.ultimo_ndvi === 'number').length
  const areaTotal = potreros.reduce((sum, p) => sum + (p.superficie_ha || 0), 0)

  return {
    total,
    conGeometria,
    conNdvi,
    areaTotal,
    porcentajeConGeometria: total > 0 ? conGeometria / total : 0,
    porcentajeConNdvi: total > 0 ? conNdvi / total : 0,
  }
})

const potrerosFiltrados = computed(() => {
  let potreros = dataStore.potreros || []

  if (filtro.value) {
    const busqueda = filtro.value.toLowerCase()
    potreros = potreros.filter(
      (p) =>
        p.nombre.toLowerCase().includes(busqueda) ||
        (p.tipo && p.tipo.toLowerCase().includes(busqueda)),
    )
  }

  return [...potreros].sort((a, b) => {
    switch (ordenarPor.value) {
      case 'area':
        return (b.superficie_ha || 0) - (a.superficie_ha || 0)
      case 'ndvi':
        return (b.ultimo_ndvi || -1) - (a.ultimo_ndvi || -1)
      default: // nombre
        return a.nombre.localeCompare(b.nombre)
    }
  })
})

// --- NUEVA LÓGICA DE ICONOS Y COLORES HEX ---

// 1. Definir qué archivo SVG usar según el tipo
function getPotreroIconPath(potrero) {
  const tipo = potrero.tipo ? potrero.tipo.toLowerCase() : 'otro'
  let iconName = 'otro' // default

  if (tipo.includes('pastura')) iconName = 'pastura'
  else if (tipo.includes('campo-natural')) iconName = 'campo-natural'
  else if (tipo.includes('verdeo')) iconName = 'verdeo'
  else if (tipo.includes('reserva')) iconName = 'reserva'

  // Asegúrate de tener estos archivos en /public/icons/
  return `/icons/${iconName}.svg`
}

// 2. Definir el color HEX según NDVI
function getNdviColorHex(ndvi) {
  if (typeof ndvi !== 'number') return '#9e9e9e' // Grey
  if (ndvi < 0.2) return '#ff1744' // Red (Peligro)
  if (ndvi < 0.4) return '#ff9100' // Orange (Alerta)
  if (ndvi < 0.6) return '#ffea00' // Yellow (Regular)
  return '#39ff14' // Verde Neón (Excelente)
}

// Helpers antiguos (para compatibilidad o eliminar si no se usan)
function getEstadoPotrero(potrero) {
  if (!potrero.geometria) return 'Sin polígono'
  if (typeof potrero.ultimo_ndvi !== 'number') return 'Sin análisis'
  if (potrero.ultimo_ndvi >= 0.6) return 'Excelente'
  if (potrero.ultimo_ndvi >= 0.4) return 'Bueno'
  if (potrero.ultimo_ndvi >= 0.2) return 'Regular'
  return 'Pobre'
}

function normalizeNdvi(ndvi) {
  if (typeof ndvi !== 'number') return 0
  return Math.max(0, Math.min(1, (ndvi + 1) / 2))
}

function formatearFecha(fecha) {
  if (!fecha) return 'Nunca'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-AR')
}

function editarPotrero(potrero) {
  potreroEditando.value = potrero
  Object.assign(formPotrero, {
    nombre: potrero.nombre,
    tipo: potrero.tipo,
    descripcion: potrero.descripcion || '',
  })
  mostrarDialogoNuevo.value = true
}

async function guardarPotrero() {
  guardando.value = true
  try {
    const datos = {
      ...formPotrero,
      establecimiento_id: authStore.profile?.establecimiento_id,
    }

    if (potreroEditando.value) {
      await dataStore.updateRegistro('potreros', potreroEditando.value.id, datos)
      $q.notify({ type: 'positive', message: 'Potrero actualizado' })
    } else {
      const datosCrear = { ...datos, superficie_ha: 0 }
      await dataStore.createRegistro('potreros', datosCrear)
      $q.notify({ type: 'positive', message: 'Potrero creado' })
    }
    await dataStore.fetchPotreros()
    mostrarDialogoNuevo.value = false
    resetForm()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar el potrero',
      caption: error.message,
    })
  } finally {
    guardando.value = false
  }
}

function resetForm() {
  potreroEditando.value = null
  Object.assign(formPotrero, getFormVacio())
}

async function confirmarEliminar(potrero) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar el potrero "${potrero.nombre}"?`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Eliminar',
      color: 'negative',
    },
    dark: true,
    class: 'glass-dialog-form',
  }).onOk(async () => {
    try {
      await dataStore.deactivateRegistro('potreros', potrero.id)
      $q.notify({ type: 'positive', message: 'Potrero eliminado correctamente' })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar el potrero',
        caption: error.message,
      })
    }
  })
}

async function analizarPotrero(potrero) {
  analizando[potrero.id] = true
  try {
    const { data, error } = await supabase.functions.invoke('analizar-ndvi', {
      body: {
        establecimiento_id: authStore.profile?.establecimiento_id,
        potrero_ids: [potrero.id],
      },
    })
    if (error) throw error
    if (data.resultados && data.resultados.length > 0) {
      const resultado = data.resultados[0]
      if (resultado.estado === 'exitoso') {
        const potreroEnStore = dataStore.potreros.find((p) => p.id === potrero.id)
        if (potreroEnStore) {
          potreroEnStore.ultimo_ndvi = resultado.ndvi
          potreroEnStore.fecha_ultimo_ndvi = resultado.fecha
        }
        $q.notify({
          type: 'positive',
          message: 'Análisis completado',
          caption: `NDVI: ${resultado.ndvi.toFixed(4)}`,
        })
      } else {
        $q.notify({
          type: 'info',
          message: 'Datos aún no disponibles (Nubes)',
          caption: 'Intenta en unos minutos.',
        })
      }
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al analizar',
      caption: error.message,
    })
  } finally {
    analizando[potrero.id] = false
  }
}



onMounted(() => {
  if (dataStore.potreros.length === 0) {
    dataStore.fetchPotreros()
  }
})
</script>

<style lang="scss" scoped>
/* ESTILOS DE MÁSCARA SVG */
.potrero-type-icon {
  width: 28px;
  height: 28px;
  /* El background-color se asigna inline desde el JS (verde, rojo, etc) */

  /* Máscara */
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  /* La URL de la máscara también se asigna inline */
}

/* Fondo de la página */
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
  margin-bottom: 1rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.filter-card {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-glass {
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: white;
}

.kpi-card {
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  height: 100%;
}

.bg-dark-soft {
  background: rgba(0, 0, 0, 0.4);
}

.potrero-card {
  transition: all 0.3s ease;
  height: 100%;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
.potrero-card.sin-geometria {
  border-left: 4px solid #ff9800;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Estilos Diálogo Glass */
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
