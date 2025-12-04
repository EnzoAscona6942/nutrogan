<template>
  <q-card class="emergency-card full-height column justify-between no-shadow">
    <div class="hazard-stripes"></div>

    <div class="q-pa-md relative-position z-10 column full-height justify-between">
      <div class="row justify-between items-center">
        <div class="text-subtitle2 text-red-5 font-weight-bold flex items-center">
          <q-icon name="warning" class="q-mr-xs animate-blink" /> EMERGENCIA
        </div>
        <q-btn round flat dense icon="settings" color="grey-6" size="sm" @click="dialog = true" />
      </div>

      <div class="text-center q-my-md">
        <div class="text-h6 text-white font-display">{{ config.nombre || 'NO CONFIGURADO' }}</div>
        <div class="text-h5 text-red-5 font-mono">{{ config.valor || '---' }}</div>
      </div>

      <q-btn
        :href="config.valor ? `tel:${config.valor}` : '#'"
        class="panic-btn full-width"
        :disable="!config.valor"
        unelevated
      >
        <div class="row items-center"><q-icon name="call" class="q-mr-sm" /> LLAMAR</div>
      </q-btn>
    </div>

    <q-dialog v-model="dialog">
      <q-card class="bg-grey-10 text-white" style="width: 300px; border: 1px solid red">
        <q-card-section class="text-h6 text-red">Configurar Destino</q-card-section>
        <q-card-section class="q-gutter-y-md">
          <q-input
            v-model="tempConfig.nombre"
            label="Nombre (Ej: Bomberos)"
            filled
            dark
            color="red"
          />
          <q-input v-model="tempConfig.valor" label="Teléfono" filled dark color="red" type="tel" />
          <q-btn label="Guardar" color="red" class="full-width" @click="guardar" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useDataStore } from 'stores/data-store'

const store = useDataStore()

const dialog = ref(false)
const config = reactive({ nombre: 'Emergencias', valor: '911', tipo: 'custom' })
const tempConfig = reactive({ ...config })

async function guardar() {
  Object.assign(config, tempConfig)
  await store.updateConfigEmergencia(config)
  dialog.value = false
}

onMounted(async () => {
  // Cargar config del establecimiento si existe
  if (store.establecimientoActual?.emergencia_config) {
    Object.assign(config, store.establecimientoActual.emergencia_config)
    Object.assign(tempConfig, config)
  }
})
</script>

<style scoped lang="scss">
.emergency-card {
  background: linear-gradient(160deg, #1a0505 0%, #000 100%);
  border: 1px solid rgba(255, 50, 50, 0.3);
  border-radius: 24px;
  overflow: hidden;
  position: relative;
}
.hazard-stripes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background: repeating-linear-gradient(45deg, #b71c1c, #b71c1c 10px, #000 10px, #000 20px);
}
.panic-btn {
  background: #d50000;
  color: white;
  font-weight: 900;
  letter-spacing: 1px;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 15px rgba(213, 0, 0, 0.4);
  transition: transform 0.1s;
  &:active {
    transform: scale(0.95);
  }
}
.animate-blink {
  animation: blink 2s infinite;
}
@keyframes blink {
  50% {
    opacity: 0.4;
  }
}
</style>
