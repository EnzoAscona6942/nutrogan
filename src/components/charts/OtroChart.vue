<template>
  <div>
    <apexchart
      v-if="series[0].data.length > 0"
      type="line"
      height="400"
      :options="chartOptions"
      :series="series"
    />
    <div v-if="series[0].data.length < 1" class="text-center text-grey-4 q-pa-md">
      <q-icon name="warning" size="md" />
      <div>No hay suficientes datos (se necesita 1+ evaluación) para generar un gráfico.</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  evaluaciones: {
    type: Array,
    required: true,
  },
  eventosReproductivos: {
    type: Array,
    required: true,
  },
})

// Función helper para los colores de eventos
function getEventoColor(tipo) {
  if (tipo.includes('Preñada')) return '#00E396' // Verde
  if (tipo.includes('Vacía')) return '#FF4560' // Rojo
  if (tipo.includes('Parto')) return '#008FFB' // Azul
  if (tipo.includes('Aborto')) return '#FEB019' // Naranja
  return '#775DD0' // Violeta (Servicio)
}

const series = computed(() => {
  const evs = [...props.evaluaciones].sort(
    (a, b) => new Date(a.fecha_evaluacion) - new Date(b.fecha_evaluacion),
  )

  if (evs.length === 0) {
    return [{ data: [] }, { data: [] }]
  }

  const ccData = evs.map((ev) => [
    new Date(ev.fecha_evaluacion + 'T00:00:00-03:00').getTime(),
    parseFloat(ev.condicion_corporal),
  ])

  // Colocar los eventos en el gráfico
  const eventoData = props.eventosReproductivos.map((evento) => ({
    x: new Date(evento.fecha + 'T00:00:00-03:00').getTime(),
    y: 1.5, // Posición Y fija
    tipo_evento: evento.tipo_evento,
    color: getEventoColor(evento.tipo_evento),
  }))

  return [
    {
      name: 'Condición Corporal (CC)',
      type: 'line',
      data: ccData,
    },
    {
      name: 'Eventos Reproductivos',
      type: 'scatter',
      data: eventoData,
    },
  ]
})

const chartOptions = computed(() => ({
  chart: {
    height: 400,
    type: 'line',
    foreColor: '#AEB9C4', // Texto claro
    toolbar: { show: true },
    locales: [
      {
        name: 'es',
        options: {
          /* ... (Opciones de idioma español) ... */
        },
      },
    ],
    defaultLocale: 'es',
  },
  theme: {
    mode: 'dark', // ¡TEMA OSCURO!
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: [4, 0],
    curve: 'smooth',
  },
  colors: ['#FF4560'], // Color Rosa/Rojo para la línea de CC
  title: {
    text: 'Análisis de Lote (Reproductores/Otro): CC vs. Eventos', // Título específico
    align: 'left',
    style: {
      color: '#FFFFFF',
    },
  },
  grid: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  markers: {
    size: 0,
    strokeWidth: 0,
    hover: {
      size: 9,
    },
    // Colores dinámicos para los puntos de evento
    discrete: series.value[1].data.map((dataPoint, index) => ({
      seriesIndex: 1,
      dataPointIndex: index,
      fillColor: dataPoint.color,
      strokeColor: '#fff',
      size: 8,
    })),
  },
  xaxis: {
    type: 'datetime',
    labels: {
      datetimeUTC: false,
      format: 'dd MMM yy',
    },
  },
  yaxis: {
    title: {
      text: 'Condición Corporal (CC)',
    },
    min: 1,
    max: 9, // Rango fijo de CC
  },
  tooltip: {
    theme: 'dark',
    x: {
      format: 'dd MMM yyyy',
    },
    shared: false,
    intersect: true,
    custom: function ({ seriesIndex, dataPointIndex, w }) {
      if (seriesIndex === 0) {
        const val = w.globals.series[seriesIndex][dataPointIndex]
        return `
          <div class="apexcharts-tooltip-series-group" style="padding: 5px 10px;">
            <span class="apexcharts-tooltip-marker" style="background-color: ${w.globals.colors[0]};"></span>
            CC: <span style="font-weight: bold">${val}</span>
          </div>
        `
      }
      if (seriesIndex === 1) {
        const dataPoint = w.config.series[1].data[dataPointIndex]
        return `
          <div class="apexcharts-tooltip-series-group" style="padding: 5px 10px;">
            <span class="apexcharts-tooltip-marker" style="background-color: ${dataPoint.color};"></span>
            Evento: <span style="font-weight: bold">${dataPoint.tipo_evento}</span>
          </div>
        `
      }
      return ''
    },
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left',
    labels: { colors: '#FFFFFF' },
  },
}))
</script>
