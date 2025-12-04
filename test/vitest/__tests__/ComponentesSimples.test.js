import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest'

// Importamos los componentes
import HoloStat from 'src/components/dashboard/HoloStat.vue'
import EssentialLink from 'src/components/EssentialLink.vue'

installQuasarPlugin()

describe('Componentes UI Simples (Requisito Guía)', () => {
  // 1. Test para HoloStat.vue
  it('HoloStat: Renderiza título, valor y tendencia correctamente', () => {
    const wrapper = mount(HoloStat, {
      props: {
        title: 'Ganancia Mensual',
        value: '500',
        unit: 'kg',
        trend: 15, // Positivo
      },
    })

    expect(wrapper.text()).toContain('Ganancia Mensual')
    expect(wrapper.text()).toContain('500')
    expect(wrapper.text()).toContain('kg')

    // Verificar clase positiva por el trend > 0
    expect(wrapper.find('.text-positive').exists()).toBe(true)
  })

  // 2. Test para EssentialLink.vue
  it('EssentialLink: Renderiza enlace y texto', () => {
    const wrapper = mount(EssentialLink, {
      props: {
        title: 'Documentación',
        caption: 'Ver manual',
        link: 'https://google.com',
        icon: 'school',
      },
    })

    expect(wrapper.text()).toContain('Documentación')
    expect(wrapper.text()).toContain('Ver manual')
    expect(wrapper.attributes('href')).toBe('https://google.com')
    expect(wrapper.find('.q-icon').exists()).toBe(true)
  })
})
