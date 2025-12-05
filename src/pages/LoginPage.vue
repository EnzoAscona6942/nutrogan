<template>
  <div class="login-container flex flex-center">
    <InteractiveBackground />

    <div class="ambient-glow absolute-center"></div>

    <q-card class="login-card glass-panel relative-position">
      <div class="text-center q-mb-lg relative-position logo-wrapper">
        <InteractiveLogo />

        <div class="text-h5 text-white text-weight-bold q-mt-sm tracking-wide">
          Bienvenido a <span class="text-primary">Nutrogan</span>
        </div>
        <div class="text-caption text-grey-5">Gestión Ganadera de Precisión</div>
      </div>

      <q-tabs
        v-model="tab"
        dense
        class="text-grey-5 q-mb-lg nav-tabs"
        active-color="dark"
        indicator-color="transparent"
        align="justify"
        narrow-indicator
      >
        <q-tab name="login" label="Ingresar" class="tab-btn" />
        <q-tab name="register" label="Crear Cuenta" class="tab-btn" />
      </q-tabs>

      <q-tab-panels v-model="tab" animated class="bg-transparent text-white">
        <q-tab-panel name="login" class="q-pa-none">
          <q-form @submit.prevent="handleLogin" class="q-gutter-y-md">
            <q-input
              v-model="form.email"
              type="email"
              label="Correo Electrónico"
              outlined
              dark
              color="primary"
              class="input-pro"
              :rules="[(val) => !!val || 'Requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="email" color="grey-6" />
              </template>
            </q-input>

            <q-input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              label="Contraseña"
              outlined
              dark
              color="primary"
              class="input-pro"
              :rules="[(val) => !!val || 'Requerida']"
            >
              <template v-slot:prepend>
                <q-icon name="lock" color="grey-6" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  color="grey-6"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <div class="row justify-end">
              <div
                class="text-caption text-grey-5 cursor-pointer hover-text-primary transition-color"
              >
                ¿Olvidaste tu contraseña?
              </div>
            </div>

            <q-btn
              label="Iniciar Sesión"
              type="submit"
              class="btn-neon full-width q-mt-md"
              :loading="loading"
              unelevated
            />
          </q-form>
        </q-tab-panel>

        <q-tab-panel name="register" class="q-pa-none">
          <q-form @submit.prevent="handleRegister" class="q-gutter-y-md">
            <q-input
              v-model="form.email"
              type="email"
              label="Correo Electrónico"
              outlined
              dark
              color="primary"
              class="input-pro"
              :rules="[(val) => !!val || 'Requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="email" color="grey-6" />
              </template>
            </q-input>

            <q-input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              label="Contraseña"
              outlined
              dark
              color="primary"
              class="input-pro"
              hint="Mínimo 6 caracteres"
              :rules="[(val) => val.length >= 6 || 'Mínimo 6 caracteres']"
            >
              <template v-slot:prepend>
                <q-icon name="vpn_key" color="grey-6" />
              </template>
            </q-input>

            <q-btn
              label="Registrarse"
              type="submit"
              class="btn-neon-outline full-width q-mt-md"
              :loading="loading"
              unelevated
            />
          </q-form>
        </q-tab-panel>
      </q-tab-panels>

      <q-slide-transition>
        <div v-if="errorMsg" class="error-box q-mt-md row items-center bg-red-glass">
          <q-icon name="error_outline" color="red-5" class="q-mr-sm" />
          <span class="text-white text-caption">{{ errorMsg }}</span>
        </div>
      </q-slide-transition>
    </q-card>

    <div class="absolute-bottom text-center q-pb-lg text-grey-7 text-caption">
      &copy; 2025 Nutrogan Technologies | Duarte Fabricio | Ascona Enzo | Amarilla Sebastián
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from 'stores/auth-store'
import { useRouter } from 'vue-router'
// Importamos los componentes visuales nuevos
import InteractiveBackground from 'components/login/InteractiveBackground.vue'
import InteractiveLogo from 'components/login/InteractiveLogo.vue'

