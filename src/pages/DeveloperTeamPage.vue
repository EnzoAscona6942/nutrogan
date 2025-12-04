<template>
  <q-page padding class="dashboard-pro-bg text-white font-modern">
    <div class="text-center q-mb-xl relative-position z-10 q-pt-lg">
      <q-badge
        outline
        color="primary"
        class="q-mb-md text-weight-bold tracking-wide q-px-sm q-py-xs font-mono"
      >
        G.21 • DEVELOPMENT SQUAD
      </q-badge>
      <h1 class="text-display q-my-none text-shadow">
        El Equipo <span class="text-gradient">Nutrogan</span>
      </h1>
      <p class="text-h6 text-weight-light text-grey-4 q-mt-md">
        Ingeniería y desarrollo detrás de la plataforma.
      </p>
    </div>

    <div class="row justify-center q-col-gutter-xl relative-position z-10">
      <div v-for="dev in developers" :key="dev.name" class="col-12 col-md-4">
        <q-card class="team-card glass-panel column items-center text-center">
          <div class="avatar-wrapper q-mt-lg q-mb-md">
            <div
              class="glow-ring"
              :style="{ borderColor: dev.color, boxShadow: `0 0 30px ${dev.color}40` }"
            ></div>
            <q-avatar size="140px" class="dev-avatar">
              <q-img :src="dev.image" :ratio="1" @error="onError(dev)" />
            </q-avatar>
            <div class="role-badge" :style="{ background: dev.color, color: '#000' }">
              {{ dev.code }}
            </div>
          </div>

          <q-card-section class="q-pt-none full-width">
            <div class="text-h5 text-weight-bold q-mb-xs">{{ dev.name }}</div>
            <div
              class="text-subtitle2 font-mono text-grey-4 tracking-wide text-uppercase"
              :style="{ color: dev.color }"
            >
              {{ dev.role }}
            </div>

            <p class="text-body2 text-grey-5 q-mt-md q-px-sm">
              {{ dev.bio }}
            </p>
          </q-card-section>

          <div class="full-width q-px-lg q-pb-lg">
            <div class="social-bar glass-dark">
              <q-btn flat round dense class="social-btn" :href="dev.whatsapp" target="_blank">
                <q-icon name="img:https://api.iconify.design/mdi:whatsapp.svg?color=white" />
                <q-tooltip class="bg-dark text-white">WhatsApp</q-tooltip>
              </q-btn>

              <q-separator vertical dark class="q-mx-sm opacity-20" />

              <q-btn flat round dense class="social-btn" href="#" target="_blank">
                <q-icon name="img:https://api.iconify.design/mdi:linkedin.svg?color=white" />
                <q-tooltip class="bg-dark text-white">LinkedIn</q-tooltip>
              </q-btn>

              <q-separator vertical dark class="q-mx-sm opacity-20" />

              <q-btn flat round dense class="social-btn" href="#" target="_blank">
                <q-icon name="img:https://api.iconify.design/mdi:github.svg?color=white" />
                <q-tooltip class="bg-dark text-white">GitHub</q-tooltip>
              </q-btn>

              <q-separator vertical dark class="q-mx-sm opacity-20" />

              <q-btn flat round dense class="social-btn" href="#" target="_blank">
                <q-icon name="img:https://api.iconify.design/mdi:instagram.svg?color=white" />
                <q-tooltip class="bg-dark text-white">Instagram</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card>
      </div>
    </div>

    <div
      class="text-center q-mt-xl q-pb-xl text-grey-6 font-mono text-caption z-10 relative-position"
    >

    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const developers = ref([
  {
    name: 'Fabricio Duarte',
    role: 'Project Lead / Full Stack',
    code: 'LEAD',
    color: '#39ff14', // Verde Neón
    image: '/images/team/duarte.jpg',
    whatsapp: 'https://wa.me/+5493701234567',
    bio: 'Arquitectura de sistemas y lógica de negocio. Especialista en integración Cloud.',
  },
  {
    name: 'Enzo Ascona',
    role: 'Frontend UI/UX',
    code: 'DEV',
    color: '#39ff14', // Celeste Neón
    image: '/images/team/ascona.jpg',
    whatsapp: 'https://wa.me/+5493701234568',
    bio: 'Diseño de interfaces reactivas y experiencia de usuario Offline-First.',
  },
  {
    name: 'Sebastián Amarilla',
    role: 'Backend & Database',
    code: 'DBA',
    color: '#39ff14', // Púrpura Neón
    image: '/images/team/amarilla.jpg',
    whatsapp: 'https://wa.me/+5493701234569',
    bio: 'Optimización de consultas, seguridad RLS y estructura de datos escalable.',
  },
])

function onError(dev) {
  // Fallback a placeholder si la imagen falla
  dev.image = `https://ui-avatars.com/api/?name=${dev.name}&background=000&color=fff&size=256`
}
</script>

<style lang="scss" scoped>
/* --- FONDO ESTÁNDAR (Igual a Lotes/Recursos) --- */
.dashboard-pro-bg {
  background-image: url('src/assets/nutrogan-bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
}

.z-10 {
  position: relative;
  z-index: 10;
}

/* --- TYPOGRAPHY --- */
.text-display {
  font-size: 3.5rem;
  line-height: 1.1;
  letter-spacing: -2px;
  font-weight: 700;
}
.text-gradient {
  background: linear-gradient(90deg, #39ff14 0%, #00ffff 100%);
  -webkit-background-clip: text;
  background-clip: text; /* <--- Agrega esta línea */
  -webkit-text-fill-color: transparent;
}
.font-mono {
  font-family: 'Fira Code', 'Courier New', monospace;
}
.tracking-wide {
  letter-spacing: 1.5px;
}
.text-shadow {
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

/* --- CARDS --- */
.team-card {
  background: rgba(20, 20, 25, 0.6);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  overflow: visible; /* Para que el badge sobresalga si quisiéramos, o el glow */
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    transform: translateY(-10px);
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(30, 30, 35, 0.8);

    .glow-ring {
      transform: scale(1.1) rotate(180deg);
      opacity: 1;
    }
    .dev-avatar {
      transform: scale(1.05);
    }
  }
}

/* --- AVATAR STYLING --- */
.avatar-wrapper {
  position: relative;
  width: 160px;
  height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.glow-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px dashed; /* Borde punteado estilo técnico */
  opacity: 0.6;
  transition: all 0.5s ease;
}

.dev-avatar {
  border: 4px solid rgba(0, 0, 0, 0.5);
  transition: transform 0.3s ease;
  z-index: 2;
}

.role-badge {
  position: absolute;
  bottom: 0;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 0.75rem;
  font-family: 'Fira Code', monospace;
  z-index: 3;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  border: 2px solid #000;
}

/* --- SOCIAL BAR --- */
.social-bar {
  background: rgba(0, 0, 0, 0.4);
  border-radius: 16px;
  padding: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.social-btn {
  transition: all 0.2s;
  opacity: 0.7;
  &:hover {
    opacity: 1;
    transform: scale(1.2);
    background: rgba(255, 255, 255, 0.1);
  }
}

.opacity-20 {
  opacity: 0.2;
}
.glass-dark {
  background: rgba(0, 0, 0, 0.3);
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .text-display {
    font-size: 2.5rem;
  }
}
</style>
