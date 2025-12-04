import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InventarioCard from 'src/components/despensa/InventarioCard.vue'
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest'

installQuasarPlugin()

describe('InventarioCard.vue - Alertas de Stock', () => {
  it('Muestra alerta de "Agotado" (Rojo) cuando stock es 0', () => {
    const itemAgotado = {
      id: 1, nombre: 'Maíz', categoria: 'Alimento',
      stock_actual: 0, stock_minimo_alerta: 10, unidad: 'kg', precio_unitario: 100
    }
    const wrapper = mount(InventarioCard, { props: { item: itemAgotado } })

    expect(wrapper.text()).toContain('Agotado')
    // Verifica que se aplique la clase de color negativo (rojo)
    expect(wrapper.find('.text-negative').exists()).toBe(true)
  })

  it('Muestra alerta de "Stock Crítico" (Amarillo) cuando está bajo el mínimo', () => {
    const itemCritico = {
      id: 2, nombre: 'Vacuna Aftosa', categoria: 'Vacuna',
      stock_actual: 5, stock_minimo_alerta: 10, unidad: 'dosis', precio_unitario: 500
    }
    const wrapper = mount(InventarioCard, { props: { item: itemCritico } })

    expect(wrapper.text()).toContain('Stock Crítico')
    // Verifica que se aplique la clase de advertencia (amarillo/warning)
    expect(wrapper.find('.text-warning').exists()).toBe(true)
  })

  it('Muestra "Stock Óptimo" (Verde) cuando hay suficiente', () => {
    const itemOptimo = {
      id: 3, nombre: 'Fardo Alfa', categoria: 'Alimento',
      stock_actual: 50, stock_minimo_alerta: 10, unidad: 'unidad', precio_unitario: 2000
    }
    const wrapper = mount(InventarioCard, { props: { item: itemOptimo } })

    expect(wrapper.text()).toContain('Stock Óptimo')
    // Verifica que se aplique la clase positiva (verde)
    expect(wrapper.find('.text-positive').exists()).toBe(true)
  })
})
