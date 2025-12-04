import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EssentialLink from 'src/components/EssentialLink.vue'
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest'

installQuasarPlugin()

describe('EssentialLink.vue - Navegación UI', () => {
  it('Renderiza correctamente el título y el icono', () => {
    const wrapper = mount(EssentialLink, {
      props: {
        title: 'Mis Lotes',
        caption: 'Gestión de ganado',
        link: '/lotes',
        icon: 'pets',
      },
    })

    // Verificar que el texto principal se muestra
    expect(wrapper.text()).toContain('Mis Lotes')
    // Verificar que la descripción se muestra
    expect(wrapper.text()).toContain('Gestión de ganado')
    // Verificar que el icono de Quasar se renderiza
    expect(wrapper.find('.q-icon').exists()).toBe(true)
    expect(wrapper.html()).toContain('pets')
  })

  it('Tiene el enlace correcto', () => {
    const wrapper = mount(EssentialLink, {
      props: {
        title: 'Google',
        link: 'https://google.com',
      },
    })

    // Verificar que el atributo href sea correcto
    expect(wrapper.attributes('href')).toBe('https://google.com')
  })
})
