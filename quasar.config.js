// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app/wrappers'

export default defineConfig(() => {
  return {
    boot: [
      'axios',
      'supabase', // Para Supabase
      'pinia', // Para Pinia
      'apexcharts', // Para Gráficos
      'echarts', // Para ECharts
      'notify-config', // Configuración personalizada de notificaciones
    ],

    css: ['app.scss'],

    extras: ['roboto-font', 'material-icons'],

    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20',
      },
      vueRouterMode: 'hash',
    },

    devServer: {
      open: true,
    },

    framework: {
      config: {},

      // *** ¡AQUÍ ESTÁ LA CORRECCIÓN! ***
      // La sección 'directives' ha sido eliminada.

      // Quasar plugins
      plugins: [
        'Notify', // Para notificaciones
        'Dialog', // Para popups
      ],
    },

    animations: [],

    // ¡Importante! Para que lea el .env
    sourceFiles: {
      htmlTemplate: 'index.html',
    },

    pwa: {
      workboxMode: 'GenerateSW',
    },
  }
})
