{ type: uploaded file fileName: src/pages/AboutNutroganPage.vue fullContent:
<template>
  <q-page padding class="dashboard-pro-bg text-white">
    <div class="hero-container q-pt-xl q-pb-lg text-center relative-position">
      <div class="hero-glow absolute-center"></div>

      <div class="relative-position" style="z-index: 2">
        <h1 class="text-display text-white q-my-none">
          Gestión Ganadera <br />
          <span class="text-gradient">De Precisión</span>
        </h1>

        <p class="text-subtitle1 text-grey-4 q-mt-md q-mx-auto" style="max-width: 700px">
          Nutrogan no es una planilla digital. Es el sistema nervioso central de tu establecimiento.
          Conectamos sanidad, nutrición y finanzas para detener la fuga de valor.
        </p>
      </div>
    </div>

    <div class="nav-container q-my-xl flex justify-center sticky-nav">
      <q-tabs
        v-model="tab"
        class="glass-tabs text-grey-5"
        active-color="black"
        indicator-color="primary"
        narrow-indicator
        no-caps
        align="center"
      >
        <q-tab name="vision" label="Visión" />
        <q-tab name="tech" label="Tecnología & IA" />
        <q-tab name="manual" label="Manual" />
        <q-tab name="news" label="Noticias" />
      </q-tabs>
    </div>

    <q-tab-panels v-model="tab" animated class="bg-transparent content-panels q-mb-xl">
      <q-tab-panel name="vision" class="q-pa-none">
        <div class="text-center q-mb-xl">
          <div class="text-h4 text-weight-bold text-white">ADN Nutrogan</div>
          <div class="text-grey-4 q-mt-xs">
            Los tres pilares fundamentales de nuestra ingeniería.
          </div>
        </div>

        <div class="row q-col-gutter-lg justify-center">
          <div class="col-12 col-md-4">
            <div class="pro-vision-card" style="--card-color: #39ff14">
              <div class="glow-bg"></div>
              <div class="card-content column items-center text-center q-pa-xl">
                <div class="icon-halo q-mb-lg">
                  <q-icon name="touch_app" size="4em" />
                </div>
                <div class="text-overline text-grey-5 tracking-wider">EXPERIENCIA DE USUARIO</div>
                <h3 class="text-h5 text-white text-weight-bold q-my-sm">Mano Enguantada</h3>
                <p class="text-grey-4 text-body2 leading-relaxed">
                  Botones XL y alto contraste. Interfaz diseñada para usarse con guantes de trabajo,
                  a caballo y bajo el sol intenso del mediodía.
                </p>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="pro-vision-card" style="--card-color: #39ff14">
              <div class="glow-bg"></div>
              <div class="card-content column items-center text-center q-pa-xl">
                <div class="icon-halo q-mb-lg">
                  <q-icon name="wifi_off" size="4em" />
                </div>
                <div class="text-overline text-grey-5 tracking-wider">INFRAESTRUCTURA</div>
                <h3 class="text-h5 text-white text-weight-bold q-my-sm">100% Offline Nativo</h3>
                <p class="text-grey-4 text-body2 leading-relaxed">
                  La base de datos viaja contigo. Registra en lo profundo del monte sin señal. La
                  sincronización es automática e invisible al volver al casco.
                </p>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="pro-vision-card" style="--card-color: #39ff14">
              <div class="glow-bg"></div>
              <div class="card-content column items-center text-center q-pa-xl">
                <div class="icon-halo q-mb-lg">
                  <q-icon name="trending_up" size="4em" />
                </div>
                <div class="text-overline text-grey-5 tracking-wider">ECONOMÍA</div>
                <h3 class="text-h5 text-white text-weight-bold q-my-sm">Rentabilidad Real</h3>
                <p class="text-grey-4 text-body2 leading-relaxed">
                  Transformamos datos en dinero. Optimizamos el
                  <strong>Costo por Kg Ganado</strong> para detener la fuga de valor y hacer
                  rentable el engorde local.
                </p>
              </div>
            </div>
          </div>
        </div>
      </q-tab-panel>

      <q-tab-panel name="tech" class="q-pa-none">
        <div class="text-center q-mb-xl">
          <q-badge
            color="primary"
            text-color="black"
            label="VISIÓN ARTIFICIAL (EDGE AI)"
            class="q-mb-sm shadow-5"
          />
          <div class="text-h3 text-weight-bolder text-white q-mb-sm">Visión Artificial</div>
          <p class="text-body1 text-grey-4 q-mx-auto" style="max-width: 600px">
            Innovación de punta. Escaneo biométrico instantáneo directo en el dispositivo.
          </p>
        </div>

        <div class="row justify-center q-mb-lg">
          <div class="col-12 col-md-9 col-lg-7">
            <div class="video-frame glass-panel">
              <div
                class="video-header row items-center justify-between q-px-md q-py-xs bg-dark-glass"
              >
                <div class="row items-center">
                  <div class="dot-recording q-mr-sm"></div>
                  <span
                    class="text-caption text-uppercase text-weight-bold text-grey-5 tracking-wider"
                    >Live Inference</span
                  >
                </div>
                <q-icon name="view_in_ar" color="grey-6" />
              </div>

              <div class="video-wrapper bg-black">
                <video
                  src="videos/Video_Escaneo_Corporal_Vaca_Brangus.mp4"
                  class="fit"
                  autoplay
                  loop
                  muted
                  playsinline
                ></video>
              </div>
            </div>
          </div>
        </div>

        <div class="row justify-center q-mb-xl">
          <q-btn
            to="/technology"
            outline
            rounded
            color="white"
            icon="memory"
            label="¿Cómo funciona esta tecnología?"
            class="q-px-lg q-py-sm btn-tech-link"
            no-caps
          />
        </div>

        <div class="text-center q-mb-lg q-mt-xl">
          <div class="text-h4 text-white">Stack Tecnológico</div>
          <div class="text-grey-5">Click para ver documentación oficial</div>
        </div>

        <div class="row q-col-gutter-md justify-center">
          <div class="col-12 col-sm-6 col-md-3">
            <TechFeatureCard
              title="Sentinel Hub"
              subtitle="Imágenes Satelitales"
              description="API de procesamiento espectral para cálculo de índices NDVI y biomasa."
              icon="satellite_alt"
              color="#39ff14"
              url="https://www.sentinel-hub.com/"
            />
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <TechFeatureCard
              title="Supabase"
              subtitle="Backend Serverless"
              description="Base de datos PostgreSQL Realtime con seguridad RLS y Edge Functions."
              icon="storage"
              color="#39ff14"
              url="https://supabase.com/"
            />
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <TechFeatureCard
              title="Gemini 3"
              subtitle="IA Generativa"
              description="Modelos LLM multimodales para análisis de patrones y reportes naturales."
              icon="psychology"
              color="#39ff14"
              url="https://deepmind.google/technologies/gemini/"
            />
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <TechFeatureCard
              title="Quasar"
              subtitle="Frontend Framework"
              description="El framework Vue.js más potente para construir PWAs de alto rendimiento."
              icon="code"
              color="#39ff14"
              url="https://quasar.dev/"
            />
          </div>
        </div>
      </q-tab-panel>

      <q-tab-panel name="manual" class="q-pa-none">
        <div class="text-center q-mb-xl">
          <div class="text-h4 text-white">Manual Interactivo</div>
          <div class="text-grey-4">Domina la plataforma con estas guías interactivas.</div>
        </div>

        <div class="row q-col-gutter-lg justify-center">
          <div class="col-12 col-md-4">
            <q-card
              class="manual-card column items-center text-center q-pa-xl"
              style="--highlight-color: #39ff14"
            >
              <div class="glow-icon-container q-mb-lg" style="background: rgba(57, 255, 20, 0.15)">
                <q-icon name="fence" size="3em" style="color: #39ff14" />
              </div>
              <div class="text-h5 text-white text-weight-bold q-mb-sm">Gestión Operativa</div>
              <p class="text-grey-4 q-mb-lg">
                Aprende a crear lotes y moverlos entre potreros con drag & drop.
              </p>

              <q-btn
                outline
                style="color: #39ff14"
                label="Ver Guía"
                rounded
                class="full-width"
                no-caps
              >
                <q-menu fit class="bg-glass-blur text-white" style="border: 1px solid #39ff14">
                  <q-list style="min-width: 200px">
                    <q-item clickable v-close-popup @click="openGuide('crear_lotes')">
                      <q-item-section>Crear Lotes</q-item-section>
                      <q-item-section side
                        ><q-icon name="add" style="color: #39ff14"
                      /></q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="openGuide('movimiento')">
                      <q-item-section>Movimiento Drag & Drop</q-item-section>
                      <q-item-section side
                        ><q-icon name="drag_indicator" style="color: #39ff14"
                      /></q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card
              class="manual-card column items-center text-center q-pa-xl"
              style="--highlight-color: #39ff14"
            >
              <div class="glow-icon-container q-mb-lg" style="background: rgba(57, 255, 20, 0.15)">
                <q-icon name="science" size="3em" style="color: #39ff14" />
              </div>
              <div class="text-h5 text-white text-weight-bold q-mb-sm">Recursos</div>
              <p class="text-grey-4 q-mb-lg">
                Carga de análisis de agua y dibujo de polígonos satelitales.
              </p>

              <q-btn
                outline
                style="color: #39ff14"
                label="Ver Guía"
                rounded
                class="full-width"
                no-caps
              >
                <q-menu fit class="bg-glass-blur text-white" style="border: 1px solid #39ff14">
                  <q-list style="min-width: 200px">
                    <q-item clickable v-close-popup @click="openGuide('agua')">
                      <q-item-section>Cargar Análisis de Agua</q-item-section>
                      <q-item-section side
                        ><q-icon name="water_drop" style="color: #39ff14"
                      /></q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="openGuide('poligono')">
                      <q-item-section>Dibujar Polígonos</q-item-section>
                      <q-item-section side
                        ><q-icon name="draw" style="color: #39ff14"
                      /></q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card
              class="manual-card column items-center text-center q-pa-xl"
              style="--highlight-color: #39ff14"
            >
              <div class="glow-icon-container q-mb-lg" style="background: rgba(57, 255, 20, 0.15)">
                <q-icon name="attach_money" size="3em" style="color: #39ff14" />
              </div>
              <div class="text-h5 text-white text-weight-bold q-mb-sm">Rentabilidad</div>
              <p class="text-grey-4 q-mb-lg">Control de insumos en despensa y cálculo de costos.</p>

              <q-btn
                outline
                style="color: #39ff14"
                label="Ver Guía"
                rounded
                class="full-width"
                no-caps
              >
                <q-menu fit class="bg-glass-blur text-white" style="border: 1px solid #39ff14">
                  <q-list style="min-width: 200px">
                    <q-item clickable v-close-popup @click="openGuide('compras')">
                      <q-item-section>Registrar Compras</q-item-section>
                      <q-item-section side
                        ><q-icon name="shopping_cart" style="color: #39ff14"
                      /></q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="openGuide('reportes')">
                      <q-item-section>Reporte PDF con IA</q-item-section>
                      <q-item-section side
                        ><q-icon name="picture_as_pdf" style="color: #39ff14"
                      /></q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-card>
          </div>
        </div>
      </q-tab-panel>

      <q-tab-panel name="news" class="q-pa-none">
        <div class="text-center q-mb-lg">
          <div class="text-h4 text-white">Novedades</div>
        </div>
        <div class="row items-center justify-center q-gutter-md">
          <q-btn round flat color="grey-5" icon="chevron_left" @click="scrollNews('left')" />
          <div
            class="news-scroll-container row no-wrap q-gutter-md justify-center"
            ref="newsScrollRef"
          >
            <div class="news-card-wrapper">
              <NewsGridItem
                image="images/news/cedeva-field.jpg"
                tag="CASO DE ÉXITO"
                tag-color="positive"
                date="18 Nov 2025"
                title="CEDEVA valida algoritmos con 92% de precisión"
              />
            </div>
            <div class="news-card-wrapper">
              <NewsGridItem
                image="images/news/satellite-ndvi.jpg"
                tag="UPDATE v2.4"
                tag-color="info"
                date="10 Nov 2025"
                title="Lanzamiento: Monitoreo Satelital NDVI"
              />
            </div>
            <div class="news-card-wrapper">
              <NewsGridItem
                image="images/news/ai-robot.jpg"
                tag="I+D"
                tag-color="purple"
                date="05 Nov 2025"
                title="Alianza con Google Cloud para IA Generativa"
              />
            </div>
          </div>
          <q-btn round flat color="grey-5" icon="chevron_right" @click="scrollNews('right')" />
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <div class="footer-pro q-mt-xl q-pt-xl q-pb-md">
      <q-separator dark class="q-mb-lg separator-glow" />
      <div class="row justify-between items-center text-grey-6 text-caption q-px-lg">
        <div>
          <div class="text-h6 text-white q-mb-xs">Nutrogan Technologies</div>
          Designed for the Future of AgTech.
        </div>
        <div class="text-right">
          &copy; 2025 Todos los derechos reservados. <br />
          <span class="text-grey-7">v2.4.0 (Build 2025.12.05)</span>
        </div>
      </div>
    </div>

    <q-dialog v-model="guideDialog" backdrop-filter="blur(4px)">
      <q-card
        class="bg-dark-glass text-white guide-card"
        :style="{ border: `2px solid ${currentGuide.color}` }"
      >
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold" :style="{ color: currentGuide.color }">
            <q-icon :name="currentGuide.icon" class="q-mr-sm" /> {{ currentGuide.title }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pa-none">
          <q-carousel
            v-model="guideSlide"
            transition-prev="slide-right"
            transition-next="slide-left"
            animated
            control-color="white"
            navigation
            padding
            arrows
            height="300px"
            class="bg-transparent"
          >
            <q-carousel-slide
              v-for="(step, index) in currentGuide.steps"
              :key="index"
              :name="index"
              class="column no-wrap flex-center"
            >
              <q-icon
                :name="step.icon"
                size="5em"
                :style="{ color: currentGuide.color }"
                class="q-mb-md opacity-80"
              />
              <div class="text-h6 text-center q-mb-sm">{{ step.title }}</div>
              <div class="text-center text-grey-4 q-px-lg" style="max-width: 400px">
                {{ step.desc }}
              </div>
              <q-btn
                v-if="index === currentGuide.steps.length - 1 && step.action"
                :label="step.actionLabel"
                :icon-right="step.actionIcon || 'arrow_forward'"
                outline
                :style="{ color: currentGuide.color }"
                class="q-mt-lg"
                :to="step.actionRoute"
                v-close-popup
              />
            </q-carousel-slide>
          </q-carousel>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import TechFeatureCard from 'components/about/TechFeatureCard.vue'
import NewsGridItem from 'components/about/NewsGridItem.vue'

const tab = ref('vision')
const newsScrollRef = ref(null)


const guideDialog = ref(false)
const guideSlide = ref(0)
const currentGuide = ref({ title: '', color: '#fff', steps: [] })

const guidesDatabase = {
  crear_lotes: {
    title: 'Crear Lotes',
    color: '#39ff14',
    icon: 'add_circle',
    steps: [
      {
        title: 'Accede a la Sección Lotes',
        desc: 'En el menú inferior, toca el ícono de "Lotes".',
        icon: 'fence',
      },
      { title: 'Botón Nuevo', desc: 'Busca el botón verde "Nuevo Lote".', icon: 'add' },
      {
        title: 'Completa los Datos',
        desc: 'Ingresa cantidad y categoría.',
        icon: 'edit_note',
        action: true,
        actionLabel: 'Ir a Lotes',
        actionRoute: '/lotes',
      },
    ],
  },
  movimiento: {
    title: 'Movimiento Drag & Drop',
    color: '#39ff14',
    icon: 'drag_indicator',
    steps: [
      {
        title: 'Ubica el Lote',
        desc: 'En el Dashboard, verás tus lotes "En Corral".',
        icon: 'view_module',
      },
      { title: 'Arrastra y Suelta', desc: 'Arrastra hacia un potrero libre.', icon: 'touch_app' },
      {
        title: 'Listo!',
        desc: 'Fecha registrada.',
        icon: 'check_circle',
        action: true,
        actionLabel: 'Ir al Dashboard',
        actionRoute: '/',
      },
    ],
  },
  agua: {
    title: 'Cargar Análisis de Agua',
    color: '#39ff14',
    icon: 'water_drop',
    steps: [
      { title: 'Sección Recursos', desc: 'Ve a Recursos > Fuentes de Agua.', icon: 'category' },
      { title: 'Selecciona Fuente', desc: 'Elige el bebedero a analizar.', icon: 'ads_click' },
      {
        title: 'Carga Datos',
        desc: 'Ingresa pH y TDS.',
        icon: 'science',
        action: true,
        actionLabel: 'Ir a Agua',
        actionRoute: '/recursos/agua',
      },
    ],
  },
  poligono: {
    title: 'Dibujar Polígonos',
    color: '#39ff14',
    icon: 'draw',
    steps: [
      { title: 'Mapa Satelital', desc: 'Entra en Mis Potreros.', icon: 'map' },
      { title: 'Herramienta Dibujo', desc: 'Marca los vértices en el mapa.', icon: 'create' },
      {
        title: 'Guardar',
        desc: 'Calculamos hectáreas y NDVI.',
        icon: 'satellite_alt',
        action: true,
        actionLabel: 'Ir a Potreros',
        actionRoute: '/recursos/potreros',
      },
    ],
  },
  compras: {
    title: 'Registrar Compras',
    color: '#39ff14',
    icon: 'shopping_cart',
    steps: [
      { title: 'Mi Despensa', desc: 'Accede a Recursos > Despensa.', icon: 'inventory_2' },
      { title: 'Nuevo Item', desc: 'Crea un insumo.', icon: 'add_box' },
      {
        title: 'Botón Comprar',
        desc: 'Registra precio y cantidad.',
        icon: 'attach_money',
        action: true,
        actionLabel: 'Ir a Despensa',
        actionRoute: '/recursos/despensa',
      },
    ],
  },
  reportes: {
    title: 'Reporte PDF con IA',
    color: '#39ff14',
    icon: 'picture_as_pdf',
    steps: [
      { title: 'Sección Reportes', desc: 'Ve a Reportes.', icon: 'bar_chart' },
      { title: 'Análisis', desc: 'Espera el análisis de Gemini.', icon: 'psychology' },
      {
        title: 'Descargar',
        desc: 'Obtén tu PDF ejecutivo.',
        icon: 'download',
        action: true,
        actionLabel: 'Ir a Reportes',
        actionRoute: '/reportes',
      },
    ],
  },
}

function openGuide(guideKey) {
  if (guidesDatabase[guideKey]) {
    currentGuide.value = guidesDatabase[guideKey]
    guideSlide.value = 0
    guideDialog.value = true
  }
}

function scrollNews(direction) {
  if (newsScrollRef.value) {
    const scrollAmount = 350
    if (direction === 'left')
      newsScrollRef.value.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    else newsScrollRef.value.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }
}
</script>

<style lang="scss" scoped>

.dashboard-pro-bg {
  background-color: #0505058b;
  background-image:
    radial-gradient(at 0% 0%, rgba(0, 0, 0, 0.815) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(0, 0, 0, 0.688) 0px, transparent 50%),
    url('src/assets/nutrogan-bg4.png');
  background-size: cover;
  background-attachment: fixed;
  min-height: 100vh;
  font-family: 'Outfit', sans-serif;
}
.text-display {
  font-size: 5rem;
  line-height: 1;
  letter-spacing: -2px;
}
.text-gradient {
  background: linear-gradient(90deg, #39ff14 0%, #00ffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(57, 255, 20, 0.3);
  background-clip: text;
}
.hero-glow {
  width: 600px;
  height: 300px;
  background: radial-gradient(ellipse at center, rgba(42, 141, 24, 0.15), transparent 70%);
  filter: blur(80px);
  z-index: 1;
}
.glass-chip {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.btn-hero {
  padding: 12px 24px;
  font-size: 1rem;
  box-shadow: 0 0 20px rgba(57, 255, 20, 0.4);
}
.btn-hero-outline {
  padding: 12px 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}


.sticky-nav {
  position: sticky;
  top: 20px;
  z-index: 100;
}
.glass-tabs {
  background: rgba(22, 22, 22, 0.808);
  backdrop-filter: blur(20px);
  border-radius: 100px;
  border: 1px solid rgb(123, 255, 0);
  padding: 4px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}
:deep(.q-tab) {
  border-radius: 100px;
  min-height: 40px;
  transition: all 0.3s;
}
:deep(.q-tab--active) {
  background: rgba(17, 255, 0, 0.993);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.05);
}
:deep(.q-tab__indicator) {
  display: none;
}


.pro-vision-card {
  position: relative;
  height: 320px;
  border-radius: 24px;
  background: rgba(20, 20, 25, 0.7);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: default;

  &:hover {
    transform: translateY(-10px);
    border-color: var(--card-color);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);

    .glow-bg {
      opacity: 0.15;
    }
    .icon-halo {
      background-color: var(--card-color);
      box-shadow: 0 0 30px var(--card-color);
      color: #000 !important;
      transform: scale(1.1);
    }
  }
}

.glow-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, var(--card-color), transparent 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

.icon-halo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: var(--card-color);
  transition: all 0.4s ease;
}

/* VIDEO & TECH */
.glass-panel {
  background: rgba(20, 20, 25, 0.6);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.video-frame {
  overflow: hidden;
  border: 1px solid rgba(57, 255, 20, 0.3);
  box-shadow: 0 0 60px rgba(57, 255, 20, 0.1);
}
.video-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  height: 40px;
}
.video-wrapper {
  aspect-ratio: 16/9;
  position: relative;
  overflow: hidden;
}
.dot-recording {
  width: 10px;
  height: 10px;
  background-color: rgb(0, 255, 0);
  border-radius: 50%;
  box-shadow: 0 0 8px rgb(0, 255, 162);
  animation: blink 1.5s infinite;
}
.btn-tech-link {
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(255, 255, 255, 0.2);
  }
}


.manual-card {
  background: rgba(20, 20, 25, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  transition: all 0.3s;
  height: 100%;
  &:hover {
    border-color: var(--highlight-color, rgba(255, 255, 255, 0.3));
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    transform: translateY(-5px);
  }
}
.glow-icon-container {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bg-glass-blur {
  background: rgba(30, 30, 35, 0.95) !important;
  backdrop-filter: blur(15px) !important;
  color: white !important;
}


.separator-glow {
  background: linear-gradient(90deg, transparent, #2bcc0e, transparent);
  height: 1px;
  opacity: 0.5;
}
.guide-card {
  width: 600px;
  max-width: 90vw;
  border-radius: 24px;
}
.bg-dark-glass {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
}
.news-scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  padding-bottom: 20px;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}
.news-card-wrapper {
  min-width: 340px;
  max-width: 340px;
  height: 400px;
}
.leading-relaxed {
  line-height: 1.6;
}
.tracking-wider {
  letter-spacing: 1px;
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .text-display {
    font-size: 2.5rem;
  }
  .news-card-wrapper {
    min-width: 280px;
  }
}
</style>
}
