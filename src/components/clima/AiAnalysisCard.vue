<template>
  <q-card flat class="filter-card">
    <q-card-section>
      <div class="text-h6">Análisis y Recomendaciones (IA)</div>
    </q-card-section>

    <q-separator dark />

    <q-card-section v-if="loading" class="text-center q-pa-lg">
      <q-spinner-dots color="primary" size="3em" />
      <div class="text-grey-4 q-mt-md">Generando análisis...</div>
    </q-card-section>

    <q-card-section v-else-if="error">
      <div class="text-negative text-center q-pa-md">
        <q-icon name="error" size="2em" />
        <div>Error al contactar la IA: {{ error }}</div>
      </div>
    </q-card-section>

    <q-card-section v-else class="ai-report-content">
      <div v-html="analysisResult"></div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn
        flat
        label="Volver a Analizar"
        icon="refresh"
        @click="$emit('request-analysis')"
        :loading="loading"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
// ¡Ahora es un componente "tonto"!
// Solo recibe props y emite eventos. No tiene lógica de IA.

defineProps({
  analysisResult: {
    type: String,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
  error: {
    type: String,
    default: null,
  },
})

// Avisa al padre (LluviasPage) que el usuario quiere un nuevo análisis
defineEmits(['request-analysis'])
</script>

<style lang="scss" scoped>
.filter-card {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  height: 100%;
}

.ai-report-content {
  max-height: 500px;
  overflow-y: auto;
  line-height: 1.6;

  /* Estilos para el HTML que genera la IA */
  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4) {
    font-size: 1.1rem;
    font-weight: bold;
    color: $primary;
    border-bottom: 1px solid $primary;
    padding-bottom: 4px;
    margin-top: 16px;
    margin-bottom: 8px;
  }
  :deep(ul) {
    padding-left: 20px;
  }
  :deep(li) {
    margin-bottom: 8px;
  }
  :deep(p) {
    margin-bottom: 12px;
  }
  :deep(strong) {
    color: $warning;
  }
}
</style>
