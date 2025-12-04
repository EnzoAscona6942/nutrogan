<template>
  <q-page padding class="dashboard-pro-bg text-white font-modern">
    <div class="row justify-center q-mb-xl q-pt-md">
      <div class="col-12 col-lg-8 text-center relative-position">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="white"
          to="/about"
          class="absolute-left lt-md"
          style="top: 0; left: 0"
        />
        <q-btn
          flat
          icon="arrow_back"
          label="Volver"
          color="white"
          to="/about"
          class="absolute-left gt-sm btn-hover-effect"
          style="top: 10px; left: 0"
          no-caps
        />

        <div class="q-mt-md">
          <q-badge
            outline
            color="primary"
            class="q-mb-md text-weight-bold tracking-wide q-px-sm q-py-xs"
          >
            INNOVACIÓN EN EL SECTOR GANADERO
          </q-badge>
          <h1 class="text-display q-my-sm text-shadow">
            Arquitectura de <span class="text-primary text-weight-bold">Visión Artificial</span>
          </h1>
          <p
            class="text-h6 text-weight-light text-grey-4 q-mt-md q-mx-auto"
            style="max-width: 700px"
          >
            Ingeniería de inferencia neuronal optimizada para el borde (Edge Computing).
          </p>
        </div>
      </div>
    </div>

    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <q-card class="glass-card q-pa-xl q-mb-xl text-center">
          <div class="row justify-center q-mb-md">
            <div class="icon-halo">
              <q-icon name="cloud_off" size="3em" color="white" />
            </div>
          </div>
          <h2 class="text-h4 text-weight-bold q-mb-md">El Desafío: Sin Nube, Sin Latencia</h2>
          <p class="text-body1 text-grey-3 q-mx-auto" style="max-width: 800px; line-height: 1.8">
            La ganadería extensiva ocurre lejos de la fibra óptica. Depender de servidores remotos
            para procesar video es inviable. Nutrogan traslada el "cerebro" al dispositivo,
            ejecutando redes neuronales profundas directamente en la GPU del teléfono mediante
            <strong>TensorFlow.js</strong> y aceleración <strong>WebGL</strong>.
          </p>
        </q-card>

        <div class="q-mb-xl">
          <div class="row justify-center items-center q-mb-lg">
            <q-icon name="account_tree" color="primary" size="md" class="q-mr-sm" />
            <span class="text-h5 text-weight-bold">Pipeline de Datos</span>
          </div>

          <div class="pipeline-diagram glass-panel-dark q-pa-xl">
            <div class="pipeline-track">
              <div class="p-node">
                <div class="p-icon-box border-gradient-blue">
                  <q-icon name="videocam" color="white" />
                </div>
                <div class="p-label text-white">Input Stream</div>
                <div class="p-sub">RGBA Video</div>
              </div>

              <div class="p-connector">
                <div class="data-packet"></div>
                <div class="line"></div>
              </div>

              <div class="p-node">
                <div class="p-icon-box border-gradient-cyan">
                  <q-icon name="transform" color="white" />
                </div>
                <div class="p-label text-white">Pre-Proceso</div>
                <div class="p-sub">Resize 224px</div>
              </div>

              <div class="p-connector">
                <div class="data-packet delay-1"></div>
                <div class="line"></div>
              </div>

              <div class="p-node main">
                <div class="p-icon-box border-gradient-primary pulse-shadow bg-primary-low">
                  <q-icon name="psychology" color="primary" />
                </div>
                <div class="p-label text-primary text-uppercase">Inferencia</div>
                <div class="p-sub text-white">MobileNet V2</div>
              </div>

              <div class="p-connector">
                <div class="data-packet delay-2"></div>
                <div class="line"></div>
              </div>

              <div class="p-node">
                <div class="p-icon-box border-gradient-lime">
                  <q-icon name="data_object" color="white" />
                </div>
                <div class="p-label text-white">Tensores</div>
                <div class="p-sub">[Score, Box]</div>
              </div>
            </div>
          </div>
        </div>

        <div class="row q-col-gutter-lg q-mb-xl">
          <div class="col-12 col-sm-6">
            <q-card class="tech-spec-card glass-card text-center q-pa-lg full-height">
              <div class="text-overline text-primary q-mb-sm">ARQUITECTURA</div>
              <div class="text-h3 text-white font-numeric text-weight-light">SSD</div>
              <div class="text-subtitle1 text-white">Single Shot Detector</div>
              <p class="text-body2 text-grey-4 q-mt-md">
                Elegimos SSD sobre YOLO por ser <strong>3x más ligero</strong> en móviles,
                sacrificando menos del 2% de precisión.
              </p>
            </q-card>
          </div>
          <div class="col-12 col-sm-6">
            <q-card class="tech-spec-card glass-card text-center q-pa-lg full-height">
              <div class="text-overline text-primary q-mb-sm">CUANTIZACIÓN</div>
              <div class="text-h3 text-white font-numeric text-weight-light">INT8</div>
              <div class="text-subtitle1 text-white">Peso: 2.4 MB</div>
              <p class="text-body2 text-grey-4 q-mt-md">
                Redujimos los pesos de 32-bit a 8-bit. El modelo carga instantáneamente incluso en
                redes 4G inestables.
              </p>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <div class="row justify-center q-mt-xl q-pb-xl">
      <div class="col-12 col-lg-8 text-center">
        <q-separator dark class="separator-glow q-mb-lg" />
        <div class="text-caption text-grey-5 font-mono"></div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
