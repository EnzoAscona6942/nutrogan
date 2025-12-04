<template>
  <q-layout view="lHh LpR lFf" class="fullscreen bg-black overflow-hidden">
    <div class="video-background">
      <video autoplay loop muted playsinline>
        <source src="/videos/video-background-nutrogan.mp4" type="video/mp4" />
      </video>
      <div class="video-overlay"></div>
    </div>

    <svg class="unibody-frame" width="100%" height="100%" preserveAspectRatio="none">
      <defs>
        <linearGradient id="frameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color: #000000; stop-opacity: 1" />
          <stop offset="30%" style="stop-color: #050505; stop-opacity: 1" />
          <stop offset="100%" style="stop-color: #39ff14; stop-opacity: 1" />
        </linearGradient>
        <mask id="frameMask">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <rect
            x="20"
            y="20"
            width="calc(100% - 40px)"
            height="calc(100% - 40px)"
            rx="40"
            ry="40"
            fill="black"
          />
        </mask>
      </defs>
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="url(#frameGradient)"
        mask="url(#frameMask)"
      />
    </svg>

    <q-header class="bg-transparent q-pt-none pointer-events-none" style="z-index: 5000">
      <div class="top-glass-bar row items-center q-px-sm pointer-events-auto">
        <div class="col row justify-center items-center">
          <div class="row items-center no-wrap q-gutter-x-md">
            <q-btn flat round dense to="/profile" class="neon-icon-btn">
              <q-tooltip class="bg-black text-primary">Centro de Mando</q-tooltip>
              <q-icon name="person_outline" size="28px" />
            </q-btn>
            <div class="separator-vertical gt-xs"></div>
            <q-btn flat round dense to="/team" class="neon-icon-btn">
              <q-tooltip class="bg-black text-primary">Developers</q-tooltip>
              <q-icon name="code" size="28px" />
            </q-btn>
          </div>
        </div>

        <div class="notch-spacer-fluid"></div>

        <div class="col row justify-center items-center">
          <div class="row items-center no-wrap q-gutter-x-md">
            <q-btn flat round dense to="/support" class="neon-icon-btn">
              <q-tooltip class="bg-black text-primary">Soporte</q-tooltip>
              <q-icon name="support_agent" size="28px" />
            </q-btn>
            <div class="separator-vertical gt-xs"></div>
            <q-btn flat round dense to="/about" class="neon-icon-btn">
              <q-tooltip class="bg-black text-primary">Acerca de</q-tooltip>
              <q-icon name="info_outline" size="28px" />
            </q-btn>
            <div class="separator-vertical gt-xs"></div>
            <q-btn flat round dense @click="handleLogout" class="neon-icon-btn">
              <q-tooltip class="bg-black text-primary">Cerrar Sesión</q-tooltip>
              <q-icon name="logout" size="28px" />
            </q-btn>
          </div>
        </div>
      </div>

      <div class="notch-container-fluid shadow-0 pointer-events-auto">
        <q-img src="/images/nutrogan-logo3.svg" fit="contain" class="notch-logo" />
      </div>
    </q-header>

    <q-page-container class="page-padding-fix">
      <router-view />
    </q-page-container>

    <q-page-sticky position="bottom" :offset="[0, 40]" style="z-index: 6000">
      <q-fab
        v-model="fabOpen"
        vertical-actions-align="center"
        color="black"
        text-color="primary"
        icon="add"
        active-icon="close"
        direction="up"
        padding="4px"
        class="holo-fab shadow-10"
      >
        <q-fab-action
          class="fab-action-glass"
          @click="openModal('evaluar')"
          icon="straighten"
          label="Evaluar"
        />
        <q-fab-action
          class="fab-action-glass"
          @click="openModal('mover')"
          icon="sync_alt"
          label="Mover"
        />
        <q-fab-action
          class="fab-action-glass"
          @click="openModal('evento')"
          icon="vaccines"
          label="Evento"
        />
        <q-fab-action
          class="fab-action-glass"
          @click="openModal('gasto')"
          icon="shopping_cart"
          label="Gasto"
        />
      </q-fab>
    </q-page-sticky>

    <q-footer class="bg-transparent q-pb-none pointer-events-none" style="z-index: 5000">
      <div class="footer-wrapper column items-center pointer-events-auto">
        <div class="footer-base-rigid column items-center justify-center">
          <div class="tabs-pill shadow-5 full-width">
            <q-tabs
              v-model="tab"
              class="nav-tabs text-grey-5"
              active-color="primary"
              indicator-color="primary"
              dense
              align="justify"
            >
              <q-route-tab name="inicio" :icon="'img:/icons/icon-home.svg'" to="/" exact />
              <q-route-tab name="lotes" :icon="'img:/icons/icon-lotes.svg'" to="/lotes" exact />

              <q-route-tab
                name="recursos"
                :icon="'img:/icons/icon-recursos.svg'"
                to="/recursos"
                exact
              />
              <q-route-tab
                name="reportes"
                :icon="'img:/icons/icon-reportes.svg'"
                to="/reportes"
                exact
              />
            </q-tabs>
          </div>

          <div class="field-switch-wrapper q-mt-sm full-width">
            <q-btn to="/field" class="field-switch shadow-inner" no-caps unelevated>
              <div class="row items-center justify-between full-width q-px-md">
                <div class="switch-label text-weight-bolder text-uppercase">Modo Campo</div>
                <div class="switch-slider shadow-3">
                  <q-icon name="agriculture" size="20px" color="black" />
                </div>
              </div>
              <div class="grip-texture"></div>
            </q-btn>
          </div>
        </div>
      </div>
    </q-footer>

    <q-dialog v-model="showModal">
      <q-card style="width: 100px; max-width: 20vw" class="glass-dialog-form">
        <q-card-section
          ><div class="text-h6">{{ modalTitle }}</div></q-card-section
        >
        <q-card-section class="q-pt-none">
          <QuickEvaluateForm v-if="modalType === 'evaluar'" @close="showModal = false" />
          <QuickMoveForm v-if="modalType === 'mover'" @close="showModal = false" />
          <QuickGastoForm v-if="modalType === 'gasto'" @close="showModal = false" />
          <QuickEventoForm v-if="modalType === 'evento'" @close="showModal = false" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from 'stores/auth-store'
