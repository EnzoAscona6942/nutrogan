{ type: uploaded file fileName: src/components/about/TechFeatureCard.vue fullContent:
<template>
  <div class="feature-card cursor-pointer" :style="{ '--accent-color': color }" @click="openUrl">
    <div class="card-bg"></div>
    <div class="card-content column justify-between full-height">
      <div class="header">
        <div class="icon-container flex flex-center">
          <q-icon :name="icon" size="28px" class="text-white" />
        </div>
        <div class="text-overline text-uppercase q-mt-md opacity-60">{{ subtitle }}</div>
        <div class="text-h5 text-weight-bold leading-tight q-mt-xs">{{ title }}</div>
      </div>

      <div class="body q-mt-md">
        <p class="text-grey-4 text-body2">{{ description }}</p>
      </div>

      <div class="footer text-right">
        <q-icon name="arrow_outward" size="sm" :style="{ color: color }" class="arrow-icon" />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  subtitle: String,
  description: String,
  icon: String,
  color: { type: String, default: '#39ff14' },
  url: { type: String, default: '' },
})

function openUrl() {
  if (props.url) {
    window.open(props.url, '_blank')
  }
}
</script>

<style lang="scss" scoped>
.feature-card {
  position: relative;
  height: 100%;
  border-radius: 24px;
  padding: 2px; /* Espacio para el borde gradiente */
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02));
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    .card-bg {
      opacity: 1;
    }
    .icon-container {
      background-color: var(--accent-color);
      box-shadow: 0 0 20px var(--accent-color);
      border-color: var(--accent-color);
      transform: scale(1.1);

      .q-icon {
        color: #000 !important; /* Icono negro sobre fondo neón */
      }
    }
    .arrow-icon {
      transform: translate(5px, -5px);
    }
  }
}

.card-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255, 255, 255, 0.06),
    transparent 40%
  );
  opacity: 0;
  transition: opacity 0.5s;
  z-index: 0;
}

.card-content {
  position: relative;
  z-index: 1;
  background: rgba(10, 10, 12, 0.6); /* Fondo oscuro base */
  backdrop-filter: blur(20px);
  border-radius: 22px;
  padding: 24px;
  height: 100%;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.icon-container {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.opacity-60 {
  opacity: 0.6;
}
.leading-tight {
  line-height: 1.1;
}
.arrow-icon {
  transition: transform 0.3s ease;
}
</style>
}
