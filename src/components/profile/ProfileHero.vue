<template>
  <q-card class="profile-card column no-shadow full-height relative-position overflow-hidden">
    <div class="card-header relative-position">
      <div class="brand-accent"></div>
      <q-btn
        flat
        round
        dense
        icon="logout"
        color="white"
        class="absolute-top-right q-ma-md z-10 opacity-hover"
        @click="confirmarSalida"
      >
        <q-tooltip>Cerrar Sesión</q-tooltip>
      </q-btn>
    </div>

    <q-card-section
      class="column items-center relative-position col-grow"
      style="margin-top: -50px"
    >
      <div class="avatar-wrapper q-mb-md relative-position">
        <q-avatar size="110px" class="profile-avatar shadow-5">
          <img
            :src="currentAvatarUrl"
            style="object-fit: cover; background: #000"
            @error="onAvatarError"
          />
        </q-avatar>
        <q-btn
          round
          color="grey-9"
          text-color="white"
          icon="camera_alt"
          size="xs"
          class="edit-badge"
          @click="triggerFilePicker"
        />
      </div>

      <div class="text-center full-width q-px-md">
        <div class="editable-input-wrapper q-mb-xs">
          <input
            v-model="profile.nombre_completo"
            class="text-h6 font-modern text-white text-center bg-transparent no-border full-width ellipsis"
            placeholder="Tu Nombre"
            @blur="saveChanges"
          />
          <q-icon name="edit" size="12px" color="grey-6" class="edit-icon" />
        </div>

        <div class="row justify-center items-center q-gutter-x-sm q-mb-md">
          <q-badge color="primary" text-color="black" class="text-weight-bold">
            {{ (profile.rol || 'ADMINISTRADOR').toUpperCase() }}
          </q-badge>
          <span class="text-caption text-grey-6">|</span>
          <span class="text-caption text-grey-5">Plan PRO</span>
        </div>
      </div>

      <q-separator dark class="full-width q-my-md opacity-20" />

      <div class="full-width q-px-lg q-gutter-y-md">
        <div class="info-row">
          <div class="text-caption text-grey-5 q-mb-xs">Teléfono / Móvil</div>
          <q-input
            v-model="profile.telefono"
            dense
            borderless
            class="input-clean text-body2"
            placeholder="Sin asignar"
            color="primary"
            @blur="saveChanges"
          >
            <template v-slot:prepend><q-icon name="phone" size="xs" color="primary" /></template>
          </q-input>
        </div>

        <div class="info-row">
          <div class="text-caption text-grey-5 q-mb-xs">Cuenta de Acceso</div>
          <div class="row items-center q-py-xs text-grey-3">
            <q-icon name="mail" size="xs" color="grey-6" class="q-mr-sm" />
            <div class="ellipsis" style="font-size: 0.9rem">{{ authStore.user?.email }}</div>
          </div>
        </div>
      </div>
    </q-card-section>

    <div class="bg-dark-lighter q-py-sm q-px-md text-center">
      <div class="text-caption text-grey-7" style="font-size: 0.7rem">
        Miembro desde {{ memberSince }}
      </div>
    </div>

    <q-file
      ref="fileInput"
      v-model="avatarFile"
      accept="image/*"
      class="hidden"
      @update:model-value="uploadAvatar"
    />
  </q-card>
</template>

<script setup>
// Agregamos 'watch' a los imports
import { ref, reactive, computed, watch } from 'vue'
import { useAuthStore } from 'stores/auth-store'
import { useQuasar } from 'quasar'
import { supabase } from 'boot/supabase'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const $q = useQuasar()
const router = useRouter()

const fileInput = ref(null)
const avatarFile = ref(null)
const profile = reactive({ nombre_completo: '', telefono: '', avatar_url: '', rol: '' })
const imgError = ref(false)

const memberSince = computed(() => {
  if (authStore.user?.created_at) {
    return new Date(authStore.user.created_at).toLocaleDateString('es-ES', {
      month: 'short',
      year: 'numeric',
    })
  }
  return '---'
})

const currentAvatarUrl = computed(() => {
  if (imgError.value || !profile.avatar_url) {
    return `https://ui-avatars.com/api/?name=${profile.nombre_completo || 'User'}&background=1d1d1d&color=fff&size=128`
  }
  return profile.avatar_url
})

