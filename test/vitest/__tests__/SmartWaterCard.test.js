import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SmartWaterCard from 'src/components/agua/SmartWaterCard.vue'
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest'
import { createTestingPinia } from '@pinia/testing'
import { useDataStore } from 'src/stores/data-store'

// 1. Mockeamos useQuasar para que tenga la función notify
vi.mock('quasar', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useQuasar: () => ({
      notify: vi.fn(), // Simulamos la función para que no falle
    }),
  }
})

installQuasarPlugin()

describe('SmartWaterCard.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('Renderiza estado PELIGRO y tipo BEBEDERO correctamente', () => {
    const wrapper = mount(SmartWaterCard, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] },
      props: {
        fuente: {
          id: 1,
          nombre: 'Bebedero Norte',
          tipo: 'Bebedero',
          ultimo_estado: 'Peligro',
          analisis_de_agua: [{ fecha_analisis: '2025-01-01', ph: 9, solidos_totales: 5000 }],
        },
      },
    })
    expect(wrapper.text()).toContain('Peligro')
    expect(wrapper.find('.bg-negative').exists()).toBe(true)
    expect(wrapper.find('.mdi-water-pump').exists()).toBe(true)
  })

  it('Maneja casos DEFAULT (Sin datos / Tipo desconocido)', () => {
    const wrapper = mount(SmartWaterCard, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] },
      props: {
        fuente: {
          id: 2,
          nombre: 'Fuente X',
          tipo: 'Desconocido',
          ultimo_estado: null,
          analisis_de_agua: [],
        },
      },
    })
    expect(wrapper.text()).toContain('Sin Datos')
    expect(wrapper.text()).toContain('Sin análisis')
    expect(wrapper.find('.mdi-water').exists()).toBe(true)
  })

  it('Ejecuta simulación de SENSOR correctamente (Éxito)', async () => {
    const wrapper = mount(SmartWaterCard, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
      props: {
        fuente: {
          id: 3,
          nombre: 'Tanque Smart',
          tipo: 'Tanque',
          es_inteligente: true,
          analisis_de_agua: [],
        },
      },
    })

    const store = useDataStore()
    store.agregarAnalisisDeAgua = vi.fn().mockResolvedValue(true)

    // Disparar acción
    const btnSensor = wrapper.findAll('.q-btn').find((b) => b.text().includes('Sincronizar'))
    await btnSensor.trigger('click')

    // Avanzar el tiempo
    await vi.advanceTimersByTimeAsync(1500)

    // Validar
    expect(store.agregarAnalisisDeAgua).toHaveBeenCalled()
    expect(wrapper.vm.loadingSensor).toBe(false)
  })

  it('Maneja ERRORES en la simulación de sensor', async () => {
    const wrapper = mount(SmartWaterCard, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
      props: {
        fuente: { id: 4, nombre: 'Tanque Error', tipo: 'Tanque', es_inteligente: true },
      },
    })

    const store = useDataStore()
    store.agregarAnalisisDeAgua = vi.fn().mockRejectedValue(new Error('Fallo de red'))

    const btnSensor = wrapper.findAll('.q-btn').find((b) => b.text().includes('Sincronizar'))
    await btnSensor.trigger('click')

    await vi.advanceTimersByTimeAsync(1500)

    // Si el loading se apaga, significa que el catch funcionó y no rompió la app
    expect(wrapper.vm.loadingSensor).toBe(false)
  })

  it('Ejecuta simulación de SENTINEL (Represa)', async () => {
    const wrapper = mount(SmartWaterCard, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] },
      props: {
        fuente: { id: 5, nombre: 'Laguna', tipo: 'Represa', es_inteligente: false },
      },
    })

    const btnSentinel = wrapper.findAll('.q-btn').find((b) => b.text().includes('Analizar Nivel'))
    await btnSentinel.trigger('click')

    expect(wrapper.vm.loadingSentinel).toBe(true)

    await vi.advanceTimersByTimeAsync(2500)

    expect(wrapper.vm.loadingSentinel).toBe(false)
  })
})
