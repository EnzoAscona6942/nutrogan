<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from 'stores/auth-store'

// Cuando el componente principal de la App se "monta" (carga)...
onMounted(async () => {
  const authStore = useAuthStore()
  try {
    // ...intenta chequear si ya existe una sesión en Supabase.
    // Esto llenará authStore.user si el usuario ya estaba logueado.
    await authStore.checkAuth()
  } catch (e) {
    console.error('Error en checkAuth inicial:', e)
  }

  // Una vez que esto se ejecuta, el router guard (de routes.js)
  // ya sabrá si debe ir a /login o a /
})
</script>
