<template>
  <q-card class="interactive-board full-height column no-shadow relative-position">
    <div class="row items-center justify-between q-pa-md border-b glass-header">
      <div>
        <div class="text-h6 text-white">Gestión de Equipo & Comunicación</div>
        <div class="text-caption text-grey-5">
          Arrastra para asignar roles o crea alertas manuales
        </div>
      </div>

      <div class="row q-gutter-sm">
        <q-btn
          unelevated
          rounded
          color="primary"
          text-color="black"
          icon="campaign"
          label="NOTIFICACIONES"
          class="text-weight-bold shadow-glow"
          @click="abrirAlertas"
        />

        <q-btn
          flat
          rounded
          color="white"
          icon="person_add"
          label="Nuevo"
          class="glass-btn"
          @click="abrirDialogo(null)"
        />
      </div>
    </div>

    <div class="board-content col column q-pa-md">
      <div class="col-grow scroll relative-position q-mb-md">
        <div v-if="dataStore.equipo.length === 0" class="absolute-center text-center text-grey-6">
          <q-icon name="group_off" size="3em" class="opacity-50" />
          <div class="q-mt-sm">No hay equipo cargado</div>
        </div>

        <div v-else class="team-grid">
          <div
            v-for="miembro in dataStore.equipo"
            :key="miembro.id"
            class="member-card cursor-grab"
            draggable="true"
            @dragstart="onDragStart($event, miembro)"
          >
            <div class="row items-center justify-between">
              <div class="row items-center no-wrap">
                <q-avatar
                  :color="getColor()"
                  text-color="black"
                  size="md"
                  font-size="12px"
                  class="q-mr-sm"
                >
                  {{ getIniciales(miembro.nombre_completo) }}
                </q-avatar>
                <div class="column">
                  <span
                    class="text-white text-weight-bold text-body2 ellipsis"
                    style="max-width: 110px"
                    >{{ miembro.nombre_completo }}</span
                  >
                  <span
                    class="text-primary text-caption text-uppercase"
                    style="font-size: 0.65rem"
                    >{{ miembro.especialidad }}</span
                  >
                </div>
              </div>
              <q-btn
                flat
                round
                dense
                icon="edit"
                color="grey-7"
                size="sm"
                @click="abrirDialogo(miembro)"
              />
            </div>

            <div class="row q-mt-sm q-gutter-x-xs justify-end">
              <div
                v-if="miembro.config_notificaciones?.lluvia"
                class="dot-indicator bg-cyan-4"
              ></div>
              <div
                v-if="miembro.config_notificaciones?.sanidad"
                class="dot-indicator bg-yellow-500"
              ></div>
              <div
                v-if="miembro.config_notificaciones?.stock"
                class="dot-indicator bg-primary"
              ></div>
              <div
                v-if="miembro.config_notificaciones?.general"
                class="dot-indicator bg-white"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <q-separator dark class="q-mb-md opacity-20" />

      <div class="text-subtitle2 text-grey-5 q-mb-sm font-mono text-uppercase">
        Canales de Suscripción (Drag & Drop)
      </div>

      <div class="row q-col-gutter-md" style="min-height: 220px">
        <div class="col-12 col-sm-6 col-lg-3" v-for="cat in categoriasHub" :key="cat.id">
          <div
            class="notification-hub column"
            :class="`hub-${cat.color}`"
            @dragover.prevent
            @drop="onDrop($event, cat.id)"
          >
            <div class="hub-header" :class="`text-${cat.text_color}`">
              <div class="row items-center justify-center">
                <q-icon :name="cat.icon" size="xs" class="q-mr-xs" /> {{ cat.label }}
              </div>
            </div>

            <div class="hub-body col relative-position scroll q-pa-sm">
              <div v-if="getSubscribers(cat.id).length > 0" class="q-gutter-y-xs full-width">
                <div
                  v-for="(m, index) in getSubscribers(cat.id)"
                  :key="m.id"
                  class="tech-chip row items-center justify-between animate-pop"
                  :class="`border-${cat.color}`"
                >
                  <div class="row items-center no-wrap col ellipsis">
                    <div
                      class="index-box font-mono"
                      :class="`bg-${cat.color}-glass text-${cat.text_color}`"
                    >
                      {{ (index + 1).toString().padStart(2, '0') }}
                    </div>
                    <span class="text-caption text-white q-ml-sm ellipsis">{{
                      m.nombre_completo
                    }}</span>
                  </div>
                  <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    size="xs"
                    color="grey-6"
                    class="hover-red"
                    @click="unsubscribe(m, cat.id)"
                  >
                    <q-tooltip class="bg-red text-white">Desvincular</q-tooltip>
                  </q-btn>
                </div>
              </div>

              <div
                v-else
                class="absolute-center text-center opacity-30 full-width pointer-events-none"
              >
                <q-icon :name="cat.icon" size="2em" />
                <div class="text-caption text-uppercase q-mt-xs" style="font-size: 0.6rem">
                  Arrastra Aquí
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <q-dialog
      v-model="dialogoAlertas"
      full-width
      full-height
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-dark text-white column">
        <q-toolbar class="bg-dark-header border-b">
          <q-icon name="campaign" color="primary" size="md" />
          <q-toolbar-title class="font-display">Centro de Comunicaciones</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <div class="row col">
          <div class="col-12 col-md-6 border-r q-pa-md scroll">
            <q-tabs
              v-model="alertTab"
              dense
              class="text-grey"
              active-color="primary"
              indicator-color="primary"
              align="left"
            >
              <q-tab name="nueva" label="Redactar Alerta" icon="edit" />
              <q-tab name="historial" label="Historial" icon="history" />
            </q-tabs>

            <q-tab-panels v-model="alertTab" animated class="bg-transparent q-mt-md">
              <q-tab-panel name="nueva" class="q-pa-none">
                <q-form @submit.prevent="enviarAlertaManual" class="q-gutter-y-md">
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-sm-6">
                      <q-select
                        v-model="alertaForm.categoria"
                        :options="categoriasHub.map((c) => ({ label: c.label, value: c.id }))"
                        label="Canal Destino"
                        outlined
                        dark
                        color="primary"
                        emit-value
                        map-options
                      />
                    </div>
                    <div class="col-12 col-sm-6">
                      <q-select
                        v-model="alertaForm.prioridad"
                        :options="[
                          { label: 'Urgente (Inmediato)', value: 'urgente' },
                          { label: 'Solo Guardar', value: 'programado' },
                        ]"
                        label="Prioridad"
                        outlined
                        dark
                        color="primary"
                        emit-value
                        map-options
                      />
                    </div>
                  </div>
                  <div v-if="alertaForm.prioridad === 'programado'">
                    <q-input
                      v-model="alertaForm.fecha_programada"
                      type="datetime-local"
                      label="Fecha de Envío"
                      outlined
                      dark
                      color="primary"
                    />
                  </div>
                  <q-input
                    v-model="alertaForm.titulo"
                    label="Asunto"
                    outlined
                    dark
                    color="primary"
                    :rules="[(val) => !!val || 'Requerido']"
                  />
                  <q-editor
                    v-model="alertaForm.mensaje"
                    min-height="150px"
                    dark
                    content-class="bg-dark-soft text-grey-3"
                    toolbar-text-color="white"
                    toolbar-toggle-color="primary"
                    placeholder="Escribe tu mensaje aquí..."
                  />

                  <q-expansion-item
                    icon="palette"
                    label="Diseño del Comunicado"
                    class="bg-dark-soft rounded-borders"
                  >
                    <q-card class="bg-transparent">
                      <q-card-section class="q-gutter-y-sm">
                        <div class="text-caption text-grey-5">Color de Acento</div>
                        <div class="row q-gutter-sm">
                          <div
                            class="color-swatch cursor-pointer bg-primary"
                            @click="alertaForm.estilos_email.color_cabecera = '#39ff14'"
                            :class="{
                              'active-swatch':
                                alertaForm.estilos_email.color_cabecera === '#39ff14',
                            }"
                          ></div>
                          <div
                            class="color-swatch cursor-pointer bg-cyan-4"
                            @click="alertaForm.estilos_email.color_cabecera = '#00e5ff'"
                            :class="{
                              'active-swatch':
                                alertaForm.estilos_email.color_cabecera === '#00e5ff',
                            }"
                          ></div>
                          <div
                            class="color-swatch cursor-pointer bg-red-14"
                            @click="alertaForm.estilos_email.color_cabecera = '#ff1744'"
                            :class="{
                              'active-swatch':
                                alertaForm.estilos_email.color_cabecera === '#ff1744',
                            }"
                          ></div>
                          <div
                            class="color-swatch cursor-pointer bg-dark"
                            style="border: 1px solid #333"
                            @click="alertaForm.estilos_email.color_cabecera = '#111111'"
                            :class="{
                              'active-swatch':
                                alertaForm.estilos_email.color_cabecera === '#111111',
                            }"
                          ></div>
                        </div>
                        <q-input
                          v-model="alertaForm.estilos_email.titulo_cabecera"
                          label="Título Encabezado"
                          dense
                          outlined
                          dark
                        />
                      </q-card-section>
                    </q-card>
                  </q-expansion-item>

                  <div class="row justify-end q-pt-md">
                    <q-btn
                      label="Enviar Notificación"
                      type="submit"
                      color="primary"
                      text-color="black"
                      icon="send"
                      :loading="loadingAlert"
                    />
                  </div>
                </q-form>
              </q-tab-panel>

              <q-tab-panel name="historial" class="q-pa-none">
                <div
                  v-if="dataStore.notifications.length === 0"
                  class="text-center q-pa-lg text-grey-6"
                >
                  <q-icon name="inbox" size="3em" />
                  <div>No hay notificaciones enviadas.</div>
                </div>
                <q-list separator dark v-else>
                  <q-item v-for="notif in dataStore.notifications" :key="notif.id">
                    <q-item-section>
                      <q-item-label>{{ notif.titulo }}</q-item-label>
                      <q-item-label caption class="text-grey-5"
                        >{{ new Date(notif.created_at).toLocaleDateString() }} •
                        {{ notif.categoria }}</q-item-label
                      >
                    </q-item-section>
                    <q-item-section side>
                      <div class="row items-center">
                        <q-badge :color="notif.estado === 'enviado' ? 'green' : 'orange'">{{
                          notif.estado
                        }}</q-badge>
                        <q-btn
                          flat
                          round
                          dense
                          icon="delete"
                          color="red"
                          size="sm"
                          @click="eliminarNotificacion(notif.id)"
                          class="q-ml-sm"
                        />
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-tab-panel>
            </q-tab-panels>
          </div>

          <div
            class="col-12 col-md-6 q-pa-xl bg-black flex flex-center relative-position overflow-hidden"
          >
            <div class="text-overline absolute-top-left q-ma-md text-grey-7">VISTA PREVIA</div>

            <div class="email-mockup bg-white full-width shadow-10">
              <div
                class="email-header q-pa-md text-center"
                :style="{
                  borderTop: `4px solid ${alertaForm.estilos_email.color_cabecera}`,
                  background: '#0a0a0a',
                }"
              >
                <div class="row justify-center items-center q-mb-sm">
                  <img
                    src="~assets/nutrogan-logo.svg"
                    style="height: 32px; width: 32px"
                    class="q-mr-sm"
                  />
                  <div class="text-h6 text-white font-display tracking-wide">NUTROGAN</div>
                </div>
                <div class="text-caption text-grey-5 font-mono">
                  {{ alertaForm.estilos_email.titulo_cabecera }}
                </div>
              </div>

              <div class="q-pa-xl text-black">
                <div class="text-h5 font-weight-bold q-mb-lg">
                  {{ alertaForm.estilos_email.titulo_cabecera || 'AVISO IMPORTANTE' }}
                </div>

                <div class="text-subtitle1 text-weight-bold q-mb-sm">
                  {{ alertaForm.titulo || 'Asunto del mensaje' }}
                </div>
                <div
                  class="text-body1 text-grey-8"
                  v-html="alertaForm.mensaje || 'Aquí se mostrará el contenido del correo...'"
                ></div>

                <div class="q-mt-xl q-pt-md border-t text-center">
                  <q-btn
                    :style="{
                      background: alertaForm.estilos_email.color_cabecera,
                      color: '#000',
                    }"
                    label="Acceder al Panel"
                    unelevated
                    rounded
                    class="text-weight-bold"
                  />
                </div>
              </div>

              <div class="bg-grey-2 q-pa-md text-center text-caption text-grey-6">
                {{ alertaForm.estilos_email.footer_text }} <br />
                &copy; 2025 Nutrogan Technologies | Gestión Ganadera de Precisión.
              </div>
            </div>
          </div>
        </div>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDialog" backdrop-filter="blur(8px)">
      <q-card class="glass-dialog" style="width: 450px">
        <q-card-section class="row items-center justify-between border-b">
          <div class="text-h6 text-white">{{ form.id ? 'Editar' : 'Nuevo' }} Profesional</div>
          <q-btn icon="close" flat round dense v-close-popup color="grey-5" />
        </q-card-section>
        <q-form @submit.prevent="guardar" class="q-pa-lg q-gutter-y-md">
          <q-input
            v-model="form.nombre_completo"
            label="Nombre"
            outlined
            dark
            dense
            color="primary"
            :rules="[(val) => !!val || 'Requerido']"
          />
          <q-select
            v-model="form.especialidad"
            :options="roles"
            label="Rol"
            outlined
            dark
            dense
            color="primary"
          />
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model="form.telefono"
                label="WhatsApp"
                outlined
                dark
                dense
                color="primary"
              />
            </div>
            <div class="col-6">
              <q-input v-model="form.email" label="Email" outlined dark dense color="primary" />
            </div>
          </div>

          <div class="bg-dark-soft q-pa-md rounded-borders">
            <div class="text-caption text-grey-5 q-mb-sm text-uppercase font-mono">
              Suscripciones Activas
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-toggle
                  v-model="form.config_notificaciones.lluvia"
                  label="Lluvia"
                  color="cyan-4"
                  keep-color
                  icon="thunderstorm"
                  class="text-grey-4"
                  dense
                />
              </div>
              <div class="col-6">
                <q-toggle
                  v-model="form.config_notificaciones.sanidad"
                  label="Sanidad"
                  color="red-5"
                  keep-color
                  icon="medical_services"
                  class="text-grey-4"
                  dense
                />
              </div>
              <div class="col-6">
                <q-toggle
                  v-model="form.config_notificaciones.stock"
                  label="Stock"
                  color="primary"
                  keep-color
                  icon="inventory_2"
                  class="text-grey-4"
                  dense
                />
              </div>
              <div class="col-6">
                <q-toggle
                  v-model="form.config_notificaciones.general"
                  label="General"
                  color="grey-4"
                  keep-color
                  icon="notifications"
                  class="text-grey-4"
                  dense
                />
              </div>
            </div>
          </div>

          <q-btn
            label="Guardar"
            type="submit"
            color="primary"
            text-color="black"
            class="full-width"
            unelevated
          />
        </q-form>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useDataStore } from 'stores/data-store'
