{ type: uploaded file fileName: src/pages/ReportesPage.vue fullContent:
<template>
  <q-page padding class="dashboard-pro-bg text-white">
    <div class="page-title-box">Reportes y Analítica</div>

    <q-card flat bordered class="q-mb-md filter-card">
      <q-card-section class="row items-center justify-between q-py-sm">
        <div class="text-subtitle1 text-grey-4">Inteligencia Artificial y Métricas Avanzadas</div>

        <q-btn
          class="btn-pro-glow"
          icon="picture_as_pdf"
          label="Descargar Informe Ejecutivo"
          @click="exportarPDFMaestro"
          :loading="pdfLoading"
          no-caps
        />
      </q-card-section>
    </q-card>

    <div class="row q-mb-lg">
      <div class="col-12">
        <GlobalAiReport ref="aiReportRef" id="print-ai-section" />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-8">
        <q-card flat class="bg-dark-card q-pa-none" id="print-chart-1">
          <ChartEficiencia ref="chartEficienciaRef" />
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card flat class="bg-dark-card q-pa-none" id="print-chart-2">
          <ChartSalud ref="chartSaludRef" />
        </q-card>
      </div>
    </div>

    <div class="q-mt-lg">
      <q-card flat class="kpi-card-table">
        <q-tabs
          v-model="tab"
          dense
          class="text-grey-4"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="general" label="Métricas por Lote (Detalle)" icon="table_view" />
        </q-tabs>
        <q-separator dark />
        <q-tab-panels v-model="tab" animated class="bg-transparent">
          <q-tab-panel name="general" class="q-pa-none">
            <LotMetricsTable ref="lotMetricsTableRef" />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDataStore } from 'stores/data-store'
import { useQuasar } from 'quasar'
// IMPORTANTE: Importamos GState explícitamente
import { jsPDF, GState } from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'

import GlobalAiReport from 'components/charts/GlobalAiReport.vue'
import ChartEficiencia from 'components/charts/ChartEficiencia.vue'
import ChartSalud from 'components/charts/ChartSalud.vue'
import LotMetricsTable from 'components/tables/LotMetricsTable.vue'

import reportBg from 'src/assets/report/report-bg.png'

const dataStore = useDataStore()
const $q = useQuasar()
const tab = ref('general')
const pdfLoading = ref(false)

const aiReportRef = ref(null)
const chartEficienciaRef = ref(null)
const chartSaludRef = ref(null)
const lotMetricsTableRef = ref(null)

onMounted(async () => {
  await dataStore.fetchAll()
  await Promise.all([dataStore.fetchAllEvaluaciones(), dataStore.fetchAllEventosSanitarios()])
  if (!dataStore.clima.current) {
    await dataStore.fetchClima()
  }
})

// --- CONSTANTES DE ESTILO Y DIMENSIONES PARA PDF ---
const PDF_SCALE = 2.5
const CHART_BORDER_COLOR = [255, 255, 255, 0.2]

function updateChartTheme(chartRef, isPrint) {
  const instance = chartRef?.value?.vchartRef
  if (!instance) return

  const color = '#ffffff'
  const axisColor = isPrint ? '#cccccc' : '#999999'

  instance.resize()

  instance.setOption({
    // Fondo transparente para que html2canvas capture solo las líneas/barras
    backgroundColor: 'rgba(0,0,0,0)',
    title: { textStyle: { color: color, fontSize: 16 } },
    legend: { textStyle: { color: color } },
    xAxis: { axisLabel: { color: axisColor }, axisLine: { lineStyle: { color: axisColor } } },
    yAxis: {
      axisLabel: { color: axisColor },
      nameTextStyle: { color: axisColor },
      splitLine: {
        lineStyle: { color: isPrint ? 'rgba(51, 51, 51, 0.8)' : 'rgba(68, 68, 68, 0.8)' },
      },
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      containLabel: true,
    },
  })
}

