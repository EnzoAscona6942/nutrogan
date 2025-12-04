<template>
  <div>
    <q-tabs
      v-model="tab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab name="sanidad" label="Evento Sanitario" icon="vaccines" />
      <q-tab name="agua" label="Análisis de Agua" icon="science" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="sanidad">
        <q-form @submit.prevent="handleSaveSanidad" class="q-gutter-md">
          <q-select
            filled
            v-model="newSanitario.lote_id"
            :options="loteOptions"
            label="1. Seleccionar Lote"
            emit-value
            map-options
            :rules="[(val) => !!val || 'Requerido']"
          />
          <q-input
            filled
            v-model="newSanitario.fecha"
            type="date"
            label="2. Fecha del Evento"
            stack-label
            :rules="[(val) => !!val || 'Requerido']"
          />
          <q-input
            filled
            v-model="newSanitario.tipo_evento"
            label="3. Tipo de Evento"
            hint="Ej: Vacunación Aftosa, Desparasitación"
            :rules="[(val) => !!val || 'Requerido']"
          />
          <q-input
            filled
            v-model="newSanitario.descripcion"
            label="4. Descripción (Opcional)"
            type="textarea"
          />
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" @click="$emit('close')" />
            <q-btn label="Guardar Evento" type="submit" color="primary" :loading="loadingSanidad" />
          </q-card-actions>
        </q-form>
      </q-tab-panel>

      <q-tab-panel name="agua">
        <q-form @submit.prevent="handleSaveAgua" class="q-gutter-md">
          <q-select
            filled
            v-model="newAgua.fuente_agua_id"
            :options="fuenteOptions"
            label="1. Seleccionar Fuente de Agua"
            emit-value
            map-options
            :rules="[(val) => !!val || 'Requerido']"
          />
          <q-input
            filled
            v-model="newAgua.fecha_analisis"
            type="date"
            label="2. Fecha del Análisis"
            stack-label
            :rules="[(val) => !!val || 'Requerido']"
          />
          <q-input filled v-model.number="newAgua.ph" type="number" step="0.1" label="3. pH" />
          <q-input
            filled
            v-model.number="newAgua.tds_mg_l"
            type="number"
            label="4. Salinidad (TDS mg/l)"
          />
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" @click="$emit('close')" />
            <q-btn label="Guardar Análisis" type="submit" color="primary" :loading="loadingAgua" />
          </q-card-actions>
        </q-form>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useDataStore } from 'stores/data-store'
import { useAuthStore } from 'stores/auth-store'
import { useQuasar } from 'quasar'

const emit = defineEmits(['close'])
const dataStore = useDataStore()
const authStore = useAuthStore()
const $q = useQuasar()

const tab = ref('sanidad')
const loadingSanidad = ref(false)
const loadingAgua = ref(false)
const fechaHoy = new Date().toISOString().split('T')[0]

// Formulario de Sanidad
const newSanitario = reactive({
  fecha: fechaHoy,
  tipo_evento: '',
  descripcion: '',
  lote_id: null,
})

// Formulario de Agua
const newAgua = reactive({
  fecha_analisis: fechaHoy,
  ph: null,
  tds_mg_l: null,
  fuente_agua_id: null,
})

// Opciones para los QSelect
const loteOptions = computed(() => {
  return dataStore.lotes.map((lote) => ({
    label: `${lote.identificacion} (${lote.objetivo})`,
    value: lote.id,
  }))
})
const fuenteOptions = computed(() => {
  return dataStore.fuentesAgua.map((fuente) => ({
    label: fuente.nombre,
    value: fuente.id,
  }))
})

// Handlers de guardado
async function handleSaveSanidad() {
  if (!authStore.profile || !authStore.profile.establecimiento_id) {
    $q.notify({ color: 'negative', message: 'Error: No se encontró el perfil del usuario.' })
    return
  }

  loadingSanidad.value = true
  try {
    const eventoCompleto = {
      ...newSanitario,
      establecimiento_id: authStore.profile.establecimiento_id,
    }
    await dataStore.createRegistro('eventos_sanitarios', eventoCompleto)
    $q.notify({ color: 'positive', message: 'Evento sanitario guardado.' })
    emit('close')
  } catch (error) {
    $q.notify({ color: 'negative', message: 'Error: ' + error.message })
  } finally {
    loadingSanidad.value = false
  }
}

async function handleSaveAgua() {
  if (!authStore.profile || !authStore.profile.establecimiento_id) {
    $q.notify({ color: 'negative', message: 'Error: No se encontró el perfil del usuario.' })
    return
  }

  loadingAgua.value = true
  try {
    const analisisCompleto = {
      ...newAgua,
      establecimiento_id: authStore.profile.establecimiento_id,
    }
    await dataStore.createRegistro('analisis_de_agua', analisisCompleto)
    $q.notify({ color: 'positive', message: 'Análisis de agua guardado.' })
    emit('close')
  } catch (error) {
    $q.notify({ color: 'negative', message: 'Error: ' + error.message })
  } finally {
    loadingAgua.value = false
  }
}

// Cargar datos para los selectores
onMounted(() => {
  if (dataStore.lotes.length === 0) {
    dataStore.fetchLotes()
  }
  if (dataStore.fuentesAgua.length === 0) {
    dataStore.fetchFuentesAgua()
  }
})
</script>