import { useQuasar } from 'quasar'

const dataStore = useDataStore()
const $q = useQuasar()

const showDialog = ref(false)
const dialogoAlertas = ref(false)
const alertTab = ref('nueva')
const loadingAlert = ref(false)
const isDragging = ref(false)

const roles = ['Veterinario', 'Ing. Agrónomo', 'Capataz', 'Peón Rural', 'Administrativo', 'Dueño']

const categoriasHub = [
  { id: 'lluvia', label: 'CLIMA', icon: 'thunderstorm', color: 'cyan', text_color: 'cyan-4' },
  {
    id: 'sanidad',
    label: 'SANIDAD',
    icon: 'medical_services',
    color: 'red',
    text_color: 'yellow-7',
  },
  { id: 'stock', label: 'STOCK', icon: 'inventory_2', color: 'green', text_color: 'primary' },
  { id: 'general', label: 'GENERAL', icon: 'notifications', color: 'white', text_color: 'white' },
]

const form = reactive({
  id: null,
  nombre_completo: '',
  especialidad: '',
  telefono: '',
  email: '',
  config_notificaciones: { lluvia: false, sanidad: false, stock: false, general: false },
})

const alertaForm = reactive({
  titulo: '',
  mensaje: '',
  categoria: 'general',
  prioridad: 'urgente',
  fecha_programada: null,
  estilos_email: {
    color_cabecera: '#39ff14',
    titulo_cabecera: 'AVISO NUTROGAN',
    footer_text: 'Mensaje enviado desde el Centro de Mando.',
  },
})

