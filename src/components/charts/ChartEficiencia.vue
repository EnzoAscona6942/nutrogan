<template>
  <div class="chart-container">
    <div class="chart-header row items-center q-pb-sm">
      <!-- Usamos un color verde más genérico de Quasar si 'green-accent-3' no está definido -->
      <q-icon name="trending_up" color="green-4" size="sm" class="q-mr-sm" />
      <div class="text-h6 text-white">Evolución de Peso</div>
    </div>
    <v-chart ref="vchartRef" class="chart" :option="option" autoresize />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useDataStore } from 'stores/data-store'
import { use, graphic } from 'echarts/core' // Importamos 'graphic' para degradados
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, TitleComponent, LegendComponent])

const dataStore = useDataStore()
const vchartRef = ref(null)
defineExpose({ vchartRef })

const option = computed(() => {
  const data = [...dataStore.evaluaciones]
    .sort((a, b) => new Date(a.fecha_evaluacion) - new Date(b.fecha_evaluacion))
    .map((e) => [e.fecha_evaluacion, parseFloat(e.peso_promedio_kg).toFixed(2)])

  // Definiciones de color de Nutrogan
  const NEON_GREEN = '#00E396'


  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(20, 20, 30, 0.9)',
      borderColor: NEON_GREEN, // Borde Neón
      textStyle: { color: '#fff' },
      axisPointer: { type: 'line', lineStyle: { color: NEON_GREEN, type: 'dashed' } },
    },
    grid: { top: 20, bottom: 20, left: 10, right: 10, containLabel: true },
    xAxis: {
      type: 'time',
      axisLabel: { color: '#888', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      name: 'Kg',
      nameTextStyle: { color: '#888', padding: [0, 0, 0, -30] },
      axisLabel: { color: '#888', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)', type: 'dashed' } },
      scale: true,
    },
    series: [
      {
        name: 'Peso Promedio',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#000',
          borderColor: NEON_GREEN,
          borderWidth: 2,
        },
        lineStyle: {
          width: 3,
          color: NEON_GREEN, // Verde Neón
          shadowColor: 'rgba(0, 227, 150, 0.5)', // Sombra brillante (Glow Effect)
          shadowBlur: 15,
          shadowOffsetY: 5,
        },
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 227, 150, 0.4)' }, // Gradiente verde
            { offset: 1, color: 'rgba(0, 227, 150, 0.0)' },
          ]),
        },
        data: data,
      },
    ],
  }
})
</script>

<style scoped>
.chart-container {
  /* Fondo Glassmorphism más oscuro y pro */
  background: rgba(15, 15, 20, 0.6);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  height: 100%;
}
.chart {
  height: 320px;
}
</style>
