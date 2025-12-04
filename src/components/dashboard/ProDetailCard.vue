<template>
  <q-card class="pro-detail-card glass-effect">
    <div class="status-bar" :style="{ backgroundColor: loteData ? '#00e5ff' : '#39ff14' }"></div>

    <q-card-section class="q-pb-sm relative-position">
      <div class="row items-center no-wrap">
        <q-avatar
          rounded
          color="blue-grey-10"
          text-color="white"
          icon="landscape"
          class="q-mr-md shadow-2"
        />
        <div>
          <div class="text-overline text-grey-5 leading-none">POTRERO</div>
          <div class="text-h6 text-white leading-none">{{ potreroData.nombre }}</div>
        </div>
      </div>

      <q-btn
        icon="close"
        flat
        round
        dense
        color="grey-5"
        class="absolute-top-right q-mt-xs q-mr-xs"
        @click="$emit('close')"
      />

      <div class="row q-mt-md q-col-gutter-sm">
        <div class="col-4">
          <div class="metric-mini">
            <div class="label">Has</div>
            <div class="value">{{ potreroData.superficie }}</div>
          </div>
        </div>
        <div class="col-4">
          <div class="metric-mini">
            <div class="label">NDVI</div>
            <div class="value" style="color: #39ff14">{{ potreroData.ndvi }}</div>
          </div>
        </div>
        <div class="col-4">
          <div class="metric-mini">
            <div class="label">Estado</div>
            <div class="value" :style="{ color: loteData ? '#00e5ff' : '#39ff14' }">
              {{ loteData ? 'OCUPADO' : 'LIBRE' }}
            </div>
          </div>
        </div>
      </div>
    </q-card-section>

    <q-separator color="grey-9" />

    <q-card-section v-if="loteData" class="bg-dark-soft q-pt-sm">
      <div class="text-caption text-grey-5 q-mb-xs flex justify-between items-center">
        <span>LOTE ASIGNADO</span>
        <q-icon name="drag_indicator" size="xs" />
      </div>

      <div
        class="lote-draggable-card cursor-grab relative-position"
        draggable="true"
        @dragstart="onDragStart"
      >
        <div class="row items-center">
          <div class="lote-icon-wrapper q-mr-md">
            <div
              class="lote-icon-shape"
              :style="{
                '-webkit-mask-image': `url(${loteData.icon})`,
                'mask-image': `url(${loteData.icon})`,
              }"
            ></div>
          </div>

          <div>
            <div class="text-subtitle2 text-white text-weight-bold">
              {{ loteData.identificacion }}
            </div>
            <div class="text-caption" style="color: #00e5ff">{{ loteData.cantidad }} Cabezas</div>
          </div>
        </div>
        <q-tooltip class="bg-black text-cyan-13 border-cyan">
          Arrastra al corral para mover
        </q-tooltip>
      </div>

      <div class="row justify-end q-mt-sm">
        <q-btn
          flat
          dense
          size="sm"
          color="grey-5"
          label="Ver Historial"
          icon-right="arrow_forward"
          @click="$emit('view-history')"
        />
      </div>
    </q-card-section>

    <q-card-section v-else class="bg-dark-soft text-center q-py-lg">
      <q-icon name="add_circle_outline" size="2em" color="grey-8" />
      <div class="text-caption text-grey-6 q-mt-xs">Arrastra un lote aquí para asignar</div>
    </q-card-section>
  </q-card>
</template>

<script setup>
const props = defineProps({
  potreroData: { type: Object, required: true },
  loteData: { type: Object, default: null },
})

const emit = defineEmits(['close', 'view-history', 'drag-lote'])

function onDragStart(event) {
  event.dataTransfer.effectAllowed = 'move'
  const payload = {
    type: 'card_lote',
    loteId: props.loteData.id,
    potreroOrigenId: props.potreroData.id,
  }
  event.dataTransfer.setData('text/plain', JSON.stringify(payload))
  emit('drag-lote', payload)
}
</script>

<style lang="scss" scoped>
.pro-detail-card {
  width: 300px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(18, 18, 20, 0.98);
}

.status-bar {
  height: 3px;
  width: 100%;
  /* El color se controla inline en el template */
}

.border-cyan {
  border: 1px solid #00e5ff;
}

/* --- ÍCONO DE LOTE (Estilo Cyan) --- */
.lote-icon-wrapper {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Opcional: Si quieres recuadro como en corral, descomenta esto: */
  /*
  background: #000;
  border: 1px solid #00e5ff;
  border-radius: 8px;
  */
}

.lote-icon-shape {
  width: 28px;
  height: 28px;
  background-color: #00e5ff; /* Cyan Neón para lotes ocupados */
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}

.metric-mini {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  padding: 6px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
  .label {
    font-size: 0.6rem;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
  .value {
    font-size: 0.85rem;
    font-weight: bold;
    color: #eee;
  }
}

.lote-draggable-card {
  background: rgba(0, 229, 255, 0.05);
  border: 1px dashed rgba(0, 229, 255, 0.5);
  border-radius: 8px;
  padding: 10px;
  transition: all 0.2s;
  &:hover {
    background: rgba(0, 229, 255, 0.15);
    transform: translateY(-2px);
    cursor: grab;
  }
  &:active {
    cursor: grabbing;
  }
}

.bg-dark-soft {
  background: rgba(0, 0, 0, 0.4);
}
</style>
