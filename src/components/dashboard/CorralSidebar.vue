<template>
  <div class="corral-sidebar glass-panel-dark column">
    <div class="sidebar-header q-pa-md row items-center justify-between">
      <div class="row items-center">
        <q-icon name="fence" color="primary" size="sm" class="q-mr-sm" />
        <span class="text-subtitle1 text-weight-bold text-white">Corral</span>
      </div>
      <q-badge color="primary" text-color="black" :label="lotes.length" />
    </div>

    <q-separator dark />

    <q-scroll-area class="col q-py-sm">
      <div
        v-if="lotes.length === 0"
        class="column flex-center full-height text-grey-6 q-pa-lg text-center"
      >
        <q-icon name="check_circle_outline" size="3em" class="q-mb-sm opacity-50" />
        <div class="text-caption">Todo el ganado está en campo.</div>
      </div>

      <div v-else class="q-px-md q-gutter-y-md">
        <div
          v-for="lote in lotes"
          :key="lote.id"
          class="lote-chip cursor-pointer"
          draggable="true"
          @dragstart="onDragStart($event, lote)"
        >
          <div class="row items-center no-wrap">
            <q-avatar rounded size="40px" class="bg-dark-soft text-primary">
              <q-icon :name="getIcon(lote.objetivo)" />
            </q-avatar>
            <div class="q-ml-sm overflow-hidden">
              <div class="text-weight-bold text-white ellipsis">{{ lote.identificacion }}</div>
              <div class="text-caption text-grey-5">
                {{ lote.cantidad_animales }} cbz • {{ lote.objetivo }}
              </div>
            </div>
          </div>
          <div class="drag-handle">
            <q-icon name="drag_indicator" color="grey-7" />
          </div>
        </div>
      </div>
    </q-scroll-area>

    <div
      class="drop-zone-corral q-ma-md q-pa-lg text-center dashed-border"
      @dragover.prevent
      @drop="onDropCorral"
    >
      <q-icon name="input" size="md" color="grey-5" />
      <div class="text-caption text-grey-5 q-mt-xs">Soltar aquí para traer al Corral</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  lotes: { type: Array, default: () => [] },
})

const emit = defineEmits(['drag-start', 'drop-corral'])

function getIcon(objetivo) {
  if (objetivo === 'Cría') return 'pets'
  if (objetivo === 'Engorde') return 'restaurant'
  return 'grass'
}

function onDragStart(event, lote) {
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', JSON.stringify(lote))
  emit('drag-start', { event, lote, source: 'corral' })
}

function onDropCorral(event) {
  emit('drop-corral', event)
}
</script>

<style lang="scss" scoped>
.corral-sidebar {
  width: 100%;
  height: 100%;
  background: rgba(15, 15, 20, 0.85);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.lote-chip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(4px);
    border-color: var(--q-primary);
  }

  &:active {
    cursor: grabbing;
  }
}

.bg-dark-soft {
  background: rgba(0, 0, 0, 0.3);
}

.dashed-border {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  transition: all 0.3s;
  &:hover {
    border-color: var(--q-primary);
    background: rgba(57, 255, 20, 0.05);
  }
}
</style>
