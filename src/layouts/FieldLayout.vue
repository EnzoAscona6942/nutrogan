<template>
  <q-layout view="hHh lpR fFf" class="bg-field-dark text-white font-arial fullscreen">
    <q-header class="bg-primary text-black q-py-md" elevated>
      <q-toolbar class="row items-center">
        <div
          class="col-auto row items-center q-mr-md q-px-md q-py-sm rounded-borders cursor-pointer status-badge"
          :class="badgeClass"
          @click="forzarSincronizacion"
        >
          <q-icon :name="statusIcon" size="md" :class="{ 'animate-spin': isSyncing }" />

          <div class="column q-ml-sm">
            <span class="text-weight-bolder text-uppercase leading-none" style="font-size: 0.8rem">
              {{ statusText }}
            </span>
            <span v-if="pendientes > 0" class="text-caption text-weight-bold">
              {{ pendientes }} COLA {{ isSyncing ? '>>>' : '' }}
            </span>
          </div>
        </div>

        <q-space />

        <q-btn
          push
          color="red-14"
          text-color="white"
          icon="logout"
          label="SALIR"
          class="text-weight-bolder q-px-lg shadow-5"
          size="lg"
          style="border: 3px solid white"
          @click="confirmarSalida"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view :is-online="isOnline" @sync-status-change="actualizarEstadoSync" />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

const isOnline = ref(navigator.onLine)
const pendientes = ref(0)
const isSyncing = ref(false)

const checkPendientes = () => {
  const queue = JSON.parse(localStorage.getItem('nutrogan_offline_queue') || '[]')
  pendientes.value = queue.length
}

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
  if (isOnline.value && pendientes.value > 0) {
    triggerSync()
  }
}

function actualizarEstadoSync(status) {
  isSyncing.value = status.syncing
  if (status.count !== undefined) pendientes.value = status.count
  else checkPendientes()
}

function forzarSincronizacion() {
  if (!isOnline.value) return
  if (pendientes.value === 0) return
  triggerSync()
}

function triggerSync() {
  window.dispatchEvent(new CustomEvent('try-sync'))
}

// Colores ajustados para fondo verde
const badgeClass = computed(() => {
  const base = 'shadow-3 border-black'
  if (!isOnline.value) return `${base} bg-red-14 text-white`
  if (isSyncing.value) return `${base} bg-white text-black`
  if (pendientes.value > 0) return `${base} bg-orange-9 text-white`
  return `${base} bg-black text-primary`
})

const statusIcon = computed(() => {
  if (!isOnline.value) return 'wifi_off'
  if (isSyncing.value) return 'sync'
  if (pendientes.value > 0) return 'cloud_upload'
  return 'wifi'
})

const statusText = computed(() => {
  if (!isOnline.value) return 'OFFLINE'
  if (isSyncing.value) return 'SUBIENDO...'
  if (pendientes.value > 0) return 'DATOS LOCALES'
  return 'CONECTADO'
})

function confirmarSalida() {
  if (pendientes.value > 0) {
    $q.dialog({
      title: 'DATOS PENDIENTES',
      message: `Hay ${pendientes.value} registros sin subir.`,
      dark: true,
      ok: { label: 'SALIR IGUAL', color: 'red', size: 'lg' },
      cancel: { label: 'VOLVER', color: 'white', size: 'lg' },
      class: 'field-dialog', // Clase opcional para estilo
    }).onOk(() => router.push('/'))
  } else {
    router.push('/')
  }
}

onMounted(() => {
  $q.dark.set(true)
  checkPendientes()
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  window.addEventListener('queue-updated', checkPendientes)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
  window.removeEventListener('queue-updated', checkPendientes)
})
</script>

<style scoped>
.font-arial {
  font-family: Arial, Helvetica, sans-serif !important;
}
.leading-none {
  line-height: 1;
}
.animate-spin {
  animation: spin 1s infinite linear;
}
.status-badge {
  transition: all 0.3s ease;
  border: 2px solid black;
}
.status-badge:active {
  transform: scale(0.95);
}
.border-black {
  border-color: black !important;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
