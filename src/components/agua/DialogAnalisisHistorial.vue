<template>
  <q-dialog :model-value="modelValue" @update:modelValue="emit('update:modelValue')">
    <q-card class="glass-dialog-form" style="width: 700px; max-width: 90vw">
      <q-card-section>
        <div class="text-h6">Historial de Análisis: {{ fuente.nombre }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-list dark bordered separator class="rounded-borders">
          <q-item-label header>
            Mostrando {{ historial.length }} registros (más recientes primero)
          </q-item-label>

          <q-item v-if="historial.length === 0" class="text-center">
            <q-item-section>
              <q-item-label class="text-grey-5 q-pa-md">
                No hay análisis registrados para esta fuente.
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-expansion-item
            v-for="analisis in historial"
            :key="analisis.id"
            group="historial"
            icon="science"
            :label="`Análisis - ${formatearFecha(analisis.fecha_analisis)}`"
            :caption="`Método: ${analisis.metodo}`"
            dark
            header-class="text-white"
          >
            <q-card class="bg-grey-9 text-white">
              <q-card-section>
                <div class="q-gutter-sm">
                  <q-badge color="primary"> pH: {{ analisis.ph || 'N/A' }} </q-badge>
                  <q-badge color="secondary">
                    Sólidos: {{ analisis.solidos_totales || 'N/A' }} ppm
                  </q-badge>
                  <q-badge color="red"> Nitratos: {{ analisis.nitratos || 'N/A' }} ppm </q-badge>
                  <q-badge color="dark"> Arsénico: {{ analisis.arsenico || 'N/IA' }} ppm </q-badge>
                </div>
                <div class="text-caption text-grey-4 q-mt-md">
                  <strong>Observaciones:</strong>
                  {{ analisis.observaciones || 'Sin observaciones' }}
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cerrar" color="white" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
// --- EL SCRIPT QUEDA IGUAL ---
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  fuente: { type: Object, required: true },
})

const emit = defineEmits(['update:modelValue'])

const historial = computed(() => {
  return props.fuente.analisis_de_agua || []
})

function formatearFecha(fechaISO) {
  if (!fechaISO) return 'N/A'
  const date = new Date(fechaISO)
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
</script>
