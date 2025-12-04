<template>
  <q-card style="width: 450px; max-width: 90vw" class="glass-dialog-form">
    <q-form @submit.prevent="handleSave" class="q-gutter-md">
      <q-card-section>
        <div class="text-h6">Evaluar Lote</div>
        <div class="text-subtitle1 text-primary">{{ loteProp.identificacion }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none q-gutter-md">
        <q-input
          filled
          dark
          color="white"
          v-model="newEvaluacion.fecha_evaluacion"
          type="date"
          label="1. Fecha de Evaluación"
          stack-label
          :rules="[(val) => !!val || 'Requerido']"
        />

        <q-input
          filled
          dark
          color="white"
          v-model.number="newEvaluacion.peso_promedio_kg"
          type="number"
          step="0.1"
          label="2. Peso Promedio (kg)"
          :rules="[(val) => val > 0 || 'Requerido']"
          autofocus
        />

        <div>
          <q-item-label header class="q-pl-none text-white"
            >3. Condición Corporal (CC) (1-9)</q-item-label
          >
          <q-rating
            v-model="newEvaluacion.condicion_corporal"
            max="9"
            size="2.5em"
            color="primary"
            icon="star_border"
            icon-selected="star"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" @click="$emit('close')" />
        <q-btn label="Guardar Evaluación" type="submit" color="primary" :loading="loading" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup>
// 5. LÓGICA DE SCRIPT SIMPLIFICADA
import { ref, reactive } from 'vue' // <-- Ya no se necesita computed ni onMounted
import { useDataStore } from 'stores/data-store'
import { useQuasar } from 'quasar'

// 6. ACEPTAMOS EL LOTE COMO PROP
const props = defineProps({
  loteProp: { type: Object, required: true },
})

const emit = defineEmits(['close'])

const dataStore = useDataStore()
const $q = useQuasar()
const loading = ref(false)
// const loteId = ref(null) // <-- Ya no se usa

const newEvaluacion = reactive({
  fecha_evaluacion: new Date().toISOString().split('T')[0],
  peso_promedio_kg: null, // <-- Cambiado a null para un mejor placeholder
  condicion_corporal: 5,
  lote_id: props.loteProp.id, // <-- 7. ASIGNAMOS EL ID DESDE EL PROP
})

// const loteOptions = computed(...) // <-- Ya no se usa

async function handleSave() {
  loading.value = true
  try {
    // newEvaluacion.lote_id = loteId.value // <-- Esta línea ya no es necesaria

    await dataStore.createRegistro('evaluaciones', newEvaluacion)

    $q.notify({
      color: 'positive',
      message: `Evaluación guardada para el lote ${props.loteProp.identificacion}.`,
    })

    emit('close')
  } catch (error) {
    $q.notify({ color: 'negative', message: 'Error al guardar: ' + error.message })
  } finally {
    loading.value = false
  }
}

// onMounted(...) // <-- Ya no se usa
</script>

<style lang="scss" scoped>
.glass-dialog-form {
  background: rgba(40, 40, 40, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;

  .q-field__label {
    color: rgba(255, 255, 255, 0.7);
  }

  .q-field__native {
    color: white;
  }

  .q-item__label--header {
    color: rgba(255, 255, 255, 0.9);
  }
}
</style>
