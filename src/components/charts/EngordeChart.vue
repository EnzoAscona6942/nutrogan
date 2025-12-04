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
      gdpvData.push([timestamp, 0])
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
      type: 'bar',
      data: gdpvData,
    },
  ]
})

const chartOptions = computed(() => ({
  chart: {
    height: 400,
    type: 'line',
    stacked: false,
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
    palette: 'palette4', // Paleta de colores diferente
  },
  colors: ['#008FFB', '#00E396'], // Azul para peso, Verde para GDPV
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: [4, 1],
    curve: 'smooth',
  },
  title: {
    text: 'Evolución de Lote (Engorde): Peso vs. GDPV', // Título específico
    align: 'left',
    style: {
      color: '#FFFFFF',
    },
  },
  grid: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    theme: 'dark',
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
    type: ['gradient', 'solid'],
    gradient: {
      shade: 'dark',
      type: 'vertical',
      shadeIntensity: 0.5,
      gradientToColors: ['#008FFB'],
      inverseColors: false,
      opacityFrom: 0.7,
      opacityTo: 0.3,
      stops: [0, 100],
    },
  },
}))
</script>
