<template>
  <div class="fullscreen bg-primary text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">404</div>

      <div class="text-h2" style="opacity: 0.4">Oops. Nada por aquí...</div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="primary"
        unelevated
        to="/"
        label="Ir al Inicio"
        no-caps
      />
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'ErrorNotFound',
})
</script>
