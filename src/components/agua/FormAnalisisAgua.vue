<template>
  <q-card class="glass-dialog-form" style="width: 500px; max-width: 90vw">
    <q-card-section>
      <div class="text-h6">
        Nuevo Análisis Manual para:
        <span class="text-primary">{{ fuenteNombre }}</span>
      </div>
    </q-card-section>

    <q-form @submit.prevent="guardarAnalisis">
      <q-card-section class="q-gutter-md">
        <q-input
          v-model="form.fecha_analisis"
          type="date"
          label="Fecha del Análisis"
          stack-label
          filled
          dark
          color="white"
          :rules="[(val) => !!val || 'Requerido']"
        />

        <div class="text-caption text-grey-4 q-mt-md">Parámetros de Calidad</div>
        <q-input
          v-model.number="form.ph"
          type="number"
          step="0.1"
          label="pH"
          filled
          dark
          color="white"
          hint="Rango ideal: 6.5 - 8.5"
        />
        <q-input
          v-model.number="form.solidos_totales"
          type="number"
          label="Sólidos Totales (ppm)"
          filled
          dark
          color="white"
          hint="Peligro > 3000 ppm"
        />
        <q-input
          v-model.number="form.nitratos"
          type="number"
          label="Nitratos (ppm)"
          filled
          dark
          color="white"
          hint="Peligro > 45 ppm"
        />
        <q-input
          v-model.number="form.arsenico"
          type="number"
          step="0.01"
          label="Arsénico (ppm)"
          filled
          dark
          color="white"
          hint="Peligro > 0.1 ppm"
        />

        <div class="text-caption text-grey-4 q-mt-md">Parámetros Secundarios (Opcional)</div>
        <q-input
          v-model.number="form.conductividad_electrica"
          type="number"
          label="Conductividad Eléctrica (μS/cm)"
          filled
          dark
          color="white"
        />
        <q-input
          v-model.number="form.dureza"
          type="number"
          label="Dureza (ppm CaCO3)"
          filled
          dark
          color="white"
        />

        <q-input
          v-model="form.observaciones"
          type="textarea"
          label="Observaciones"
          filled
          dark
          color="white"
        />
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="white" v-close-popup />
        <q-btn label="Guardar Análisis" type="submit" color="primary" :loading="loading" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup>
// --- EL SCRIPT QUEDA IGUAL ---
import { ref, reactive } from 'vue'
import { useDataStore } from 'stores/data-store'
import { useQuasar } from 'quasar'

const props = defineProps({
  fuenteId: { type: String, required: true },
  fuenteNombre: { type: String, default: 'Fuente' },
})

const emit = defineEmits(['close'])

const dataStore = useDataStore()
const $q = useQuasar()
const loading = ref(false)

const getFormVacio = () => ({
  fuente_id: props.fuenteId,
  fecha_analisis: new Date().toISOString().split('T')[0],
  metodo: 'Manual',
  ph: null,
  solidos_totales: null,
  conductividad_electrica: null,
  dureza: null,
  nitratos: null,
  arsenico: null,
  observaciones: '',
})

const form = reactive(getFormVacio())

async function guardarAnalisis() {
  loading.value = true
  try {
    const { estado, peligros } = await dataStore.agregarAnalisisDeAgua(form)

    if (estado === 'Peligro') {
      $q.notify({
        type: 'negative',
        message: '¡Peligro! Análisis guardado.',
        caption: peligros.join(', '),
        timeout: 7000,
        icon: 'warning',
      })
    } else if (estado === 'Precaución') {
      $q.notify({
        type: 'warning',
        message: 'Precaución. Análisis guardado.',
        caption: peligros.join(', '),
        timeout: 5000,
        icon: 'info',
      })
    } else {
      $q.notify({
        type: 'positive',
        message: 'Análisis guardado. Calidad Óptima.',
      })
    }

    emit('close')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar el análisis',
      caption: error.message,
    })
  } finally {
    loading.value = false
  }
}
</script>
