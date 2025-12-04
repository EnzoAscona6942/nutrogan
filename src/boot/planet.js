import { boot } from 'quasar/wrappers'
import axios from 'axios'

// Configuración de la API de Planet
const planetApiKey = process.env.VITE_PLANET_API_KEY
const planetBaseUrl = 'https://api.planet.com'

// Crear instancia de axios para Planet
const planetApi = axios.create({
  baseURL: planetBaseUrl,
  headers: {
    Authorization: `Basic ${btoa(planetApiKey + ':')}`,
  },
})

export default boot(({ app }) => {
  // Para uso en la Options API
  app.config.globalProperties.$planetApi = planetApi
})

export { planetApi }