const tab = ref('login')
const loading = ref(false)
const errorMsg = ref(null)
const showPassword = ref(false)

const form = reactive({
  email: '',
  password: '',
})

const authStore = useAuthStore()
const router = useRouter()

async function handleLogin() {
  loading.value = true
  errorMsg.value = null
  try {
    await authStore.login(form)
    // CORRECCIÓN AQUÍ: Redirigir a /welcome
    router.push('/welcome')
  } catch (error) {
    errorMsg.value = 'Credenciales incorrectas o error de conexión.'
    console.error(error)
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  loading.value = true
  errorMsg.value = null
  try {
    await authStore.signUp(form)
    // CORRECCIÓN AQUÍ: Redirigir a /welcome
    router.push('/welcome')
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
/* --- 1. CONTENEDOR PRINCIPAL --- */
.login-container {
  min-height: 100vh;
  background-color: #050505;
  /* Fondo base texturizado */
  background-image: url('src/assets/nutrogan-bg.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
}

/* --- 3. GLOW AMBIENTAL (Respiración) --- */
.ambient-glow {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(0, 55, 255, 0.15) 0%, transparent 70%);
  filter: blur(100px);
  z-index: 0;
  pointer-events: none;
  animation: breath 8s infinite ease-in-out;
}

@keyframes breath {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.8;
  }
}

/* --- 4. TARJETA GLASS --- */
.login-card {
  width: 100%;
  max-width: 400px;
  padding: 32px;
  border-radius: 24px;
  z-index: 1;

  /* Efecto Cristal Avanzado */
  background: rgba(20, 20, 25, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

/* Efecto Hover sutil en la tarjeta */
.login-card:hover {
  border-color: rgba(57, 255, 20, 0.3);
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.7),
    0 0 20px rgba(57, 255, 20, 0.1);
}

/* --- 5. LOGO Y TABS --- */
.logo-container {
  display: inline-block;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.nav-tabs {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 4px;
}

:deep(.q-tab) {
  border-radius: 8px;
  font-weight: 600;
  text-transform: none;
  transition: all 0.3s;
}

:deep(.q-tab--active) {
  background: $primary; /* Verde Neón */
  color: #000;
  box-shadow: 0 4px 15px rgba(57, 255, 20, 0.4);
}

/* --- 6. INPUTS MODERNOS --- */
.input-pro {
  font-weight: 500;
}
/* Override de Quasar para inputs */
:deep(.q-field__control) {
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.4) !important;
  transition: all 0.3s;
}
:deep(.q-field--outlined .q-field__control:before) {
  border-color: rgba(255, 255, 255, 0.1);
}
:deep(.q-field--outlined.q-field--focused .q-field__control:after) {
  border-color: $primary;
  border-width: 2px;
  box-shadow: 0 0 15px rgba(57, 255, 20, 0.2);
}

/* --- 7. BOTONES --- */
.btn-neon {
  background: linear-gradient(135deg, $primary 0%, #32cd32 100%);
  color: #000;
  font-weight: 800;
  font-size: 1rem;
  border-radius: 12px;
  padding: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 0 25px rgba(57, 255, 20, 0.5);
    transform: translateY(-2px) scale(1.01);
  }
}

.btn-neon-outline {
  background: transparent;
  border: 2px solid $primary;
  color: $primary;
  font-weight: 700;
  font-size: 1rem;
  border-radius: 12px;
  padding: 12px;
  transition: all 0.3s;

  &:hover {
    background: rgba(57, 255, 20, 0.1);
    box-shadow: 0 0 20px rgba(57, 255, 20, 0.2);
  }
}

/* --- 8. UTILIDADES --- */
.tracking-wide {
  letter-spacing: 1px;
}
.hover-text-primary:hover {
  color: $primary !important;
}
.transition-color {
  transition: color 0.3s;
}

.error-box {
  border: 1px solid rgba(255, 0, 0, 0.3);
  padding: 12px;
  border-radius: 8px;
}
.bg-red-glass {
  background: rgba(255, 0, 0, 0.15);
  backdrop-filter: blur(5px);
}
</style>
