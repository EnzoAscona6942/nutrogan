<template>
  <v-chart class="chart" :option="chartOption" autoresize />
</template>

<script setup>
import { computed } from 'vue'
import { useDataStore } from 'stores/data-store'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, ScatterChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent,
  DataZoomComponent,
  VisualMapComponent,
} from 'echarts/components'

// Registrar los componentes de ECharts
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent,
  DataZoomComponent,
  VisualMapComponent,
])

const dataStore = useDataStore()

// Colores "Pro"
const colors = {
  peso: '#00E396',
  cc: '#008FFB',
  lluvia: '#FEB019',
  ndvi: '#775DD0',
}

const chartOption = computed(() => {
  // 1. Procesar Evaluaciones (Peso y CC)
  const evaluaciones = [...dataStore.evaluaciones].sort(
    (a, b) => new Date(a.fecha_evaluacion) - new Date(b.fecha_evaluacion),
  )
  const pesoData = evaluaciones.map((ev) => [
    ev.fecha_evaluacion,
    parseFloat(ev.peso_promedio_kg || 0).toFixed(2),
  ])
  const ccData = evaluaciones.map((ev) => [
    ev.fecha_evaluacion,
    parseFloat(ev.condicion_corporal || 0).toFixed(1),
  ])

  // 2. Procesar NDVI (Promedio de potreros)
  const ndviData = dataStore.potreros
    .filter((p) => p.fecha_ultimo_ndvi)
    .map((p) => [p.fecha_ultimo_ndvi, parseFloat(p.ultimo_ndvi || 0).toFixed(3)])
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))

  // 3. Procesar Lluvias
  // ***** CORRECCIÓN AQUÍ *****
  // Antes: (dataStore.clima || []).map...
  // Ahora: (dataStore.clima?.historial || []).map...
  const lluvias = [
    ...dataStore.registrosLluvia.map((r) => ({
      fecha: r.fecha,
      mm: r.milimetros,
    })),
    ...(dataStore.clima?.historial || []).map((c) => ({
      fecha: c.fecha,
      mm: c.milimetros,
    })),
  ]
    .filter((l) => l.mm > 0)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

  const lluviaData = lluvias.map((l) => [l.fecha, l.mm])

  return {
    backgroundColor: 'transparent', // Fondo transparente
    title: {
      text: 'Análisis Integral del Establecimiento',
      subtext: 'Correlación de Métricas Clave',
      textStyle: {
        color: '#FFFFFF', // Texto de título blanco
      },
      subtextStyle: {
        color: '#AEB9C4', // Texto de subtítulo gris
      },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30, 30, 30, 0.8)', // Fondo de tooltip oscuro
      borderColor: '#555',
      textStyle: {
        color: '#FFFFFF',
      },
      axisPointer: {
        type: 'cross',
        animation: false,
        label: {
          backgroundColor: '#505765',
        },
      },
    },
    legend: {
      data: ['Peso Prom. (kg)', 'CC Prom. (1-9)', 'NDVI Prom.', 'Lluvia (mm)'],
      bottom: 0,
      textStyle: {
        color: '#AEB9C4', // Texto de leyenda gris
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%', // Más espacio para el dataZoom
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: { title: 'Guardar', backgroundColor: 'transparent' },
        restore: { title: 'Restaurar' },
        dataZoom: { title: { zoom: 'Zoom', back: 'Quitar Zoom' } },
      },
      iconStyle: {
        borderColor: '#AEB9C4', // Iconos de toolbox grises
      },
    },
    xAxis: {
      type: 'time',
      boundaryGap: false,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
      axisLabel: { color: '#AEB9C4' },
      splitLine: { show: false },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Peso (kg)',
        nameTextStyle: { color: colors.peso },
        position: 'left',
        axisLine: { show: true, lineStyle: { color: colors.peso } },
        axisLabel: { color: colors.peso },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      },
      {
        type: 'value',
        name: 'NDVI / CC',
        position: 'right',
        max: 9, // Para la CC
        min: 0,
        axisLine: { show: true, lineStyle: { color: colors.cc } },
        axisLabel: { color: colors.cc },
        splitLine: { show: false },
      },
      {
        type: 'value',
        name: 'Lluvia (mm)',
        position: 'right',
        offset: 80, // Mover más a la derecha
        axisLine: { show: true, lineStyle: { color: colors.lluvia } },
        axisLabel: { color: colors.lluvia },
        splitLine: { show: false },
      },
    ],
    dataZoom: [
      {
        type: 'slider',
        start: 50,
        end: 100,
        bottom: '30px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: '#555',
        dataBackground: {
          lineStyle: { color: '#AEB9C4' },
          areaStyle: { color: 'rgba(255, 255, 255, 0.2)' },
        },
        selectedDataBackground: {
          lineStyle: { color: colors.peso },
          areaStyle: { color: `rgba(0, 227, 150, 0.3)` },
        },
        fillerColor: 'rgba(0, 227, 150, 0.2)',
        handleStyle: { color: colors.peso },
      },
      {
        type: 'inside',
      },
    ],
    series: [
      {
        name: 'Peso Prom. (kg)',
        type: 'line',
        yAxisIndex: 0,
        smooth: true,
        showSymbol: false,
        data: pesoData,
        color: colors.peso,
        lineStyle: { width: 3 },
      },
      {
        name: 'CC Prom. (1-9)',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        showSymbol: false,
        data: ccData,
        color: colors.cc,
        lineStyle: { width: 3 },
      },
      {
        name: 'NDVI Prom.',
        type: 'scatter',
        yAxisIndex: 1,
        data: ndviData,
        symbolSize: 8,
        color: colors.ndvi,
      },
      {
        name: 'Lluvia (mm)',
        type: 'bar',
        yAxisIndex: 2,
        data: lluviaData,
        color: colors.lluvia,
        itemStyle: {
          opacity: 0.6,
        },
      },
    ],
  }
})
</script>

<style scoped>
.chart {
  height: 60vh;
}
</style>
