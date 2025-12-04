// Archivo: src/boot/echarts.js
import { boot } from 'quasar/wrappers'
import ECharts from 'vue-echarts'
import { use } from 'echarts/core'

// Importa los componentes de ECharts que vayas a necesitar
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  DataZoomComponent,
} from 'echarts/components'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  DataZoomComponent,
])

export default boot(({ app }) => {
  // Registra ECharts globalmente
  app.component('v-chart', ECharts)
})