async function exportarPDFMaestro() {
  pdfLoading.value = true
  const notify = $q.notify({
    type: 'ongoing',
    message: 'Generando Informe, esto puede tomar unos segundos...',
    timeout: 0,
  })

  try {
    updateChartTheme(chartEficienciaRef, true)
    updateChartTheme(chartSaludRef, true)

    await new Promise((r) => setTimeout(r, 800))

    const doc = new jsPDF('p', 'pt', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 50
    const contentWidth = pageWidth - margin * 2
    const SAFE_BOTTOM_MARGIN = pageHeight - margin - 60

    function setupPage(pageNum) {
      try {
        doc.addImage(reportBg, 'PNG', 0, 0, pageWidth, pageHeight)
      } catch (e) {
        console.error('Error al añadir imagen de fondo:', e)
      }
      doc.setFontSize(10)

      // 1. CAMBIAMOS A AZUL ELÉCTRICO SOLO PARA EL NÚMERO DE PÁGINA
      doc.setTextColor(43, 76, 248)
      doc.text(`Pág. ${pageNum}`, pageWidth - margin, pageHeight - 40, { align: 'right' })

      // 2. RESTAURAMOS A NEGRO PARA EL RESTO DEL CONTENIDO
      // (Así el título, fecha y otros textos siguen saliendo en negro como antes)
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.setFont(undefined, 'normal')
    }

    let currentPage = 1
    setupPage(currentPage)

    const originalAddPage = doc.addPage
    doc.addPage = function () {
      originalAddPage.call(this)
      currentPage++
      setupPage(currentPage)
    }

    function checkPageBreak(requiredHeight, currentY) {
      if (currentY + requiredHeight > SAFE_BOTTOM_MARGIN) {
        doc.addPage()
        return margin + 20
      }
      return currentY
    }

    let y = margin + 20

    doc.setFontSize(22)
    doc.setFont(undefined, 'bold')
    doc.text('Informe Ejecutivo de Situación', margin, y)
    y += 35

    doc.setFontSize(11)
    doc.setFont(undefined, 'normal')
    const fechaEmision = `Fecha de emisión: ${new Date().toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`
    doc.text(fechaEmision, margin, y)
    y += 15

    doc.setDrawColor(255, 255, 255, 0.6)
    doc.setLineWidth(1)
    doc.line(margin, y, pageWidth - margin, y)
    y += 45

    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.text('Análisis Operativo Global', margin, y)
    y += 25

    const aiContent = aiReportRef.value?.rawReportText || []

    if (aiContent.length > 0) {
      for (const section of aiContent) {
        const estimatedHeight = 40 + section.content.length / 3
        y = checkPageBreak(estimatedHeight, y)

        doc.setFontSize(14)
        doc.setFont(undefined, 'bold')
        doc.text(section.title, margin, y)
        y += 20

        doc.setFontSize(12)
        doc.setFont(undefined, 'normal')

        const lines = doc.splitTextToSize(section.content, contentWidth)
        for (let i = 0; i < lines.length; i++) {
          y = checkPageBreak(15, y)
          doc.text(lines[i], margin, y)
          y += 15
        }
        y += 15
      }
    } else {
      doc.setFontSize(12)
      doc.setFont(undefined, 'italic')
      doc.text('Informe de IA no disponible.', margin, y)
      y += 20
    }

    doc.addPage()
    y = margin + 20

    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.text('Métricas Clave', margin, y)
    y += 25

    const chartElements = [
      { ref: chartEficienciaRef, id: 'print-chart-1', title: 'Evolución de Peso' },
      { ref: chartSaludRef, id: 'print-chart-2', title: 'Salud del Rodeo' },
    ]

    for (const chart of chartElements) {
      if (chart !== chartElements[0]) {
        doc.addPage()
        y = margin + 20
        doc.setFontSize(16)
        doc.setFont(undefined, 'bold')
        doc.text(`Métricas Clave: ${chart.title}`, margin, y)
        y += 25
      } else {
        doc.setFontSize(14)
        doc.setFont(undefined, 'bold')
        doc.text(chart.title, margin, y)
        y += 20
      }

      const el = document.querySelector(`#${chart.id} .chart-container`)

      if (el) {
        const CAPTURE_WIDTH_PT = contentWidth
        const originalStyle = el.getAttribute('style') || ''

        el.style.width = CAPTURE_WIDTH_PT + 'pt'
        el.style.backgroundColor = 'rgba(0,0,0,0)'
        el.style.borderRadius = '16px'

        await new Promise((r) => setTimeout(r, 300))

        const canvas = await html2canvas(el, {
          backgroundColor: null,
          scale: PDF_SCALE,
          useCORS: true,
        })

        el.setAttribute('style', originalStyle)

        const imgData = canvas.toDataURL('image/png', 1.0)
        const imageHeight = (canvas.height * CAPTURE_WIDTH_PT) / canvas.width

        // --- FONDO SEMI-TRANSPARENTE (75% OPACIDAD) ---
        doc.saveGraphicsState()
        doc.setGState(new GState({ opacity: 0.75 }))
        doc.setFillColor(15, 15, 20) // Casi negro
        doc.roundedRect(margin, y, CAPTURE_WIDTH_PT, imageHeight, 16, 16, 'F')
        doc.restoreGraphicsState()

        // Borde y Gráfico (Opacidad 100%)
        doc.setDrawColor(...CHART_BORDER_COLOR)
        doc.roundedRect(margin, y, CAPTURE_WIDTH_PT, imageHeight, 16, 16, 'S')
        doc.addImage(imgData, 'PNG', margin, y, CAPTURE_WIDTH_PT, imageHeight)

        y += imageHeight + 25
      }
    }

    doc.addPage()
    y = margin + 20

    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.text('Detalle Operativo', margin, y)
    y += 25

    try {
      const lotes = dataStore.lotes || []

      if (lotes.length === 0) {
        doc.setTextColor(255, 0, 0)
        doc.text('No hay datos de lotes disponibles', margin, y)
        doc.setTextColor(0, 0, 0)
      } else {
        const tempTable = document.createElement('div')
        tempTable.style.position = 'absolute'
        tempTable.style.left = '-9999px'
        tempTable.style.width = '800px'
        tempTable.style.backgroundColor = 'rgba(15, 15, 20, 0.85)'
        tempTable.style.padding = '20px'
        tempTable.style.fontFamily = 'Arial, sans-serif'
        tempTable.style.borderRadius = '16px'
        tempTable.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)'

        let tableHTML = `
          <table style="width:100%; border-collapse: separate; border-spacing: 0; overflow: hidden;">
            <thead style="background-color: rgba(30, 30, 40, 0.9);">
              <tr>
                <th style="padding: 10px; text-align: left; border: 1px solid rgba(255, 255, 255, 0.8); color: #ffffff; border-top-left-radius: 12px;">Lote</th>
                <th style="padding: 10px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.8); color: #ffffff;">Cabezas</th>
                <th style="padding: 10px; text-align: left; border: 1px solid rgba(255, 255, 255, 0.8); color: #ffffff;">Cat.</th>
                <th style="padding: 10px; text-align: right; border: 1px solid rgba(255, 255, 255, 0.8); color: #ffffff;">Peso (kg)</th>
                <th style="padding: 10px; text-align: right; border: 1px solid rgba(255, 255, 255, 0.8); color: #ffffff;">Fecha</th>
                <th style="padding: 10px; text-align: right; border: 1px solid rgba(255, 255, 255, 0.8); color: #ffffff; border-top-right-radius: 12px;">GDPV</th>
              </tr>
            </thead>
            <tbody>
        `

        lotes.forEach((lote, index) => {
          const evs = dataStore.evaluaciones
            .filter((e) => e.lote_id === lote.id)
            .sort((a, b) => new Date(b.fecha_evaluacion) - new Date(a.fecha_evaluacion))

          const ultimaEv = evs[0]
          let gdpvCalc = '-'
          if (evs.length >= 2) {
            const dias =
              (new Date(evs[0].fecha_evaluacion) - new Date(evs[1].fecha_evaluacion)) /
              (1000 * 60 * 60 * 24)
            if (dias > 0) {
              const ganancia = evs[0].peso_promedio_kg - evs[1].peso_promedio_kg
              gdpvCalc = (ganancia / dias).toFixed(3)
            }
          }

          const isLastRow = index === lotes.length - 1
          const bottomLeftRadius = isLastRow ? 'border-bottom-left-radius: 12px;' : ''
          const bottomRightRadius = isLastRow ? 'border-bottom-right-radius: 12px;' : ''

          tableHTML += `
            <tr>
              <td style="padding: 10px; text-align: left; border: 1px solid rgba(255, 255, 255, 0.8); color: #ffffff; ${bottomLeftRadius}">${lote.identificacion}</td>
              <td style="padding: 10px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.8); color: #ffffff;">${lote.cantidad_animales}</td>
              <td style="padding: 10px; text-align: left; border: 1px solid rgba(255, 255, 255, 0.8); color: #ffffff;">${lote.objetivo || 'Gral'}</td>
              <td style="padding: 10px; text-align: right; border: 1px solid rgba(255, 255, 255, 0.8); color: #ffffff;">${ultimaEv ? parseFloat(ultimaEv.peso_promedio_kg).toFixed(1) : '-'}</td>
              <td style="padding: 10px; text-align: right; border: 1px solid rgba(255, 255, 255, 0.8); color: #ffffff;">${ultimaEv ? new Date(ultimaEv.fecha_evaluacion).toLocaleDateString('es-AR') : '-'}</td>
              <td style="padding: 10px; text-align: right; border: 1px solid rgba(255, 255, 255, 0.8); color: #ffffff; ${bottomRightRadius}">${gdpvCalc}</td>
            </tr>
          `
        })

        tableHTML += '</tbody></table>'
        tempTable.innerHTML = tableHTML
        document.body.appendChild(tempTable)

        const tableCanvas = await html2canvas(tempTable, {
          backgroundColor: 'rgba(15, 15, 20, 0.85)',
          scale: 2,
        })

        const imgData = tableCanvas.toDataURL('image/png')
        const imgWidth = contentWidth
        const imgHeight = (tableCanvas.height * imgWidth) / tableCanvas.width

        if (y + imgHeight > pageHeight - margin - 40) {
          doc.addPage()
          y = margin + 20
        }

        doc.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight)
        document.body.removeChild(tempTable)
      }
    } catch (error) {
      console.error('Error captura tabla:', error)
      autoTable(doc, {
        startY: y + 10,
        theme: 'grid',
      })
    }

    doc.save(`Nutrogan_Informe_${new Date().toISOString().slice(0, 10)}.pdf`)
    notify({ type: 'positive', icon: 'check', message: 'Informe Descargado' })
  } catch (error) {
    console.error('Error PDF:', error)
    notify({ type: 'negative', message: 'Error crítico generando PDF.' })
  } finally {
    updateChartTheme(chartEficienciaRef, false)
    updateChartTheme(chartSaludRef, false)
    pdfLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
$primary-color: #00e396;

.text-primary-neon {
  color: $primary-color !important;
}

.dashboard-pro-bg {
  background-image: url('src/assets/nutrogan-bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
}

.page-title-box {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.filter-card {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.bg-dark-card {
  background: rgba(15, 15, 20, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.kpi-card-table {
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-pro-glow {
  background: rgba(0, 227, 150, 0.15);
  color: $primary-color;
  border: 1px solid $primary-color;
  font-weight: 700;
  border-radius: 12px;
  padding: 8px 24px;
  box-shadow: 0 0 15px rgba(0, 227, 150, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 227, 150, 0.25);
    box-shadow: 0 0 25px rgba(0, 227, 150, 0.4);
    transform: translateY(-2px);
  }
}
</style>
}
