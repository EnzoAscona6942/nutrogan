<template>
  <div>
    <apexchart
      v-if="series[0].data.length > 0"
      type="line"
      height="400"
      :options="chartOptions"
      :series="series"
    />
    <div v-if="series[0].data.length < 2" class="text-center text-grey-4 q-pa-md">
      <q-icon name="warning" size="md" />
      <div>No hay suficientes datos (se necesitan 2+ evaluaciones) para generar un gráfico.</div>
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
})

const series = computed(() => {
  const evs = [...props.evaluaciones].sort(
    (a, b) => new Date(a.fecha_evaluacion) - new Date(b.fecha_evaluacion),
  )

  if (evs.length < 2) {
    return [{ data: [] }, { data: [] }]
  }

  const pesoData = []
  const gdpvData = []

  for (let i = 0; i < evs.length; i++) {
    const ev = evs[i]
    // Ajuste UTC para fechas
    const timestamp = new Date(ev.fecha_evaluacion + 'T00:00:00-03:00').getTime()

    pesoData.push([timestamp, parseFloat(ev.peso_promedio_kg)])

    if (i > 0) {
      const evAnterior = evs[i - 1]
      const pesoActual = parseFloat(ev.peso_promedio_kg)
      const pesoAnterior = parseFloat(evAnterior.peso_promedio_kg)

      const fechaActual = new Date(ev.fecha_evaluacion)
      const fechaAnterior = new Date(evAnterior.fecha_evaluacion)
      const diffTime = Math.abs(fechaActual - fechaAnterior)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      let gdpv = 0
      if (diffDays > 0) {
        gdpv = (pesoActual - pesoAnterior) / diffDays
      }
      gdpvData.push([timestamp, parseFloat(gdpv.toFixed(3))])
    } else {
      gdpvData.push([timestamp, 0]) // GDPV es 0 en la primera evaluación
    }
  }

  return [
    {
      name: 'Peso Promedio (kg)',
      type: 'line',
      data: pesoData,
    },
    {
      name: 'GDPV (kg/día)',
      type: 'bar', // Cambiado a 'bar' para mejor visualización
      data: gdpvData,
    },
  ]
})

const chartOptions = computed(() => ({
  chart: {
    height: 400,
    type: 'line',
    stacked: false,
    foreColor: '#AEB9C4', // Color de texto claro
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        reset: true,
      },
    },
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
    mode: 'dark', // ¡¡TEMA OSCURO!!
    palette: 'palette2', // Una paleta de colores vibrante
  },
  colors: ['#00E396', '#FEB019'], // Verde para peso, Naranja para GDPV
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: [4, 1], // Línea de peso más gruesa, barras más sutiles
    curve: 'smooth',
  },
  title: {
    text: undefined, // El título ya está en la página
    align: 'left',
  },
  grid: {
    borderColor: 'rgba(255, 255, 255, 0.1)', // Líneas de la cuadrícula
    row: {
      colors: ['transparent', 'transparent'],
    },
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: true } },
  },
  xaxis: {
    type: 'datetime',
    labels: {
      datetimeUTC: false,
      format: 'dd MMM yy',
    },
  },
  yaxis: [
    {
      seriesName: 'Peso Promedio (kg)',
      axisTicks: { show: true },
      axisBorder: { show: true },
      title: {
        text: 'Peso Promedio (kg)',
      },
    },
    {
      seriesName: 'GDPV (kg/día)',
      opposite: true,
      axisTicks: { show: true },
      axisBorder: { show: true },
      title: {
        text: 'GDPV (kg/día)',
      },
    },
  ],
  tooltip: {
    theme: 'dark', // Tooltip oscuro
    x: {
      format: 'dd MMM yyyy',
    },
    shared: true,
    intersect: false,
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left',
    labels: { colors: '#FFFFFF' },
  },
  fill: {
    type: ['gradient', 'solid'], // Gradiente para la línea de peso
    gradient: {
      shade: 'dark',
      type: 'vertical',
      shadeIntensity: 0.5,
      gradientToColors: ['#00E396'], // Color del gradiente
      inverseColors: false,
      opacityFrom: 0.7,
      opacityTo: 0.3,
      stops: [0, 100],
    },
  },
}))
</script>