function getSubscribers(tipo) {
  return dataStore.equipo.filter((m) => m.config_notificaciones && m.config_notificaciones[tipo])
}

function getIniciales(text) {
  return text ? text.substring(0, 2).toUpperCase() : 'NN'
}

async function unsubscribe(miembro, tipo) {
  try {
    const copia = JSON.parse(JSON.stringify(miembro))
    if (!copia.config_notificaciones) copia.config_notificaciones = {}
    copia.config_notificaciones[tipo] = false
    await dataStore.saveMiembroEquipo(copia)
    $q.notify({ type: 'info', message: 'Desvinculado', timeout: 800 })
  } catch {
    $q.notify({ type: 'negative', message: 'Error' })
  }
}

function onDragStart(event, miembro) {
  isDragging.value = true
  event.dataTransfer.setData('text/plain', JSON.stringify(miembro))
}

async function onDrop(event, tipo) {
  isDragging.value = false
  try {
    const rawData = event.dataTransfer.getData('text/plain')
    if (!rawData) return
    const miembroData = JSON.parse(rawData)
    const miembro = dataStore.equipo.find((m) => m.id === miembroData.id)

    if (miembro) {
      if (!miembro.config_notificaciones) miembro.config_notificaciones = {}
      if (!miembro.config_notificaciones[tipo]) {
        miembro.config_notificaciones[tipo] = true
        await dataStore.saveMiembroEquipo(JSON.parse(JSON.stringify(miembro)))
        $q.notify({ type: 'positive', message: 'Asignado a ' + tipo.toUpperCase() })
      } else {
        $q.notify({ type: 'warning', message: 'Ya asignado', timeout: 500 })
      }
    }
  } catch {
    // Ignorar error
  }
}

