<template>
  <q-card style="width: 500px; max-width: 90vw" class="glass-dialog-form">
    <q-form @submit.prevent="handleSave">
      <q-card-section>
        <div class="text-h6">Mover Lote</div>
        <div class="text-subtitle1 text-primary" v-if="loteProp">
          {{ loteProp.identificacion }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none q-gutter-md">
        <q-select
          filled
          dark
          color="white"
          v-model="loteId"
          :options="loteOptions"
          label="1. Lote a Mover"
          emit-value
          map-options
          :rules="[(val) => !!val || 'Debe seleccionar un lote']"
          popup-content-class="glass-dialog-form"
        >
          <template v-slot:prepend>
            <q-icon name="pets" color="grey-5" />
          </template>
        </q-select>

        <q-select
          filled
          dark
          color="white"
          v-model="destinoId"
          :options="destinoOptions"
          label="2. Mover A (Destino)"
          emit-value
          map-options
          :rules="[val !== undefined || 'Debe seleccionar un destino']"
          popup-content-class="glass-dialog-form"
        >
          <template v-slot:prepend>
            <q-icon name="place" color="grey-5" />
          </template>
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps" class="text-white">
              <q-item-section avatar>
                <q-icon :name="scope.opt.value === 'corral' ? 'fence' : 'grass'" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-input
          filled
          dark
          color="white"
          v-model="newMovimiento.fecha_entrada"
          type="date"
          label="3. Fecha de Movimiento"
          stack-label
          :rules="[(val) => !!val || 'Requerido']"
        >
          <template v-slot:prepend>
            <q-icon name="event" color="grey-5" />
          </template>
        </q-input>
      </q-card-section>

      <q-separator dark />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="white" @click="$emit('close')" />
        <q-btn
          label="Confirmar Movimiento"
          type="submit"
          color="primary"
          icon="sync_alt"
          :loading="loading"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useDataStore } from 'stores/data-store'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

// Props: Recibimos el lote que se seleccionó en la página anterior (opcional)
const props = defineProps({
  loteProp: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const dataStore = useDataStore()
const $q = useQuasar()
const loading = ref(false)

// Si viene un lote por prop, lo usamos como default
const loteId = ref(props.loteProp ? props.loteProp.id : null)
const destinoId = ref(undefined) // El ID del potrero destino (o 'corral')

const newMovimiento = reactive({
  fecha_entrada: new Date().toISOString().split('T')[0], // Hoy
  potrero_id: null,
  lote_id: null,
})

// --- Opciones Computadas Inteligentes ---

// Muestra TODOS los lotes
const loteOptions = computed(() => {
  return dataStore.lotes.map((lote) => {
    const potreroNombre = dataStore.potreros.find((p) => p.id === lote.potrero_actual_id)?.nombre
    return {
      label: `${lote.identificacion} (${potreroNombre || 'Corral'})`,
      value: lote.id,
    }
  })
})

// Muestra solo destinos VÁLIDOS
const destinoOptions = computed(() => {
  if (!loteId.value) {
    return [] // No mostrar nada si no se ha elegido un lote
  }

  const loteSeleccionado = dataStore.lotes.find((l) => l.id === loteId.value)
  // Si no encontramos el lote (ej: se eliminó), retornamos vacío
  if (!loteSeleccionado) return []

  const potreroActualId = loteSeleccionado.potrero_actual_id

  // 1. Encontrar todos los potreros vacíos
  const potrerosVacios = dataStore.potreros
    .filter((potrero) => {
      // Filtrar potreros que NO tengan lotes asignados actualmente
      return !dataStore.lotes.some((lote) => lote.potrero_actual_id === potrero.id)
    })
    .map((potrero) => ({
      label: `${potrero.nombre} (${potrero.superficie_ha || 0} ha)`,
      value: potrero.id,
    }))

  // 2. Añadir la opción de "Corral" (si el lote NO está ya en el corral)
  const corralOption = { label: 'Mover a Corral', value: 'corral' }

  if (potreroActualId) {
    // El lote está en un potrero, puede ir a otros potreros O al corral
    return [...potrerosVacios, corralOption]
  } else {
    // El lote ya está en el corral, solo puede ir a potreros vacíos
    return potrerosVacios
  }
})

// Resetea el destino si el lote cambia
watch(loteId, () => {
  destinoId.value = undefined
})

// --- Lógica de Guardado ---
async function handleSave() {
  loading.value = true

  // 1. Determinar el ID de potrero final (si es 'corral', el ID es null)
  const potreroIdFinal = destinoId.value === 'corral' ? null : destinoId.value

  try {
    // 2. Actualizar el lote para asignarle el nuevo potrero (o null)
    const { error: updateError } = await supabase
      .from('lotes')
      .update({ potrero_actual_id: potreroIdFinal })
      .eq('id', loteId.value)

    if (updateError) throw updateError

    // 3. Registrar el movimiento (solo si va A un potrero o viene DE uno, historial)
    // Aquí creamos el registro histórico
    newMovimiento.lote_id = loteId.value
    newMovimiento.potrero_id = potreroIdFinal // Puede ser null si va a corral
    newMovimiento.observaciones = 'Movimiento manual desde App'

    // Usamos la función del store si existe, o llamamos a supabase directo
    // Para consistencia con QuickMove anterior, insertamos directo:
    await supabase.from('movimientos_de_lotes').insert(newMovimiento)

    // 4. Refrescar todos los datos
    await dataStore.fetchAll()

    $q.notify({ color: 'positive', message: 'Lote movido con éxito', icon: 'check_circle' })
    emit('close')
  } catch (error) {
    $q.notify({ color: 'negative', message: 'Error al mover: ' + error.message })
  } finally {
    loading.value = false
  }
}

// Cargar datos al iniciar el componente
onMounted(() => {
  if (dataStore.lotes.length === 0) {
    dataStore.fetchLotes()
  }
  if (dataStore.potreros.length === 0) {
    dataStore.fetchPotreros()
  }
})
</script>

<style lang="scss" scoped>
/* Estilos idénticos a QuickEvaluateForm y FormFuenteAgua para consistencia visual */
.glass-dialog-form {
  background: rgba(40, 40, 40, 0.85) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

/* Forzamos colores en los inputs de Quasar dentro del diálogo */
:deep(.q-field__label) {
  color: rgba(255, 255, 255, 0.7) !important;
}
:deep(.q-field__native) {
  color: white !important;
}
:deep(.q-field__append i) {
  color: rgba(255, 255, 255, 0.7) !important;
}
:deep(.q-field--filled .q-field__control) {
  background: rgba(255, 255, 255, 0.07) !important;
}
</style>
