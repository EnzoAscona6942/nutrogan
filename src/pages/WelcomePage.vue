<template>
  <div class="fullscreen bg-black overflow-hidden flex flex-center">
    <transition name="fade">
      <div v-if="showVideo" class="video-container absolute-full">
        <video
          ref="videoRef"
          class="absolute-full fit"
          autoplay
          muted
          playsinline
          style="object-fit: cover"
          @ended="irAlDashboard"
        >
          <source src="/videos/welcome.mp4" type="video/mp4" />
        </video>

        <div class="overlay absolute-full"></div>

        <div class="absolute-bottom-right q-ma-lg" style="z-index: 20">
          <q-btn
            flat
            color="white"
            label="Saltar"
            icon-right="skip_next"
            @click="irAlDashboard"
            class="glass-btn"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const videoRef = ref(null)
const showVideo = ref(true)

function irAlDashboard() {
  // Ocultar video (inicia transición fade out)
  showVideo.value = false

  // Esperar brevemente y redirigir
  setTimeout(() => {
    router.replace('/')
  }, 500)
}

onMounted(() => {
  // Forzar reproducción segura
  if (videoRef.value) {
    videoRef.value.play().catch((err) => {
      console.warn('Autoplay bloqueado, redirigiendo...', err)
      irAlDashboard()
    })
  }
})
</script>

<style scoped>
.overlay {
  background: rgba(0, 0, 0, 0.3);
}

.text-shadow {
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
}

.glass-btn {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  padding: 8px 20px;
}

/* Animación de entrada del texto */
.fade-in-text {
  animation: fadeIn 2s ease-in;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Transición de salida (Fade Out) */
.fade-leave-active {
  transition: opacity 0.8s ease;
}
.fade-leave-to {
  opacity: 0;
}
</style>
