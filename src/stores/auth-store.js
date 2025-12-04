import { defineStore } from 'pinia'
import { supabase } from 'boot/supabase'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)

  // El router usará esto para saber si estás logueado
  const isAuthenticated = computed(() => !!user.value)

  /**
   * Obtiene el perfil del usuario actual desde Supabase.
   * Se llama automáticamente al iniciar sesión o recargar.
   */
  async function fetchProfile() {
    // Obtenemos el ID del usuario desde el state
    const userId = user.value?.id

    if (!userId) {
      profile.value = null
      return
    }

    const { data, error } = await supabase
      .from('perfiles_usuarios')
      // ¡IMPORTANTE! Agregamos 'avatar_url' para que la foto persista al recargar
      .select('establecimiento_id, nombre_completo, rol, telefono, avatar_url')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      profile.value = null
    } else {
      profile.value = data
    }
  }

  /**
   * Actualiza los datos del perfil (Nombre, Teléfono, Avatar, etc.)
   * Llamado desde ProfileHero.vue
   */
  async function updateProfile(profileData) {
    const userId = user.value?.id
    if (!userId) throw new Error('Usuario no autenticado')

    // 'profileData' es el objeto con los campos a cambiar
    const { data, error } = await supabase
      .from('perfiles_usuarios')
      .update(profileData)
      .eq('id', userId)
      .select()

    if (error) {
      console.error('Error updating profile:', error)
      throw error
    }

    // Actualizar el 'profile' local con los nuevos datos para reflejar cambios en la UI
    if (data && data.length > 0) {
      // Fusionamos los datos nuevos con los existentes para no perder nada
      profile.value = { ...profile.value, ...data[0] }
    }
  }

  async function login(credentials) {
    const { data, error } = await supabase.auth.signInWithPassword(credentials)
    if (error) throw error
    user.value = data.user
    await fetchProfile()
    return data
  }

  async function signUp(credentials) {
    const { data, error } = await supabase.auth.signUp(credentials)
    if (error) throw error
    user.value = data.user
    // Esperar un poco para asegurar que el trigger de DB cree el perfil
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await fetchProfile()
    return data
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
    profile.value = null
  }

  async function checkAuth() {
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user || null
    if (user.value) {
      await fetchProfile()
    }
    return user.value
  }

  function handleAuthStateChange() {
    supabase.auth.onAuthStateChange(async (event, session) => {
      user.value = session?.user || null
      if (user.value) {
        await fetchProfile()
      } else {
        profile.value = null
      }
    })
  }

  return {
    user,
    profile,
    isAuthenticated,
    login,
    signUp,
    logout,
    checkAuth,
    handleAuthStateChange,
    fetchProfile,
    updateProfile,
  }
})
