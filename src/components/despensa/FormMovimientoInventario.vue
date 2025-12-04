<template>
  <q-card class="glass-dialog-form" style="width: 500px; max-width: 90vw">
    <q-form @submit.prevent="registrarMovimiento">
      <q-card-section>
        <div class="text-h6">
          {{ esCompra ? 'Registrar Compra' : 'Registrar Uso' }}
        </div>
        <div class="text-subtitle1 text-primary">{{ item.nombre }}</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-input
              v-model.number="form.cantidad"
              type="number"
              step="0.1"
              :label="`Cantidad (${item.unidad})`"
              outlined
              dark
              color="white"
              :rules="[(val) => val > 0 || 'Debe ser mayor a 0']"
              autofocus
            />
          </div>
          <div class="col-6">
            <q-input
              v-model.number="form.costo_total"
              type="number"
              step="0.01"
              label="Costo Total ($)"
              prefix="$"
              outlined
              dark
              color="white"
              :rules="[(val) => val >= 0 || 'No puede ser negativo']"
            />
          </div>
        </div>

        <q-input
          v-model="form.fecha"
          type="date"
          label="Fecha del Movimiento"
          stack-label
          outlined
          dark
          color="white"
          :rules="[(val) => !!val || 'Requerido']"
        />

        <q-select
          v-if="!esCompra"
          v-model="form.lote_id"
          label="Asignar Uso al Lote (Trazabilidad)"
          outlined
          dark
          color="white"
          :options="opcionesLotes"
          emit-value
          map-options
          clearable
          hint="Opcional: Asigna este costo a un lote"
          popup-content-class="glass-dialog-form"
        />

        <q-input
          v-model="form.observaciones"
          type="textarea"
          :label="esCompra ? 'Notas (Ej: Nro de Factura)' : 'Notas (Ej: Dosis aplicada)'"
          outlined
          dark
          color="white"
        />
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="white" v-close-popup />
        <q-btn
          :label="esCompra ? 'Registrar Compra' : 'Registrar Uso'"
          type="submit"
          :color="esCompra ? 'positive' : 'negative'"
          :loading="loading"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup>
// --- El script queda igual ---
import { ref, reactive, computed } from 'vue'
import { useDataStore } from 'stores/data-store'
import { useQuasar } from 'quasar'

const props = defineProps({
  item: { type: Object, required: true },
  tipo: { type: String, default: 'uso' }, // 'uso' o 'compra'
})

const emit = defineEmits(['close'])

const dataStore = useDataStore()
const $q = useQuasar()
const loading = ref(false)

const esCompra = computed(() => props.tipo === 'compra')

const opcionesLotes = computed(() =>
  dataStore.lotes.map((lote) => ({
    label: `${lote.identificacion} (${lote.potreros?.nombre || 'En Corral'})`,
    value: lote.id,
  })),
)

const form = reactive({
  fecha: new Date().toISOString().split('T')[0],
  cantidad: null,
  costo_total: null,
  lote_id: null,
  observaciones: '',
})

async function registrarMovimiento() {
  loading.value = true

  const cantidadMovimiento = esCompra.value ? form.cantidad : -form.cantidad

  const rpcParams = {
    p_item_id: props.item.id,
    p_lote_id: form.lote_id,
    p_tipo_movimiento: esCompra.value ? 'Compra' : 'Uso',
    p_cantidad: cantidadMovimiento,
    p_costo_total: form.costo_total,
    p_observaciones: form.observaciones,
  }

  try {
    const nuevoStock = await dataStore.registrarMovimientoInventario(rpcParams)

    $q.notify({
      type: 'positive',
      message: `Movimiento registrado. Nuevo stock: ${nuevoStock} ${props.item.unidad}`,
    })

    emit('close')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al registrar el movimiento',
      caption: error.message,
    })
  } finally {
    loading.value = false
  }
}
</script>
