import { Notify } from 'quasar'

export default () => {
  // Configuración global de notificaciones
  Notify.setDefaults({
    position: 'bottom',
    timeout: 3000,
    actions: [{ icon: 'close', color: 'white' }],
  })
}
