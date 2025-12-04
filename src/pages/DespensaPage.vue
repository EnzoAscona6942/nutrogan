<template>
  <q-page padding class="dashboard-pro-bg text-white">
    <div class="row items-center justify-between q-mb-md">
      <div class="page-title-box" style="margin-bottom: 0">Mi Despensa</div>
      <div class="row items-center q-gutter-md">
        <q-btn color="primary" icon="add" label="Nuevo Item" @click="abrirFormItem(null)" />
        <q-btn flat round dense icon="arrow_back" @click="$router.push('/recursos')" />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-4">Valor Total del Inventario</div>
            <div class="text-h5 text-weight-bold">${{ kpi_valorTotal.toFixed(2) }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-4">Items Totales</div>
            <div class="text-h5 text-weight-bold">{{ kpi_itemsTotales }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat class="kpi-card" :class="kpi_stockCritico > 0 ? 'border-warning' : ''">
          <q-card-section>
            <div
              class="text-caption"
              :class="kpi_stockCritico > 0 ? 'text-warning' : 'text-grey-4'"
            >
              Items con Stock Crítico
            </div>
            <div
              class="text-h5 text-weight-bold"
              :class="kpi_stockCritico > 0 ? 'text-warning' : ''"
            >
              <q-icon name="warning" v-if="kpi_stockCritico > 0" />
              {{ kpi_stockCritico }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card flat class="q-mb-md filter-card">
      <q-card-section class="row q-col-gutter-md items-center">
        <div class="col-12 col-md-4">
          <q-input
            v-model="filtroNombre"
            placeholder="Buscar por nombre..."
            outlined
            dense
            dark
            color="white"
            clearable
          >
            <template v-slot:prepend><q-icon name="search" color="white" /></template>
          </q-input>
        </div>
        <div class="col-12 col-md-4">
          <q-select
            v-model="filtroCategoria"
            label="Filtrar por categoría"
            :options="['Todas', 'Alimento', 'Medicina', 'Suplemento', 'Vacuna', 'Otro']"
            outlined
            dense
            dark
            color="white"
            emit-value
            map-options
            popup-content-class="glass-dialog-form"
          />
        </div>
        <div class="col-12 col-md-4 text-right">
          <q-btn label="Ver Historial" icon="history" flat color="white" @click="abrirHistorial" />
        </div>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-md">
      <div v-if="itemsFiltrados.length === 0" class="col-12 text-center text-grey-5 q-pa-xl">
        <q-icon name="inventory_2" size="xl" />
        <div class="text-h6 q-mt-md">No se encontraron items en el inventario.</div>
        <q-btn
          color="primary"
          icon="add"
          label="Crear el primer item"
          class="q-mt-md"
          @click="abrirFormItem(null)"
        />
      </div>

      <div v-for="item in itemsFiltrados" :key="item.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <InventarioCard
          :item="item"
          @editar="abrirFormItem"
          @eliminar="confirmarEliminar"
          @usar="abrirFormMovimiento"
          @comprar="(item) => abrirFormMovimiento(item, 'compra')"
        />
      </div>
    </div>

    <q-dialog
      v-model="dialogos.formItem"
      persistent
      class="glass-dialog-form"
      transition-show="bubble-bounce"
      transition-hide="bubble-bounce"
    >
      <FormInventarioItem :item-editar="itemSeleccionado" @close="dialogos.formItem = false" />
    </q-dialog>

    <q-dialog
      v-model="dialogos.formMovimiento"
      persistent
      class="glass-dialog-form"
      transition-show="bubble-bounce"
      transition-hide="bubble-bounce"
    >
      <FormMovimientoInventario
        v-if="itemSeleccionado"
        :item="itemSeleccionado"
        :tipo="tipoMovimiento"
        @close="dialogos.formMovimiento = false"
      />
    </q-dialog>

    <q-dialog
      v-model="dialogos.historial"
      class="glass-dialog-form"
      transition-show="bubble-bounce"
      transition-hide="bubble-bounce"
    >
      <q-card class="glass-dialog-form" style="width: 700px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Historial de Movimientos</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-list dark bordered separator>
            <q-item v-for="mov in dataStore.inventarioMovimientos" :key="mov.id">
              <q-item-section avatar>
                <q-avatar
                  :color="mov.tipo_movimiento === 'Compra' ? 'positive' : 'negative'"
                  text-color="white"
                  :icon="mov.tipo_movimiento === 'Compra' ? 'add' : 'remove'"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ mov.inventario_items.nombre }}</q-item-label>
                <q-item-label caption class="text-grey-4">
                  <span class="text-weight-bold"
                    >{{ mov.cantidad }} {{ mov.inventario_items.unidad }}</span
                  >
                  <span v-if="mov.lotes"> • Asignado a: {{ mov.lotes.identificacion }}</span>
                </q-item-label>
                <q-item-label caption class="text-grey-4">{{ mov.observaciones }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label caption class="text-grey-4">{{
                  formatearFecha(mov.fecha)
                }}</q-item-label>
                <q-item-label v-if="mov.costo_total > 0"
                  >${{ mov.costo_total.toFixed(2) }}</q-item-label
                >
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="white" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
// --- El script queda igual ---
import { ref, computed, reactive, onMounted } from 'vue'
import { useDataStore } from 'stores/data-store'
import { useQuasar } from 'quasar'

import InventarioCard from 'components/despensa/InventarioCard.vue'
import FormInventarioItem from 'components/despensa/FormInventarioItem.vue'
import FormMovimientoInventario from 'components/despensa/FormMovimientoInventario.vue'

const dataStore = useDataStore()
const $q = useQuasar()

const filtroNombre = ref('')
const filtroCategoria = ref('Todas')

const dialogos = reactive({
  formItem: false,
  formMovimiento: false,
  historial: false,
})
const itemSeleccionado = ref(null)
const tipoMovimiento = ref('uso') // 'uso' o 'compra'

const kpi_valorTotal = computed(() => {
  return dataStore.inventarioItems.reduce((total, item) => {
    return total + (item.stock_actual || 0) * (item.precio_unitario || 0)
  }, 0)
})
const kpi_itemsTotales = computed(() => dataStore.inventarioItems.length)
const kpi_stockCritico = computed(() => {
  return dataStore.inventarioItems.filter((item) => item.stock_actual <= item.stock_minimo_alerta)
    .length
})

const itemsFiltrados = computed(() => {
  return dataStore.inventarioItems.filter((item) => {
    const porNombre = filtroNombre.value
      ? item.nombre.toLowerCase().includes(filtroNombre.value.toLowerCase())
      : true
    const porCategoria =
      filtroCategoria.value !== 'Todas' ? item.categoria === filtroCategoria.value : true
    return porNombre && porCategoria
  })
})

function abrirFormItem(item) {
  itemSeleccionado.value = item
  dialogos.formItem = true
}

function abrirFormMovimiento(item, tipo = 'uso') {
  itemSeleccionado.value = item
  tipoMovimiento.value = tipo
  dialogos.formMovimiento = true
}

async function abrirHistorial() {
  await dataStore.fetchInventarioMovimientos()
  dialogos.historial = true
}

function confirmarEliminar(item) {
  $q.dialog({
    title: 'Confirmar Desactivación',
    message: `¿Estás seguro de desactivar "${item.nombre}"? No se borrará, pero se ocultará de la lista.`,
    cancel: true,
    persistent: true,
    ok: { label: 'Desactivar', color: 'negative' },
    dark: true,
    class: 'glass-dialog-form',
  }).onOk(async () => {
    try {
      await dataStore.deleteInventarioItem(item.id)
      $q.notify({ type: 'positive', message: 'Item desactivado' })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al desactivar',
        caption: error.message,
      })
    }
  })
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return 'N/A'
  const date = new Date(fechaISO)
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

onMounted(() => {
  if (dataStore.inventarioItems.length === 0) {
    dataStore.fetchInventarioItems()
  }
  if (dataStore.lotes.length === 0) {
    dataStore.fetchLotes()
  }
})
</script>

<style lang="scss" scoped>
/* CAMBIO 6: Añadimos los estilos 'pro' */
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
}

.border-warning {
  border-color: $warning;
}

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
:deep(.glass-dialog-form .q-field__hint) {
  color: rgba(255, 255, 255, 0.5);
}
</style>
