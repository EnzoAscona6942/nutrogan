<template>
  <div class="chart-container">
    <div class="chart-header row items-center q-pb-sm">
      <!-- Ícono: Cambiamos a 'cyan-4' o 'blue-5' (azul eléctrico) -->
      <q-icon name="health_and_safety" color="cyan-4" size="sm" class="q-mr-sm" />
      <div class="text-h6 text-white">Salud del Rodeo (CC)</div>
    </div>
    <v-chart ref="vchartRef" class="chart" :option="option" autoresize />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useDataStore } from 'stores/data-store'
import { use, graphic } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, TitleComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, TitleComponent])

const dataStore = useDataStore()
const vchartRef = ref(null)
defineExpose({ vchartRef })

const option = computed(() => {
  let counts = { 'Baja (<3)': 0, 'Media (3-5)': 0, 'Óptima (>5)': 0 }

  dataStore.evaluaciones.forEach((ev) => {
    const cc = parseFloat(ev.condicion_corporal || 0)
    if (cc > 0 && cc < 3) counts['Baja (<3)']++
    else if (cc >= 3 && cc <= 5) counts['Media (3-5)']++
    else if (cc > 5) counts['Óptima (>5)']++
  })

  const categories = Object.keys(counts)
  const values = Object.values(counts)

  // Paleta Nutrogan Pro (Semáforo Ajustado):
  // 1. Baja (Peligro)
  // 2. Media (Advertencia/Neutro - usamos Azul/Cian para variar del naranja)
  // 3. Óptima (Éxito - Verde Neón)

  // Colores iniciales
  const colorsStart = [
    '#FF4560', // Rojo (Peligro)
    '#00FFFF', // Cian (Media - Azul/Turquesa Eléctrico)
    '#00E396', // Verde Neón (Óptima)
  ]
  // Colores finales (para el degradado)
  const colorsEnd = [
    '#D63045', // Rojo Oscuro
    '#00AABB', // Cian Oscuro
    '#00B575', // Verde Oscuro
  ]

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(20, 20, 30, 0.9)',
      borderColor: '#00E396', // Usamos Verde Neón para el borde general
      textStyle: { color: '#fff' },
    },
    grid: { top: 20, bottom: 20, left: 10, right: 10, containLabel: true },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { color: '#BBB', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: values,
        barWidth: '40%',
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: (params) => {
            // Aplicar degradado
            return new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colorsStart[params.dataIndex] },
              { offset: 1, color: colorsEnd[params.dataIndex] },
            ])
          },
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowBlur: 5,
        },
        label: {
          show: true,
          position: 'top',
          color: '#fff',
          fontSize: 12,
          fontWeight: 'bold',
        },
      },
    ],
  }
})
</script>

<style scoped>
.chart-container {
  background: rgba(15, 15, 20, 0.6);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(0, 255, 59, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  height: 100%;
}
.chart {
  height: 320px;
}
</style>