function abrirAlertas() {
  dataStore.fetchNotifications()
  dialogoAlertas.value = true
}

async function enviarAlertaManual() {
  loadingAlert.value = true
  try {
    const dest = getSubscribers(alertaForm.categoria)
    if (dest.length === 0) throw new Error('No hay usuarios suscritos a esta categoría')

    const notifData = {
      ...alertaForm,
      destinatarios_snapshot: dest.map((d) => ({ nombre: d.nombre_completo, email: d.email })),
    }
    await dataStore.createNotification(notifData)
    $q.notify({ type: 'positive', message: 'Alerta Enviada', icon: 'send' })
    alertaForm.titulo = ''
    alertaForm.mensaje = ''
    alertTab.value = 'historial'
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  } finally {
    loadingAlert.value = false
  }
}

function eliminarNotificacion(id) {
  dataStore.deleteNotification(id)
}

function getColor() {
  return 'blue-grey-4'
}

function abrirDialogo(miembro) {
  if (miembro) Object.assign(form, JSON.parse(JSON.stringify(miembro)))
  else
    Object.assign(form, {
      id: null,
      nombre_completo: '',
      especialidad: '',
      telefono: '',
      email: '',
      config_notificaciones: { lluvia: false, sanidad: false, stock: false, general: false },
    })
  showDialog.value = true
}

