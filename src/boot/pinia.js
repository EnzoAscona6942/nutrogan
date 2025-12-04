// Archivo: src/boot/pinia.js
// CÓDIGO FINAL (Arregla el error "app.use()" y "Symbol(pinia)")
import { boot } from 'quasar/wrappers'

export default boot(() => {
  // Quasar ya maneja la instalación de Pinia.
  // Dejamos este archivo vacío a propósito para que no interfiera
  // y para que Quasar sepa que ya no debe usar el plugin de persistencia.
})
