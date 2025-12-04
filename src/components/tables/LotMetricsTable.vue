<template>
  <q-card flat class="bg-transparent">
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      dark
      flat
      bordered
      class="metrics-table"
      :pagination="{ rowsPerPage: 10 }"
    >
      <!-- Header: Solo Título y Búsqueda -->
      <template v-slot:top>
        <div class="text-h6 text-white">Rendimiento por Lote</div>
        <q-space />
        <q-input
          borderless
          dense
          debounce="300"
          v-model="filter"
          placeholder="Buscar lote..."
          dark
          class="search-input"
        >
          <template v-slot:append>
            <q-icon name="search" color="grey-5" />
          </template>
        </q-input>
      </template>

      <!-- Slot GDPV -->
      <template v-slot:body-cell-gdpv="props">
        <q-td :props="props">
          <q-chip
            :color="getGdpvColor(props.value)"
            text-color="white"
            dense
            class="text-weight-bold"
          >
            {{ props.value }} kg/día
          </q-chip>
        </q-td>
      </template>

      <!-- Slot Peso -->
      <template v-slot:body-cell-peso="props">
        <q-td :props="props" class="text-weight-medium"> {{ props.value }} kg </q-td>
      </template>
    </q-table>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from 'stores/data-store'
import { date } from 'quasar' // <--- Importación agregada para corregir el error

const dataStore = useDataStore()
const filter = ref('')

const columns = [
  {
    name: 'identificacion',
    label: 'Lote / ID',
    field: 'identificacion',
    sortable: true,
    align: 'left',
  },
  { name: 'animales', label: 'Cabezas', field: 'animales', sortable: true, align: 'center' },
  { name: 'categoria', label: 'Categoría', field: 'categoria', sortable: true, align: 'left' },
  { name: 'peso', label: 'Último Peso', field: 'peso', sortable: true, align: 'right' },
  { name: 'fecha_peso', label: 'Fecha', field: 'fecha_peso', sortable: true, align: 'right' },
  { name: 'gdpv', label: 'G.D.P.V.', field: 'gdpv', sortable: true, align: 'right' },
]

// Exponemos las 'rows' para que el padre (ReportesPage) las pueda leer para el PDF
const rows = computed(() => {
  return dataStore.lotes.map((lote) => {
    const evs = dataStore.evaluaciones
      .filter((e) => e.lote_id === lote.id)
      .sort((a, b) => new Date(b.fecha_evaluacion) - new Date(a.fecha_evaluacion))

    const ultimaEv = evs[0]

    let gdpvCalc = '-'
    if (evs.length >= 2) {
      gdpvCalc = dataStore.getGDPV ? dataStore.getGDPV(evs) : calcularGDPVManual(evs[1], evs[0])
    }

    return {
      id: lote.id,
      identificacion: lote.identificacion || 'Sin ID',
      animales: lote.cantidad_animales || 0,
      categoria: lote.objetivo || 'General',
      peso: ultimaEv ? parseFloat(ultimaEv.peso_promedio_kg).toFixed(1) : '-',
      fecha_peso: ultimaEv ? formatearFecha(ultimaEv.fecha_evaluacion) : '-',
      gdpv: gdpvCalc,
    }
  })
})
defineExpose({ rows, columns })

function calcularGDPVManual(evAnterior, evActual) {
  const dias = date.getDateDiff(evActual.fecha_evaluacion, evAnterior.fecha_evaluacion, 'days')
  if (dias <= 0) return 0
  const ganancia = evActual.peso_promedio_kg - evAnterior.peso_promedio_kg
  return (ganancia / dias).toFixed(3)
}

function getGdpvColor(gdpv) {
  if (gdpv === '-') return 'grey-8'
  const val = parseFloat(gdpv)
  if (val < 0.3) return 'red-9'
  if (val < 0.6) return 'orange-8'
  return 'green-6'
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return '-'
  const d = new Date(fechaISO + 'T00:00:00')
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}
</script>

<style lang="scss" scoped>
.metrics-table {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(5px);

  :deep(thead tr:first-child th) {
    background-color: rgba(0, 0, 0, 0.5);
    font-weight: 700;
    text-transform: uppercase;
    color: #00e396;
    border-bottom: 1px solid rgba(0, 227, 150, 0.3);
  }
}

.search-input {
  width: 250px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 0 8px;
}
</style>