async function guardar() {
  try {
    await dataStore.saveMiembroEquipo({ ...form })
    showDialog.value = false
    $q.notify({ type: 'positive', message: 'Guardado' })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  }
}

onMounted(() => dataStore.fetchEquipo())
</script>

<style scoped lang="scss">
/* Mismos estilos base */
.interactive-board {
  background: rgba(20, 20, 25, 0.75);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
}
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
.member-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 10px;
}

/* Hubs Estilo "Pro" - Alineado a la Marca */
.notification-hub {
  border-radius: 16px;
  height: 100%;
  min-height: 220px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
  &.drag-active {
    transform: scale(1.02);
    background: rgba(255, 255, 255, 0.1);
  }
}

/* Colores Corregidos (Cian, Rojo, Verde, Blanco) */
.hub-cyan {
  border-color: rgba(0, 229, 255, 0.3);
}
.hub-red {
  border-color: rgba(201, 255, 23, 0.3);
}
.hub-green {
  border-color: rgba(57, 255, 20, 0.3);
}
.hub-white {
  border-color: rgba(255, 255, 255, 0.3);
}

.bg-cyan-glass {
  background: rgba(0, 229, 255, 0.15);
}
.bg-red-glass {
  background: rgba(212, 255, 23, 0.15);
}
.bg-green-glass {
  background: rgba(57, 255, 20, 0.15);
}
.bg-white-glass {
  background: rgba(255, 255, 255, 0.15);
}

/* Chips */
.tech-chip {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  padding: 4px 6px;
  border-left: 3px solid transparent;
  transition: background 0.2s;
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    .hover-red {
      opacity: 1;
    }
  }
}
.border-cyan {
  border-left-color: #00e5ff;
}
.border-red {
  border-left-color: #aeff17;
}
.border-green {
  border-left-color: #39ff14;
}
.border-white {
  border-left-color: #ffffff;
}

.index-box {
  font-size: 0.7rem;
  font-weight: bold;
  padding: 2px 5px;
  border-radius: 4px;
  min-width: 24px;
  text-align: center;
}

/* Mockup Email */
.email-mockup {
  border-radius: 8px;
  overflow: hidden;
}
.glass-btn {
  background: rgba(255, 255, 255, 0.1);
}

/* Dot Indicators */
.dot-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.bg-cyan-4 {
  background: #00e5ff;
}
.bg-yellow-500 {
  background: #b9ff17;
}
.bg-primary {
  background: #39ff14;
}
.bg-white {
  background: #ffffff;
}

/* Color Swatches */
.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  transition: transform 0.2s;
  &.active-swatch {
    transform: scale(1.2);
    box-shadow: 0 0 8px white;
  }
}
.hover-red {
  opacity: 0;
  transition: opacity 0.2s;
  &:hover {
    color: #ff1744 !important;
    opacity: 1;
  }
}

.glass-dialog {
  background: #18181b !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}
</style>
