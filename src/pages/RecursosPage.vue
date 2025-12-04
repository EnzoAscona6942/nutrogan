<template>
  <q-page padding>
    <div class="page-title-box">Gestión de Recursos</div>

    <div class="row q-col-gutter-md q-mt-md">
      <div v-for="recurso in recursos" :key="recurso.titulo" class="col-12 col-md-6">
        <q-card
          class="resource-card"
          dark
          bordered
          flat
          style="border-radius: 12px; overflow: hidden; height: 170px"
          clickable
          v-ripple
          @click="$router.push(recurso.link)"
        >
          <q-img :src="recurso.image" class="absolute-full" style="z-index: 1">
            <template v-slot:error>
              <div class="absolute-full flex flex-center" style="background: rgba(0, 0, 0, 0.5)">
                <q-icon name="image_not_supported" color="grey-5" size="3em" />
              </div>
            </template>
          </q-img>

          <q-card-section
            class="absolute-bottom q-pa-md"
            style="
              z-index: 2;

              background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%);
            "
          >
            <div class="text-h6">{{ recurso.titulo }}</div>

            <div class="text-subtitle2 text-grey-4">
              {{ recurso.caption }}
            </div>
          </q-card-section>

          <q-icon
            name="chevron_right"
            color="white"
            size="2.5em"
            class="absolute"
            style="top: 50%; right: 10px; transform: translateY(-50%); z-index: 2"
          />
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

// *** ESTAS SON LAS RUTAS CORREGIDAS ***

// Quasar sirve todo desde la carpeta 'public' como si fuera la raíz '/'.

const recursos = ref([
  {
    titulo: 'Mis Potreros',

    caption: 'Gestionar subdivisiones y pasturas',

    link: '/recursos/potreros',

    image: 'images/recursos/potreros.jpg', // Ruta local
  },

  {
    titulo: 'Mi Despensa',

    caption: 'Gestionar insumos, alimentos y costos',

    link: '/recursos/despensa',

    image: 'images/recursos/despensa.jpg', // Ruta local
  },

  {
    titulo: 'Fuentes de Agua',

    caption: 'Gestionar fuentes y análisis de calidad',

    link: '/recursos/agua',

    image: 'images/recursos/agua.jpg', // Ruta local
  },

  {
    titulo: 'Central de Clima',

    caption: 'Anotar precipitaciones y ver análisis hidrológicos y climáticos',

    link: '/recursos/lluvias',

    image: 'images/recursos/lluvias.jpg', // Ruta local
  },

  {
    titulo: 'Análisis Satelital (NDVI)',

    caption: 'Obtener vigor del forraje por potrero',

    link: '/recursos/satelital',

    image: 'images/recursos/satelital.jpg', // Ruta local
  },
])
</script>

<style scoped>
.page-title-box {
  font-size: 2rem;

  font-weight: 700;

  color: white;

  margin-bottom: 1rem;
}

.resource-card {
  transition: all 0.3s ease;

  border-color: rgba(255, 255, 255, 0.1); /* Borde sutil */
}

.resource-card:hover {
  transform: translateY(-3px);

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  border-color: var(--q-primary);
}
</style>
