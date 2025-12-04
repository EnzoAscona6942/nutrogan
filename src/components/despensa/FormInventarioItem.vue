<template>
  <q-card class="glass-dialog-form" style="width: 500px; max-width: 90vw">
    <q-form @submit.prevent="guardarItem">
      <q-card-section>
        <div class="text-h6">{{ esEdicion ? 'Editar' : 'Nuevo' }} Item de Inventario</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input
          v-model="form.nombre"
          label="Nombre del Item"
          outlined
          dark
          color="white"
          :rules="[(val) => !!val || 'Requerido']"
          autofocus
        />
        <q-select
          v-model="form.categoria"
          label="Categoría"
          outlined
          dark
          color="white"
          :options="['Alimento', 'Medicina', 'Suplemento', 'Vacuna', 'Otro']"
          :rules="[(val) => !!val || 'Requerido']"
          popup-content-class="glass-dialog-form"
        />

        <q-select
          v-model="form.unidad"
          label="Unidad"
          outlined
          dark
          color="white"
          :rules="[(val) => !!val || 'Requerido']"
          hint="Ej: kg, dosis (puedes escribir una nueva)"
          :options="opcionesUnidadFiltradas"
          use-input
          new-value-mode="add-unique"
          @filter="filtrarUnidades"
          popup-content-class="glass-dialog-form"
        />
        <q-input
          v-model.number="form.precio_unitario"
          type="number"
          step="0.01"
          label="Precio Unitario ($)"
          outlined
          dark
          color="white"
        />

        <q-input
          v-model.number="form.stock_minimo_alerta"
          type="number"
          label="Stock Mínimo de Alerta"
          outlined
          dark
          color="white"
          hint="La tarjeta se pondrá amarilla/roja bajo este nivel"
        />

        <q-input
          v-if="!esEdicion"
          v-model.number="form.stock_actual"
          type="number"
          label="Stock Inicial"
          outlined
          dark
          color="white"
          :rules="[(val) => val >= 0 || 'No puede ser negativo']"
        />
        <q-banner v-if="esEdicion" class="bg-grey-9 text-white rounded-borders">
          El stock actual ({{ itemEditar.stock_actual }}) solo puede modificarse registrando una
          "Compra" o "Ajuste" desde la tarjeta.
        </q-banner>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="white" v-close-popup />
        <q-btn
          :label="esEdicion ? 'Actualizar' : 'Crear Item'"
          type="submit"
          color="primary"
          :loading="loading"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup>
// --- AÑADIMOS 'watch' A LOS IMPORTS ---
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useDataStore } from 'stores/data-store'
import { useQuasar } from 'quasar'

const props = defineProps({
  itemEditar: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const dataStore = useDataStore()
const $q = useQuasar()
const loading = ref(false)

const getFormVacio = () => ({
  id: null,
  nombre: '',
  categoria: null,
  stock_actual: 0,
  unidad: '',
  precio_unitario: 0,
  stock_minimo_alerta: 0,
})

const form = reactive(getFormVacio())
const esEdicion = computed(() => !!props.itemEditar)

// --- INICIO DE LA LÓGICA DE UNIDADES DINÁMICAS ---
const unidadesBase = {
  Alimento: ['kg', 'Bolsa 25kg', 'Bolsa 50kg', 'Tonelada'],
  Medicina: ['dosis', 'cc', 'litro', 'ml', 'Frasco'],
  Suplemento: ['kg', 'Bolsa', 'Bloque'],
  Vacuna: ['dosis', 'Frasco'],
  Otro: ['unidad', 'caja', 'litro', 'kg', 'm'],
}

const opcionesUnidadFiltradas = ref([])

// Función de filtro para el q-select 'use-input'
function filtrarUnidades(val, update) {
  const opcionesDisponibles = unidadesBase[form.categoria] || unidadesBase['Otro']

  if (val === '') {
    update(() => {
      opcionesUnidadFiltradas.value = opcionesDisponibles
    })
    return
  }

  const needle = val.toLowerCase()
  update(() => {
    opcionesUnidadFiltradas.value = opcionesDisponibles.filter(
      (v) => v.toLowerCase().indexOf(needle) > -1,
    )
  })
}

// Observador: si cambia la categoría, actualiza las opciones de unidad
watch(
  () => form.categoria,
  (nuevaCategoria) => {
    opcionesUnidadFiltradas.value = unidadesBase[nuevaCategoria] || unidadesBase['Otro']
    // Opcional: limpiar la unidad si la categoría cambia
    // form.unidad = ''
  },
)
// --- FIN DE LA LÓGICA DE UNIDADES DINÁMICAS ---

async function guardarItem() {
  loading.value = true
  try {
    if (esEdicion.value) {
      const updateData = { ...form }
      delete updateData.id
      delete updateData.stock_actual
      await dataStore.updateInventarioItem(form.id, updateData)
      $q.notify({ type: 'positive', message: 'Item actualizado' })
    } else {
      const createData = { ...form }
      delete createData.id

      const nuevoItem = await dataStore.createInventarioItem(createData)

      if (createData.stock_actual > 0) {
        await dataStore.registrarMovimientoInventario({
          p_item_id: nuevoItem.id,
          p_lote_id: null,
          p_tipo_movimiento: 'Ajuste Manual',
          p_cantidad: createData.stock_actual,
          p_costo_total: createData.stock_actual * createData.precio_unitario,
          p_observaciones: 'Stock inicial de carga',
        })
      }
      $q.notify({ type: 'positive', message: 'Item creado' })
    }
    emit('close')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar el item',
      caption: error.message,
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (props.itemEditar) {
    Object.assign(form, props.itemEditar)
  }
  // Cargar las opciones de unidad iniciales
  opcionesUnidadFiltradas.value = unidadesBase[form.categoria] || unidadesBase['Otro']
})
</script>
