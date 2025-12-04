<template>
  <q-form @submit.prevent="handleSave" class="q-gutter-md">
    <q-input
      filled
      v-model="newAlimento.nombre"
      label="1. Nombre del Insumo"
      :rules="[(val) => !!val || 'Requerido']"
      hint="Ej: Maíz, Expeller de Soja, Sal Mineral"
    />

    <q-input
      filled
      v-model.number="newAlimento.precio_kg"
      type="number"
      step="0.01"
      label="2. Precio por Kg ($)"
      :rules="[(val) => val > 0 || 'Debe ser mayor a 0']"
    />

    <q-input
      filled
      v-model.number="newAlimento.stock_kg"
      type="number"
      step="0.1"
      label="3. Cantidad Comprada (Kg)"
      :rules="[(val) => val > 0 || 'Debe ser mayor a 0']"
    />

    <q-card-actions align="right">
      <q-btn flat label="Cancelar" @click="$emit('close')" />
      <q-btn label="Guardar Gasto" type="submit" color="primary" :loading="loading" />
    </q-card-actions>
  </q-form>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useDataStore } from 'stores/data-store'
import { useAuthStore } from 'stores/auth-store'
import { useQuasar } from 'quasar'

const emit = defineEmits(['close'])

const dataStore = useDataStore()
const authStore = useAuthStore()
const $q = useQuasar()
const loading = ref(false)

const newAlimento = reactive({
  nombre: '',
  precio_kg: 0,
  stock_kg: 0,
})

async function handleSave() {
  if (!authStore.profile || !authStore.profile.establecimiento_id) {
    $q.notify({ color: 'negative', message: 'Error: No se encontró el perfil del usuario.' })
    return
  }

  loading.value = true
  try {
    const newAlimentoWithEstablecimiento = {
      ...newAlimento,
      establecimiento_id: authStore.profile.establecimiento_id,
    }

    await dataStore.createRegistro('alimentos', newAlimentoWithEstablecimiento)

    $q.notify({
      color: 'positive',
      message: `Insumo "${newAlimento.nombre}" guardado en la Despensa.`,
    })

    emit('close')
  } catch (error) {
    $q.notify({ color: 'negative', message: 'Error al guardar: ' + error.message })
  } finally {
    loading.value = false
  }
}
</script>
