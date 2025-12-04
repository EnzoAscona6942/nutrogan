<template>
  <q-card style="width: 450px; max-width: 90vw">
    <q-form @submit.prevent="guardarEvaluacion">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Escanear Condición Corporal</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="text-subtitle1 text-primary">{{ lote.identificacion }}</div>
        <div class="text-caption text-grey">Objetivo: {{ lote.objetivo }}</div>
      </q-card-section>

      <q-card-section class="text-center">
        <div class="camera-simulation bg-dark text-white flex flex-center">
          <q-icon name="camera_alt" size="100px" color="grey-7" />
          <div class="text-caption text-grey-5 q-mt-md">
            (Simulación de escáner de Condición Corporal)
          </div>
        </div>

        <q-input
          v-model="form.fecha_evaluacion"
          type="date"
          label="Fecha de Evaluación"
          stack-label
          filled
          class="q-mt-md"
          :rules="[(val) => !!val || 'Requerido']"
        />

        <div class="text-subtitle1 q-mt-lg">Condición Corporal (1-9)</div>
        <q-rating
          v-model="form.condicion_corporal"
          max="9"
          size="2.5em"
          color="primary"
          icon="star_border"
          icon-selected="star"
          class="q-mt-sm"
        />
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn
          label="Guardar CC"
          type="submit"
          color="primary"
          icon="save"
          :loading="loading"
          :disable="!form.condicion_corporal"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useDataStore } from 'stores/data-store'
import { useQuasar } from 'quasar'

const props = defineProps({
  lote: { type: Object, required: true },
})
const emit = defineEmits(['close'])

const dataStore = useDataStore()
const $q = useQuasar()
const loading = ref(false)

const form = reactive({
  lote_id: props.lote.id,
  fecha_evaluacion: new Date().toISOString().split('T')[0],
  peso_promedio_kg: null, // No lo usamos para CC
  condicion_corporal: 5, // Default
  observaciones: 'Evaluación de Condición Corporal',
})

async function guardarEvaluacion() {
  loading.value = true
  try {
    await dataStore.createRegistro('evaluaciones', form)
    $q.notify({
      type: 'positive',
      message: 'Condición Corporal guardada',
      caption: `Lote: ${props.lote.identificacion}, CC: ${form.condicion_corporal}`,
    })
    emit('close')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar',
      caption: error.message,
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.camera-simulation {
  height: 200px;
  border-radius: 8px;
  border: 2px dashed $grey-7;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
