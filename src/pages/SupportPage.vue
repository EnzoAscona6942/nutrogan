<template>
  <q-page padding class="dashboard-pro-bg text-white column">
    <div class="row items-center justify-between q-mb-md">
      <div class="page-title-box" style="margin-bottom: 0">Centro de Ayuda</div>
      <q-btn flat round dense icon="arrow_back" @click="$router.back()" />
    </div>

    <div class="row q-col-gutter-lg col-grow" style="padding-bottom: 100px">
      <div class="col-12 col-md-5 column q-gutter-y-md">
        <q-card flat class="glass-panel q-pa-md text-center">
          <q-icon name="support_agent" size="5em" color="primary" class="q-mb-md" />
          <div class="text-h5 text-weight-bold">¿Necesitas ayuda?</div>
          <p class="text-grey-4 q-mt-sm">
            Usa nuestro chat inteligente para respuestas inmediatas o contacta a un especialista.
          </p>
        </q-card>

        <q-card flat class="glass-panel q-pa-md col-grow column justify-center">
          <div class="q-gutter-y-md full-width">
            <q-btn
              outline
              color="primary"
              class="full-width q-py-md"
              icon="whatsapp"
              label="Soporte Humano (WhatsApp)"
              href="https://wa.me/5493704022201"
              target="_blank"
            />

            <q-btn
              outline
              color="white"
              class="full-width q-py-md"
              icon="menu_book"
              label="Manual de Usuario"
              to="/about"
            />

            <q-btn
              flat
              color="grey-5"
              class="full-width"
              icon="mail"
              label="Enviar Email"
              href="mailto:soporte@nutrogan.com"
            />
          </div>
        </q-card>
      </div>

      <div class="col-12 col-md-7" style="min-height: 500px">
        <SupportChatbot />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import SupportChatbot from 'src/components/support/SupportChatbot.vue'
</script>

<style lang="scss" scoped>
.dashboard-pro-bg {
  background-image: url('src/assets/nutrogan-bg4.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
}

.page-title-box {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.glass-panel {
  background: rgba(20, 20, 25, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}
</style>
