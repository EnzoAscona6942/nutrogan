import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import tsconfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      src: fileURLToPath(new URL('./src', import.meta.url)),
      boot: fileURLToPath(new URL('./src/boot', import.meta.url)),
      stores: fileURLToPath(new URL('./src/stores', import.meta.url)),
      components: fileURLToPath(new URL('./src/components', import.meta.url)),
      pages: fileURLToPath(new URL('./src/pages', import.meta.url)),
      layouts: fileURLToPath(new URL('./src/layouts', import.meta.url)),
      assets: fileURLToPath(new URL('./src/assets', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    setupFiles: 'test/vitest/setup-file.js',
    include: ['test/vitest/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // --- NUEVA CONFIGURACIÓN DE COBERTURA ---
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'], // 'lcov' es el clave
      reportsDirectory: 'coverage',
    },
  },
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar({
      sassVariables: 'src/css/quasar.variables.scss',
    }),
    tsconfigPaths(),
  ],
})
