<template>
  <q-card class="support-chat-card column full-height">
    <q-card-section class="bg-dark-soft row items-center q-py-sm border-b">
      <q-avatar icon="smart_toy" color="primary" text-color="black" size="md" class="q-mr-sm" />
      <div>
        <div class="text-subtitle2 text-white text-weight-bold">Soporte Inteligente</div>
        <div class="text-caption text-primary">En línea - Responde al instante</div>
      </div>
    </q-card-section>

    <q-card-section class="col scroll relative-position q-pa-md" ref="scrollAreaRef">
      <q-chat-message
        v-for="(msg, index) in messages"
        :key="index"
        :name="msg.isUser ? 'Tú' : 'Nutrogan IA'"
        :sent="msg.isUser"
        :text="[msg.text]"
        :bg-color="msg.isUser ? 'primary' : 'grey-9'"
        :text-color="msg.isUser ? 'black' : 'white'"
        :avatar="msg.isUser ? undefined : 'images/nutrogan-logo.svg'"
      >
        <template v-slot:avatar v-if="!msg.isUser">
          <q-avatar color="dark" text-color="primary" icon="smart_toy" class="q-mr-sm" size="md" />
        </template>
      </q-chat-message>

      <div v-if="loading" class="row items-center q-my-md">
        <q-spinner-dots size="2rem" color="primary" class="q-mr-sm" />
        <span class="text-caption text-grey-5">Escribiendo...</span>
      </div>
    </q-card-section>

    <q-separator dark />
    <q-card-section class="bg-dark-soft q-pa-sm">
      <q-form @submit.prevent="sendMessage" class="row items-end no-wrap q-gutter-x-sm">
        <q-input
          v-model="userInput"
          dark
          dense
          outlined
          placeholder="Describe tu problema..."
          class="col"
          color="primary"
          :disable="loading"
          autofocus
        />
        <q-btn
          round
          dense
          flat
          icon="send"
          color="primary"
          type="submit"
          :disable="!userInput.trim() || loading"
        />
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const userInput = ref('')
const loading = ref(false)
const scrollAreaRef = ref(null)

const messages = ref([
  {
    isUser: false,
    text: '¡Hola! Soy tu asistente técnico. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre cómo crear lotes, registrar lluvias o usar el mapa.',
  },
])

function scrollToBottom() {
  nextTick(() => {
    const el = scrollAreaRef.value?.$el
    if (el) el.scrollTop = el.scrollHeight
  })
}

async function sendMessage() {
  const text = userInput.value.trim()
  if (!text) return

  // 1. Agregar mensaje del usuario
  messages.value.push({ isUser: true, text })
  userInput.value = ''
  loading.value = true
  scrollToBottom()

  try {
    // 2. Llamar a la IA (Reutilizamos tu Edge Function existente)
    // Le damos un contexto de "Soporte Técnico"
    const promptSistema = `
      Actúa como un Agente de Soporte Técnico experto para la app "Nutrogan".
      La app tiene funciones de: Lotes, Mapas, Clima, Inventario (Despensa) y Reportes.

      Responde de forma breve, amable y directa. Si te preguntan cómo hacer algo, da los pasos numerados.

      Pregunta del usuario: "${text}"
    `

    const { data, error } = await supabase.functions.invoke('asistente-ia', {
      body: {
        prompt: promptSistema,
        dataContext: {}, // No necesitamos enviar datos sensibles para soporte general
      },
    })

    if (error) throw error

    // 3. Agregar respuesta de la IA
    messages.value.push({ isUser: false, text: data.response })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error de conexión con el asistente.' })
    messages.value.push({
      isUser: false,
      text: 'Lo siento, tuve un problema de conexión. Intenta de nuevo.',
    })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}
</script>

<style lang="scss" scoped>
.support-chat-card {
  background: rgba(20, 20, 25, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
}
.bg-dark-soft {
  background: rgba(0, 0, 0, 0.3);
}
.border-b {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
