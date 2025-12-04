<template>
  <q-card flat class="kpi-card text-white" :class="cardClass">
    <q-card-section class="q-pb-sm">
      <div class="row items-start no-wrap">
        <div class="col">
          <q-badge :color="categoria.color" :label="categoria.label" />
          <div class="text-h6 ellipsis q-mt-xs">{{ item.nombre }}</div>
        </div>
        <div class="col-auto">
          <q-btn flat round dense icon="more_vert">
            <q-menu dark>
              <q-list dense>
                <q-item clickable v-close-popup @click="emit('editar', item)">
                  <q-item-section avatar><q-icon name="edit" size="xs" /></q-item-section>
                  <q-item-section>Editar Item</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="emit('eliminar', item)">
                  <q-item-section avatar
                    ><q-icon name="delete" size="xs" color="red"
                  /></q-item-section>
                  <q-item-section class="text-red">Desactivar Item</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none text-center">
      <div class="text-h3 text-weight-bold" :class="stockColorClass">
        {{ item.stock_actual }}
        <span class="text-h6 text-grey-4">{{ item.unidad }}</span>
      </div>
      <div class="text-caption text-grey-4">Valorizado: ${{ valorizado.toFixed(2) }}</div>
      <div class="text-caption" :class="stockColorClass">
        <q-icon :name="estado.icon" v-if="estado.icon" />
        {{ estado.label }}
      </div>
    </q-card-section>

    <q-separator dark />

    <q-card-actions class="q-pa-md row q-col-gutter-sm">
      <div class="col-6">
        <q-btn
          label="Usar"
          color="negative"
          outline
          icon="remove"
          class="full-width"
          @click="emit('usar', item)"
        />
      </div>
      <div class="col-6">
        <q-btn
          label="Comprar"
          color="positive"
          outline
          icon="add"
          class="full-width"
          @click="emit('comprar', item)"
        />
      </div>
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
})
const emit = defineEmits(['editar', 'eliminar', 'usar', 'comprar'])

const categorias = {
  Alimento: { label: 'Alimento', color: 'brown-5' },
  Medicina: { label: 'Medicina', color: 'blue-5' },
  Suplemento: { label: 'Suplemento', color: 'teal-5' },
  Vacuna: { label: 'Vacuna', color: 'purple-5' },
  Otro: { label: 'Otro', color: 'grey-7' },
}

const categoria = computed(() => {
  return categorias[props.item.categoria] || categorias['Otro']
})

const valorizado = computed(() => {
  return (props.item.stock_actual || 0) * (props.item.precio_unitario || 0)
})

const estado = computed(() => {
  const stock = props.item.stock_actual
  const min = props.item.stock_minimo_alerta

  if (stock <= 0) {
    return { label: 'Agotado', icon: 'error', class: 'text-negative' }
  }
  if (stock <= min) {
    return { label: `Stock Crítico (Min: ${min})`, icon: 'warning', class: 'text-warning' }
  }
  // CAMBIO 4: Clase de stock óptimo
  return { label: 'Stock Óptimo', icon: null, class: 'text-positive' }
})

const stockColorClass = computed(() => estado.value.class)

// CAMBIO 5: Lógica de clase de borde
const cardClass = computed(() => {
  if (estado.value.class === 'text-negative') return 'border-negative'
  if (estado.value.class === 'text-warning') return 'border-warning'
  return ''
})
</script>

<style lang="scss" scoped>
/* CAMBIO 6: Estilos de la tarjeta */
.kpi-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  border-width: 2px; // Borde más grueso para estado
  border-style: solid;
  /* El color base viene de .kpi-card (rgba(255, 255, 255, 0.1)) */
}
.border-negative {
  border-color: $negative !important;
}
.border-warning {
  border-color: $warning !important;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
