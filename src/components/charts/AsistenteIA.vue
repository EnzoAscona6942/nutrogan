<template>
  <q-card flat class="kpi-card-ia">
    <q-card-section>
      <div class="text-h6 text-weight-bold text-white">Asistente Nutrogan IA</div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <q-scroll-area ref="scrollAreaRef" class="chat-window">
        <q-chat-message
          v-for="(msg, index) in messages"
          :key="index"
          :sent="msg.sent"
          :bg-color="msg.sent ? 'cyan-7' : 'blue-grey-9'"
        >
          <div v-html="msg.text"></div>
        </q-chat-message>

        <q-chat-message v-if="loading" bg-color="blue-grey-9">
          <q-spinner-dots size="2em" color="cyan-4" />
        </q-chat-message>
      </q-scroll-area>
    </q-card-section>

    <q-separator dark />

    <!-- ==== SECCIÓN DE INPUT ==== -->
    <q-card-section class="q-pa-sm">
      <q-input
        dark
        borderless
        dense
        v-model="userTypedMessage"
        placeholder="Escribe tu pregunta..."
        :disable="loading"
        @keyup.enter="sendTypedMessage"
      >
        <template v-slot:append>
          <q-btn
            round
            dense
            flat
            icon="send"
            @click="sendTypedMessage"
            :disable="loading || !userTypedMessage.trim()"
            color="cyan-4"
          />
        </template>
      </q-input>
    </q-card-section>
    <!-- ==== FIN: SECCIÓN DE INPUT ==== -->

    <q-separator dark />

    <q-card-section>
      <div class="text-caption text-grey-4 q-mb-sm">O prueba estas sugerencias:</div>
      <div class="row q-gutter-sm">
        <q-btn
          outline
          dense
          color="cyan-4"
          label="¿Qué lotes tienen bajo rendimiento?"
          @click="sendPrompt('¿Qué lotes tienen bajo rendimiento?')"
          :disable="loading"
        />
        <q-btn
          outline
          dense
          color="cyan-4"
          label="Proyectar costos de alimentación"
          @click="sendPrompt('Proyectar costos de alimentación')"
          :disable="loading"
        />
        <q-btn
          outline
          dense
          color="cyan-4"
          label="¿Qué items de inventario están bajos?"
          @click="sendPrompt('¿Qué items del inventario tienen stock crítico?')"
          :disable="loading"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useDataStore } from 'stores/data-store'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const dataStore = useDataStore()
const loading = ref(false)
const scrollAreaRef = ref(null)
const userTypedMessage = ref('')

const messages = ref([
  {
    sent: false,
    text: '¡Hola! Soy el Asistente de IA de Nutrogan. Estoy conectado a tus datos y a la API de Google Gemini. ¿En qué te puedo ayudar hoy?',
  },
])

function scrollToBottom() {
  nextTick(() => {
    if (scrollAreaRef.value) {
      scrollAreaRef.value.setScrollPercentage('vertical', 1, 300)
    }
  })
}

function sendTypedMessage() {
  if (userTypedMessage.value.trim() && !loading.value) {
    sendPrompt(userTypedMessage.value)
    userTypedMessage.value = ''
  }
}

async function sendPrompt(promptText) {
  messages.value.push({ sent: true, text: promptText })
  scrollToBottom()
  loading.value = true

  try {
    const dataContext = {
      lotes: dataStore.lotes,
      evaluaciones: dataStore.evaluaciones,
      inventario: dataStore.inventarioItems,
    }

    const { data, error } = await supabase.functions.invoke('asistente-ia', {
      body: {
        prompt: promptText,
        dataContext: dataContext,
      },
    })

    if (error) throw error

    messages.value.push({
      sent: false,
      text: data.response || 'No se recibió respuesta de la IA.',
    })
  } catch (error) {
    console.error('Error al llamar a la Edge Function:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al contactar al Asistente IA',
      caption: error.message,
    })
    messages.value.push({
      sent: false,
      text: 'Lo siento, no pude conectarme al servicio de IA. Revisa la consola.',
    })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}
</script>

<style lang="scss" scoped>
.kpi-card-ia {
  /* Usamos el mismo estilo glassmorphism que los gráficos y la tabla */
  background: rgba(15, 15, 20, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px; /* Bordes más redondeados para look pro */
  color: white;
}
.chat-window {
  height: 400px; /* Altura mantenida */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px; /* Bordes más sutiles */
  padding: 8px;
}

/* Ajuste de colores de los mensajes para un look más frío y eléctrico */
:deep(.q-message-sent .q-message-text) {
  background-color: #00bcd4 !important; /* Azul/Cian para mensajes enviados */
  color: #000 !important;
}
:deep(.q-message-received .q-message-text) {
  background-color: #37474f !important; /* Gris oscuro para la IA */
  color: #fff !important;
}
</style>