function onAvatarError() {
  imgError.value = true
}
function triggerFilePicker() {
  fileInput.value.pickFiles()
}

async function saveChanges() {
  try {
    await supabase
      .from('perfiles_usuarios')
      .update({
        nombre_completo: profile.nombre_completo,
        telefono: profile.telefono,
      })
      .eq('id', authStore.user.id)
    $q.notify({ type: 'positive', message: 'Datos actualizados', icon: 'check', timeout: 1000 })
  } catch (e) {
    console.error(e)
  }
}

async function uploadAvatar(file) {
  if (!file) return

  // 1. Crear notificación de CARGA (timeout: 0 para que no se vaya sola)
  // Guardamos la referencia en 'notif'
  const notif = $q.notify({
    type: 'ongoing',
    message: 'Subiendo foto...',
    spinner: true,
    timeout: 0, // Se queda fija hasta que la actualicemos
  })

  try {
    // 1. Extraer la extensión
    const fileExt = file.name.split('.').pop()

    // 2. Crear nombre único
    const fileName = `avatar-${authStore.user.id}-${Date.now()}.${fileExt}`

    // 3. Subir
    const { error } = await supabase.storage.from('avatars').upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) throw error

    // 4. Obtener URL pública
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)

    // 5. Guardar URL en base de datos
    await supabase
      .from('perfiles_usuarios')
      .update({ avatar_url: data.publicUrl })
      .eq('id', authStore.user.id)

    profile.avatar_url = data.publicUrl
    imgError.value = false

    // 2. ACTUALIZAR la notificación existente a ÉXITO
    notif({
      type: 'positive',
      message: 'Foto actualizada correctamente',
      spinner: false,
      icon: 'check',
      timeout: 2500, // Ahora sí le damos tiempo para irse sola
    })
  } catch (e) {
    console.error(e)
    const msg =
      e.statusCode === '400'
        ? 'Error de formato o permisos (400). Verifica el bucket "avatars".'
        : 'Error al subir la imagen: ' + e.message

    // 3. ACTUALIZAR la notificación existente a ERROR
    notif({
      type: 'negative',
      message: msg,
      spinner: false,
      icon: 'error',
      timeout: 4000,
    })
  } finally {
    avatarFile.value = null
  }
}

function confirmarSalida() {
  $q.dialog({
    title: 'Cerrar Sesión',
    message: '¿Estás seguro?',
    cancel: true,
    persistent: true,
    dark: true,
    ok: { label: 'Salir', flat: true },
  }).onOk(async () => {
    await authStore.logout()
    router.push('/login')
  })
}

// Observador para cargar datos cuando estén listos (Persistencia al recargar)
watch(
  () => authStore.profile,
  (newProfile) => {
    if (newProfile) {
      Object.assign(profile, newProfile)
    }
  },
  { immediate: true, deep: true },
)
</script>

<style scoped lang="scss">
.profile-card {
  background: #121214; /* Gris muy oscuro, no negro total */
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.card-header {
  height: 100px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* Acento de Marca sutil */
.brand-accent {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #39ff14, transparent);
  opacity: 0.8;
}

.profile-avatar {
  border: 4px solid #121214; /* Se funde con el fondo */
  background: #222;
}

.edit-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  border: 2px solid #121214;
}

/* Estilo Inputs Limpios */
.input-clean :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 0 8px;
}
.input-clean:hover :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.08);
}
.input-clean :deep(.q-field__native) {
  color: white;
}

.editable-input-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  input {
    outline: none;
    transition: color 0.2s;
  }
  input:focus {
    color: #39ff14;
  }
  .edit-icon {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    opacity: 0;
    transition: opacity 0.2s;
  }
  &:hover .edit-icon {
    opacity: 1;
  }
}

.bg-dark-lighter {
  background: rgba(255, 255, 255, 0.03);
}
.opacity-20 {
  opacity: 0.2;
}
.opacity-hover {
  opacity: 0.6;
  transition: opacity 0.2s;
  &:hover {
    opacity: 1;
  }
}

.font-modern {
  font-family: 'Outfit', sans-serif;
}
</style>