// Página estática
</script>

<style lang="scss" scoped>
/* --- FUENTE OUTFIT --- */
.font-modern {
  font-family: 'Outfit', sans-serif;
}
.font-numeric {
  font-family: 'Outfit', sans-serif;
  font-feature-settings: 'tnum';
}
.text-display {
  font-size: 3.5rem;
  line-height: 1.1;
  letter-spacing: -1px;
  font-weight: 100;
}
.font-mono {
  font-family: 'Fira Code', 'Courier New', monospace;
}
.text-shadow {
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}
.tracking-wide {
  letter-spacing: 1.5px;
}

/* --- FONDO --- */
.dashboard-pro-bg {
  background-color: #050505;
  background-image:
    radial-gradient(at 0% 0%, rgba(57, 255, 20, 0.08) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(0, 55, 255, 0.08) 0px, transparent 50%),
    url('src/assets/nutrogan-bg3.png');
  background-size: cover;
  background-attachment: fixed;
  min-height: 100vh;
}

/* --- TARJETAS GLASS --- */
.glass-card {
  background: rgba(20, 20, 25, 0.6);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
.glass-panel-dark {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
}
.icon-halo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* --- TECH SPECS --- */
.tech-spec-card {
  transition: all 0.3s;
  &:hover {
    border-color: rgba(57, 255, 20, 0.3);
    transform: translateY(-5px);
  }
}

/* --- PIPELINE DIAGRAM ANIMADO (ESTILO PRO) --- */
.pipeline-diagram {
  overflow-x: auto;
  /* Scroll oculto pero funcional */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.pipeline-track {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 600px; /* Asegura que no se rompa en móvil */
  padding: 20px 0;
}

.p-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  z-index: 2;

  &.main {
    transform: scale(1.1);
  }
}

.p-icon-box {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #111;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 12px;
  font-size: 1.8rem;
  transition: all 0.3s ease;
}

.p-label {
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 4px;
}
.p-sub {
  font-size: 0.75rem;
  font-family: 'Fira Code', monospace;
  color: #888;
}

/* Colores Específicos (Paleta Nutrogan) */
.border-gradient-blue {
  border-color: #0037ff;
  box-shadow: 0 0 15px rgba(0, 55, 255, 0.2);
} /* Azul Eléctrico */
.border-gradient-cyan {
  border-color: #00ffff;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
} /* Cian */
.border-gradient-primary {
  border-color: #39ff14;
  box-shadow: 0 0 30px rgba(57, 255, 20, 0.4);
} /* Verde Neón */
.border-gradient-lime {
  border-color: #8cff00;
  box-shadow: 0 0 15px rgba(204, 255, 0, 0.2);
} /* Lima */

.bg-primary-low {
  background: rgba(57, 255, 20, 0.1);
}
.pulse-shadow {
  animation: pulse-green 2s infinite;
}

/* CONECTORES Y ANIMACIÓN DE DATOS */
.p-connector {
  flex-grow: 1;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 20px;
  position: relative;
  top: -35px; /* Alineado con el centro de los iconos */
}

.data-packet {
  position: absolute;
  top: -3px;
  left: 0;
  width: 20px;
  height: 8px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 0 10px white;
  animation: flow 2s infinite linear;
}

.delay-1 {
  animation-delay: 0.6s;
  background: #00ffff;
  box-shadow: 0 0 10px #00ffff;
}
.delay-2 {
  animation-delay: 1.2s;
  background: #39ff14;
  box-shadow: 0 0 10px #39ff14;
}

/* --- ANIMATIONS --- */
@keyframes flow {
  0% {
    left: 0;
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}

@keyframes pulse-green {
  0% {
    box-shadow: 0 0 20px rgba(57, 255, 20, 0.2);
  }
  50% {
    box-shadow: 0 0 40px rgba(57, 255, 20, 0.6);
  }
  100% {
    box-shadow: 0 0 20px rgba(57, 255, 20, 0.2);
  }
}

/* --- FOOTER & UTILIDADES --- */
.separator-glow {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
}
.btn-hover-effect {
  transition: transform 0.2s;
  &:hover {
    transform: translateX(-5px);
  }
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .pipeline-diagram {
    padding: 20px;
  }
  /* En móvil permitimos scroll horizontal */
  .text-display {
    font-size: 2.5rem;
  }
}
</style>
