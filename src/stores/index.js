import { store } from 'quasar/wrappers'
import { createPinia } from 'pinia'

export default store((/* { ssrContext } */) => {
  const pinia = createPinia()
  // Quasar maneja el plugin de persistencia a través del boot file
  return pinia
})
