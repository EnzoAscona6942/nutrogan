<template>
  <div class="news-item cursor-pointer bg-dark">
    <div class="image-wrapper relative-position full-height">
      <q-img :src="image" class="full-height full-width image-zoom" :ratio="1">
        <template v-slot:error>
          <div class="absolute-full flex flex-center bg-grey-9">
            <q-icon name="image" color="grey-7" size="3em" />
          </div>
        </template>

        <div class="absolute-bottom gradient-overlay q-pa-md">
          <div class="row items-center q-mb-xs">
            <q-badge :color="tagColor" :label="tag" class="text-weight-bold q-mr-sm shadow-2" />
            <span class="text-caption text-white text-shadow">{{ date }}</span>
          </div>
          <div class="text-h6 text-weight-bold text-white leading-tight title-hover text-shadow">
            {{ title }}
          </div>
        </div>
      </q-img>
    </div>
  </div>
</template>

<script setup>
defineProps({
  image: String,
  title: String,
  date: String,
  tag: String,
  tagColor: { type: String, default: 'primary' },
})
</script>

<style lang="scss" scoped>
.news-item {
  border-radius: 20px;
  overflow: hidden;
  height: 100%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.4s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);

  &:hover {
    border-color: var(--q-primary);
    transform: translateY(-8px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);

    .image-zoom {
      transform: scale(1.1);
    }
  }
}

.image-wrapper {
  height: 100%;
  overflow: hidden;
}

.image-zoom {
  transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Gradiente más fuerte para garantizar lectura */
.gradient-overlay {
  background: linear-gradient(
    to top,
    #000000 0%,
    rgba(0, 0, 0, 0.8) 60%,
    transparent 100%
  ) !important;
  width: 100%;
  padding-top: 40px; /* Espacio para el fade */
}

.leading-tight {
  line-height: 1.2;
}

.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

/* Asegurar que el texto sea blanco siempre */
.text-white {
  color: #ffffff !important;
}
</style>