import { useRouter } from 'vue-router'
import QuickEvaluateForm from 'src/components/QuickEvaluateForm.vue'
import QuickMoveForm from 'src/components/QuickMoveForm.vue'
import QuickGastoForm from 'src/components/QuickGastoForm.vue'
import QuickEventoForm from 'src/components/QuickEventoForm.vue'

const tab = ref('inicio')
const fabOpen = ref(false)
const showModal = ref(false)
const modalType = ref('')
const authStore = useAuthStore()
const router = useRouter()

// Esta función ahora SÍ se usa en el botón de logout del header
async function handleLogout() {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error(error)
  }
}

const modalTitle = computed(() => {
  switch (modalType.value) {
    case 'evaluar':
      return 'Acción Rápida: Evaluar Lote'
    case 'mover':
      return 'Acción Rápida: Mover Lote'
    case 'gasto':
      return 'Acción Rápida: Registrar Gasto/Insumo'
    case 'evento':
      return 'Acción Rápida: Registrar Evento'
    default:
      return 'Acción Rápida'
  }
})

function openModal(type) {
  modalType.value = type
  showModal.value = true
  fabOpen.value = false
}
</script>

<style scoped lang="scss">
/* UTILS */
.pointer-events-none {
  pointer-events: none;
}
.pointer-events-auto {
  pointer-events: auto;
}
.page-padding-fix {
  /* ELIMINAMOS el padding grande.
     Ahora el control del espacio lo tendrá la página misma. */
  padding-top: 0 !important;
  padding-bottom: 0 !important;

  /* Aseguramos que este contenedor ocupe toda la pantalla para servir de base */
  height: 100vh;
  width: 100vw;
  overflow: hidden; /* Evita doble scrollbar */
}

/* =========================================
   CÁLCULO MATEMÁTICO DEL NOTCH FLUIDO
   ========================================= */
/* 100vw = Ancho total de pantalla
   340px = Espacio reservado para los iconos (170px izquierda + 170px derecha)
   500px = Ancho máximo (para igualar al footer en desktop)

   La fórmula dice: "El ancho es 500px, A MENOS que la pantalla sea chica.
   En ese caso, el ancho es (Pantalla - 340px), protegiendo siempre a los iconos".
*/
.fluid-width-calc {
  width: min(500px, calc(100vw - 340px));
  min-width: 180px; /* Límite mínimo para que entre el logo */
}

