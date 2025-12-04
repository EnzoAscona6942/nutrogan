import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDataStore } from 'src/stores/data-store'

describe('DataStore - Lógica Financiera (GDPV)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Calcula correctamente la ganancia de peso positiva', () => {
    const store = useDataStore()
    // Caso Real: Animal sube 15kg en 30 días
    const evaluaciones = [
      { fecha_evaluacion: '2025-01-01', peso_promedio_kg: 200 },
      { fecha_evaluacion: '2025-01-31', peso_promedio_kg: 215 }
    ]
    // 15kg / 30 días = 0.500 kg/día
    expect(store.getGDPV(evaluaciones)).toBe('0.500')
  })

  it('Detecta pérdida de peso (Alerta Nutricional)', () => {
    const store = useDataStore()
    // Caso Real: Animal baja 10kg en 10 días (Crisis)
    const evaluaciones = [
      { fecha_evaluacion: '2025-02-01', peso_promedio_kg: 300 },
      { fecha_evaluacion: '2025-02-11', peso_promedio_kg: 290 }
    ]
    // -10kg / 10 días = -1.000 kg/día
    expect(store.getGDPV(evaluaciones)).toBe('-1.000')
  })

  it('Ordena cronológicamente antes de calcular', () => {
    const store = useDataStore()
    // Caso Real: Datos cargados en desorden por error humano
    const evaluacionesDesordenadas = [
      { fecha_evaluacion: '2025-03-31', peso_promedio_kg: 250 }, // Fecha posterior primero
      { fecha_evaluacion: '2025-03-01', peso_promedio_kg: 200 }  // Fecha anterior después
    ]
    // Debería ordenarlas internamente y dar positivo: (250-200)/30 = 1.667
    expect(store.getGDPV(evaluacionesDesordenadas)).toBe('1.667')
  })

  it('Maneja falta de datos (devuelve 0 si no hay historial)', () => {
    const store = useDataStore()
    expect(store.getGDPV([])).toBe(0)
    expect(store.getGDPV([{ peso_promedio_kg: 200 }])).toBe(0)
  })
})
