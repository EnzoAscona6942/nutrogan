<template>
  <q-card flat class="ai-card">
    <q-card-section class="row items-center justify-between">
      <div class="row items-center">
        <q-icon name="psychology" color="cyan-4" size="2em" class="q-mr-sm" />
        <div class="text-h6 text-white">Informe Estratégico & Predicciones</div>
      </div>
      <q-btn
        flat
        round
        dense
        icon="refresh"
        color="white"
        @click="generarReporte"
        :loading="loading"
      >
        <q-tooltip>Regenerar análisis con datos actuales</q-tooltip>
      </q-btn>
    </q-card-section>

    <q-separator dark inset />

    <q-card-section>
      <div v-if="loading" class="text-center q-pa-lg">
        <div class="text-h6 text-grey-4 q-mb-md">Analizando métricas del establecimiento...</div>
        <q-spinner-orbit color="primary-neon" size="4em" />
        <div class="text-caption text-grey-5 q-mt-sm">
          Correlacionando lluvias, stock y evolución de peso.
        </div>
      </div>

      <div v-else-if="error" class="text-center text-negative q-pa-md">
        <q-icon name="error_outline" size="3em" />
        <div>{{ error }}</div>
        <q-btn
          label="Reintentar"
          color="negative"
          outline
          class="q-mt-sm"
          @click="generarReporte"
        />
      </div>

      <div v-else class="ai-content q-pa-sm" v-html="reportResult"></div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useDataStore } from 'stores/data-store'
import { supabase } from 'boot/supabase'

const dataStore = useDataStore()
const loading = ref(false)
const error = ref(null)
const reportResult = ref('')
const rawReportText = ref(null) // CLAVE: Para enviar el texto limpio al PDF

// Definiciones de color de Nutrogan
const NEON_GREEN = '#00E396'
const ELECTRIC_CYAN = '#00FFFF'

// Utilidad para convertir el HTML con secciones a un array de texto para jsPDF
function parseHtmlToTextSections(htmlString) {
  if (!htmlString) return null

  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlString

  const sections = []
  let currentSection = { title: '', content: '' }

  Array.from(tempDiv.children).forEach((child) => {
    if (child.tagName === 'H4') {
      if (currentSection.title || currentSection.content) {
        sections.push(currentSection)
      }
      const titleText = child.textContent.trim()
      currentSection = {
        title: titleText,
        content: '',
      }
    } else {
      currentSection.content += child.textContent.trim() + '\n\n'
    }
  })

  if (currentSection.title || currentSection.content) {
    sections.push(currentSection)
  }

  return sections
}

// Preparamos los datos masivos para la IA
const globalContext = computed(() => {
  const inventarioCritico = dataStore.inventarioItems
    .filter((i) => i.stock_actual <= i.stock_minimo)
    .map((i) => `${i.nombre} (${i.stock_actual} ${i.unidad})`)

  const lluviasRecientes = dataStore.registrosLluvia
    .slice(0, 5)
    .map((r) => `${r.fecha}: ${r.milimetros}mm`)

  const lotesResumen = dataStore.lotes.map((l) => ({
    id: l.identificacion,
    animales: l.cantidad_animales,
    categoria: l.categoria_animales,
  }))

  return JSON.stringify({
    total_animales: dataStore.lotes.reduce((acc, l) => acc + (l.cantidad_animales || 0), 0),
    lotes_detalle: lotesResumen,
    lluvias_recientes: lluviasRecientes,
    alertas_inventario: inventarioCritico,
    clima_actual: dataStore.clima?.current || 'No disponible',
    pronostico: dataStore.clima?.forecast?.slice(0, 3) || 'No disponible',
  })
})

async function generarReporte() {
  loading.value = true
  error.value = null

  try {
    const prompt = `
      Actúa como un Consultor Ganadero Senior y Analista de Datos para "Nutrogan".
      Analiza los siguientes datos del establecimiento en tiempo real:
      ${globalContext.value}

      Genera un INFORME EJECUTIVO en formato HTML (sin tags html/body, usa h4, ul, li, strong, p).
      Divide tu respuesta en estas dos secciones exactas:

      1. <h4 style="color:${ELECTRIC_CYAN}">Diagnóstico Situacional</h4>
      Analiza el estado actual. Menciona el stock crítico, la carga animal y si las lluvias recientes favorecen o perjudican. Sé directo.

      2. <h4 style="color:${NEON_GREEN}">Predicciones y Estrategia</h4>
      Basado en el clima (pronóstico) y el inventario:
      - Predice riesgos (ej: falta de comida por sequía, barro por exceso de lluvia).
      - Recomienda acciones concretas para la semana (ej: "Comprar maíz", "Mover lote X").
    `

    const { data, error: funcError } = await supabase.functions.invoke('asistente-ia', {
      body: { prompt: prompt, dataContext: {} },
    })

    if (funcError) throw funcError

    reportResult.value = data.response
    rawReportText.value = parseHtmlToTextSections(data.response)
  } catch (e) {
    console.error('Error al contactar a la Edge Function:', e)
    error.value = 'No se pudo generar el informe inteligente.'

    // SOLUCIÓN DE FALLBACK: Usar un reporte de error simulado para que el PDF no falle
    const fallbackReport = `
      <h4>Diagnóstico Situacional</h4>
      <p>⚠️ **ERROR CRÍTICO (500):** La función de IA de Nutrogan ha fallado en el servidor. El análisis en tiempo real no está disponible.</p>
      <p>**Recomendación:** Verifique la configuración de Supabase o intente más tarde. A continuación se muestran los gráficos y la tabla de métricas para un análisis manual.</p>
      <h4>Predicciones y Estrategia</h4>
      <p>La planificación estratégica está pausada hasta que la IA se restablezca.</p>
    `
    reportResult.value = fallbackReport
    rawReportText.value = parseHtmlToTextSections(fallbackReport)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (dataStore.lotes.length > 0) {
    if (!error.value) {
      generarReporte()
    }
  } else {
    reportResult.value = '<p class="text-grey-5">Cargando datos del sistema...</p>'
  }
})

// EXPORTAMOS EL TEXTO PARSEADO
defineExpose({ rawReportText })
</script>

<style lang="scss" scoped>
$primary-neon: #00e396; // Verde Neón
$neon-cyan: #00ffff;

.text-primary-neon {
  color: $primary-neon !important;
}

.ai-card {
  background: rgba(20, 20, 30, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 227, 150, 0.3);
  border-radius: 12px;
  min-height: 300px;
  box-shadow: 0 0 15px rgba(0, 227, 150, 0.15);
}

.ai-content {
  line-height: 1.6;
  color: #e0e0e0;

  :deep(h4) {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.2rem;
    font-weight: 600;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 0.5rem;
  }

  :deep(strong) {
    color: $primary-neon;
  }

  :deep(ul) {
    padding-left: 1.2rem;
    margin-bottom: 1rem;
  }
  :deep(li) {
    margin-bottom: 0.5rem;
  }
}
</style>