/* =========================================
   MARCO UNIBODY (SVG)
   ========================================= */
.unibody-frame {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 4000;
  pointer-events: none;
}

/* =========================================
   TOP BAR & NOTCH (FLUIDO)
   ========================================= */
.top-glass-bar {
  width: 100%;
  height: 70px;
  background: rgba(0, 0, 0, 0.495);
  backdrop-filter: blur(5px);
  border-bottom: 1px solid rgba(57, 255, 20, 0.15);
  position: relative;
}

/* El espaciador invisible empuja los iconos hacia los bordes */
.notch-spacer-fluid {
  @extend .fluid-width-calc;
  height: 1px;
  transition: width 0.1s linear; /* Ajuste instantáneo al redimensionar */
}

.notch-container-fluid {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);

  @extend .fluid-width-calc; /* Aplica la misma lógica de ancho */

  height: 135px;
  padding: 45px 10px 50px 10px;

  background-color: #000000;
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;

  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(51, 255, 0, 0.129);
  border-top: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.9);
  z-index: 5001;

  transition: width 0.1s linear;
}

.notch-logo {
  width: 800%;
  height: 800%;
  max-width: 100px;
  max-height: 100px;
  object-fit: contain;
}

.neon-icon-btn {
  color: #39ff14;
  opacity: 0.9;
  transition: 0.3s;
}
.neon-icon-btn:hover {
  opacity: 1;
  text-shadow: 0 0 12px #39ff14;
  transform: scale(1.1);
}
.separator-vertical {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.226);
}

/* =========================================
   FOOTER (RÍGIDO - SIEMPRE 500px)
   ========================================= */
.footer-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
  position: relative;
  padding-bottom: 0;
}

.footer-base-rigid {
  background-color: #39ff14;

  /* ANCHO FIJO ABSOLUTO */
  width: 500px;
  min-width: 500px;

  padding: 15px 25px 20px 25px;
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  box-shadow: 0 -5px 40px rgba(57, 255, 20, 0.3);
  position: relative;
  margin-bottom: -2px;

  /* Si la pantalla es menor a 500px, el footer simplemente se corta o scrollea,
     pero NO se deforma, manteniendo la rigidez solicitada.
     Opcionalmente podemos escalar para que quepa sin reflujo: */
  @media (max-width: 520px) {
    transform: scale(0.95);
    transform-origin: bottom center;
    width: 100%;
    min-width: auto;
    border-radius: 0; /* En pantallas muy chicas se vuelve barra completa */
  }
}

.tabs-pill {
  background-color: #0a0a0a;
  border-radius: 100px;
  padding: 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}
.nav-tabs {
  height: 50px;
}

:deep(.q-tab__icon img) {
  width: 24px;
  height: 24px;
  filter: grayscale(1) brightness(1.5);
  opacity: 0.6;
}
:deep(.q-tab--active .q-tab__icon img) {
  opacity: 1;

  filter: drop-shadow(0 0 5px #39ff14);
}

/* Switch & FAB */
.field-switch-wrapper {
  width: 100%;
}
.field-switch {
  width: 100%;
  height: 44px;
  background: #151515;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
}
.switch-label {
  color: #666;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  letter-spacing: 1px;
  z-index: 2;
}
.field-switch:hover .switch-label {
  color: #39ff14;
}
.switch-slider {
  width: 40px;
  height: 32px;
  background: #39ff14;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
.grip-texture {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.02) 10px,
    rgba(255, 255, 255, 0.02) 20px
  );
  pointer-events: none;
  z-index: 1;
}
.neon-fab {
  box-shadow: 0 0 15px rgba(57, 255, 20, 0.6);
  border: 2px solid #000;
}
.neon-fab:active {
  transform: scale(1.05);
  box-shadow: 0 0 25px rgba(57, 255, 20, 0.9);
}
:deep(.fab-action-glass) {
  background: rgba(15, 15, 15, 0.9) !important;
  border: 1px solid rgba(57, 255, 20, 0.3) !important;
  color: #39ff14 !important;
  margin-bottom: 10px;
}

.video-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
}
.video-background video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.video-overlay {
  position: absolute;
  inset: 0;
  background: transparent;
}
</style>
