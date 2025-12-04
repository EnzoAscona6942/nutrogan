# 🐮 NUTROGAN: Gestión Ganadera Inteligente (Offline-First)

![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Estado](https://img.shields.io/badge/Status-MVP%20Finalizado-success?style=for-the-badge)

## Trabajo Final Integrador (TFI)

Tecnicatura Universitaria en Programación - UTN FRR (Extensión Áulica Formosa)  
Comisión: 2.2 | Año: 2025

## 📋 Ficha del Proyecto

| Rol                  | Estudiante                  | Legajo | Responsabilidades Principales                  |
| -------------------- | --------------------------- | ------ | ---------------------------------------------- |
| Tech Lead / Frontend | Duarte, Fabricio Nicolás    | 29.154 | Arquitectura PWA, UX/UI, Lógica Offline.       |
| Backend / Data       | Ascona, Enzo Ariel          | 29.134 | Base de Datos, Seguridad (RLS), Pinia Stores.  |
| DevOps / QA          | Amarilla, Sebastián Emanuel | 29.132 | Docker, CI/CD Pipelines, Testing Automatizado. |

**Docentes:** Facundo Verón / Eduardo Roig  
**Asignaturas:** Metodología de Sistemas II - TFI - Programación IV - Gestión de Desarrollo de Software - Análisis de Datos.

## 📖 Descripción del Producto

NUTROGAN es una plataforma Progressive Web App (PWA) diseñada para solucionar la problemática de la "gestión a ciegas" en la ganadería del NEA. Debido a la baja conectividad en zonas rurales, los sistemas en la nube tradicionales fallan.

Nutrogan implementa una arquitectura Offline-First: permite al productor registrar pesos, movimientos de lotes y estados de recursos hídricos sin conexión a internet. Los datos se persisten localmente (IndexedDB) y se sincronizan automáticamente con la nube (Supabase) cuando se recupera la conectividad.

### Funcionalidades Clave

- 📱 **100% Offline:** Funciona en potreros sin señal 4G.
- 📊 **Cálculo de GDPV:** Métricas automáticas de Ganancia Diaria de Peso Vivo.
- 🗺️ **GIS Integrado:** Mapas satelitales interactivos de potreros.
- 💧 **Monitor de Recursos:** Alertas de estado de aguadas y stock de insumos.
- 🔐 **Seguridad:** Roles diferenciados (Admin, Veterinario, Peón).

## 🛠 Stack Tecnológico

La solución se construye sobre un stack moderno y escalable:

- **Frontend:** Vue.js 3 (Composition API) + Quasar Framework (Vite).
- **Estado & Persistencia:** Pinia + pinia-plugin-persistedstate (IndexedDB Wrapper).
- **Backend as a Service (BaaS):** Supabase (PostgreSQL 15, Auth, Storage).
- **Mapas:** Leaflet.js (OpenStreetMap/Esri Satellite).
- **Calidad (QA):** Vitest (Unit Testing) + Cypress (E2E Testing).
- **Infraestructura:** Docker (Multi-stage builds) + GitLab CI/CD.

## 🔄 Metodología y Flujo de Trabajo (GitFlow)

Para garantizar la estabilidad del código en un equipo distribuido, implementamos estrictamente el flujo de trabajo GitFlow.

### Estructura de Ramas

- **main:** Código de producción. Intocable directamente.
- **develop:** Rama de integración. Aquí convergen las features terminadas.
- **feature/\*:** Ramas temporales para cada nueva funcionalidad.
- **hotfix/\*:** Parches urgentes para producción.

### Ejemplo Real de Aplicación: "Alertas de Agua"

1. **Inicio:** Se crea la rama `feature/smart-water-alert` desde `develop`.
2. **Desarrollo:** Se codifica el componente `SmartWaterCard.vue` y la lógica en `data-store.js`.
3. **Pull Request (MR):** Se abre un Merge Request hacia `develop`. El CI ejecuta tests automáticos.
4. **Merge:** Tras la aprobación (Code Review), se fusiona a `develop`. La rama feature se elimina.

## 📐 Arquitectura y Principios SOLID

El código fuente ha sido auditado para cumplir con principios de diseño robustos, evitando "code smells".

### 1. Single Responsibility Principle (SRP)

Separamos estrictamente la Presentación (UI) de la Lógica de Negocio.

- **Violación (Mal):** Un componente `.vue` que calcula promedios y llama a la API directamente.
- **En Nutrogan (Bien):**
  - `SmartWaterCard.vue`: Solo se encarga de mostrar el color rojo si el estado es "Peligro".
  - `useDataStore.js`: Contiene la lógica matemática para decidir qué es "Peligro" y la conexión a la BD.

### 2. Open/Closed Principle (OCP)

Componentes abiertos a la extensión, cerrados a la modificación.

**Ejemplo:** Los componentes base (ej. `BaseCard.vue`) utilizan Slots de Vue. Esto permite inyectar contenido nuevo (botones, gráficos) sin tocar el código fuente del componente original, evitando regresiones.

### 3. Dependency Inversion Principle (DIP)

Los componentes de alto nivel no dependen de implementaciones de bajo nivel (como la librería `supabase-js`), sino de abstracciones (Stores).

**Beneficio:** Esto nos permite realizar Mocking en los tests. En `SmartWaterCard.test.js`, inyectamos un Store falso para probar la UI sin necesitar una base de datos real.

## 🗃 Diccionario de Datos (Modelo Relacional)

El backend utiliza PostgreSQL. A continuación se describen las entidades críticas del negocio.

### Diagrama Entidad-Relación

```mermaid
erDiagram
    establecimientos ||--o{ perfiles_usuarios : tiene
    establecimientos ||--o{ potreros : contiene
    establecimientos ||--o{ fuentes_de_agua : tiene
    establecimientos ||--o{ alimentos : almacena
    establecimientos ||--o{ dietas : define
    establecimientos ||--o{ categorias_zootecnicas : clasifica
    establecimientos ||--o{ lotes : maneja
    establecimientos ||--o{ registros_lluvia : registra
    establecimientos ||--o{ equipo_trabajo : emplea
    establecimientos ||--o{ inventario_items : gestiona
    establecimientos ||--o{ notificaciones_programadas : genera

    potreros ||--o{ fuentes_de_agua : contiene
    potreros ||--o{ lotes : aloja
    potreros ||--o{ movimientos_de_lotes : registra

    fuentes_de_agua ||--o{ analisis_de_agua : tiene

    alimentos ||--o{ dietas_items : compone
    alimentos ||--o{ consumos_de_dieta : consume

    dietas ||--o{ dietas_items : contiene
    dietas ||--o{ consumos_de_dieta : asigna

    categorias_zootecnicas ||--o{ lotes : clasifica

    lotes ||--o{ evaluaciones : recibe
    lotes ||--o{ movimientos_de_lotes : realiza
    lotes ||--o{ eventos_sanitarios : registra
    lotes ||--o{ eventos_reproductivos : registra
    lotes ||--o{ consumos_de_dieta : consume
    lotes ||--o{ inventario_movimientos : utiliza

    inventario_items ||--o{ inventario_movimientos : registra

```

### EJEMPLOS DE TABLAS

### Tabla: lotes

Agrupación lógica de animales para manejo colectivo.

| Campo              | Tipo    | Restricción | Descripción                                    |
| ------------------ | ------- | ----------- | ---------------------------------------------- |
| id                 | UUID    | PK          | Identificador único del lote.                  |
| establecimiento_id | UUID    | FK          | Vinculación con el campo/finca (Multi-tenant). |
| nombre             | VARCHAR | NOT NULL    | Etiqueta legible (ej. "Terneros 2025").        |
| cantidad_animales  | INT     | Check > 0   | Cantidad actual de cabezas.                    |
| gdpv_promedio      | DECIMAL | -           | Campo computado (cache) de ganancia diaria.    |

### Tabla: recursos_agua

Puntos de monitoreo hídrico.

| Campo            | Tipo        | Restricción | Descripción                         |
| ---------------- | ----------- | ----------- | ----------------------------------- |
| id               | UUID        | PK          | Identificador de la aguada.         |
| tipo             | ENUM        | -           | 'Tanque', 'Represa', 'Bebedero'.    |
| capacidad_litros | INT         | -           | Capacidad máxima de almacenamiento. |
| ultimo_estado    | VARCHAR     | -           | 'Optimo', 'Precaución', 'Peligro'.  |
| fecha_medicion   | TIMESTAMPTZ | -           | Fecha de la última toma de muestra. |

## 🚀 Instalación y Despliegue

### Requisitos Previos

- Node.js v18+
- Docker & Docker Compose (Opcional, para prod)
- Cuenta en Supabase (o usar mocks locales)

### 1. Desarrollo Local

```bash
# Clonar el repositorio

git clone https://gitlab.com/fabricioduarte/nutrogan.git
cd nutrogan

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus keys de Supabase (URL y ANON_KEY)

# Iniciar servidor de desarrollo (Hot Reload)
quasar dev
2. Ejecución con Docker (Producción)
Simula el entorno de producción servido por Nginx.

Copiar
# Construir y levantar contenedores
docker-compose up --build -d

# Acceder a la app

# La aplicación estará disponible en http://localhost:8080

✅ Testing y Calidad
Ejecutamos una pirámide de pruebas completa antes de cada integración.

Unit Testing (Vitest)
Prueba la lógica de negocio (cálculos financieros, validaciones) y componentes aislados.

Copiar
# Ejecutar tests unitarios
npm run test:unit

# Ver reporte de cobertura
npm run test:coverage
E2E Testing (Cypress)
Simula un usuario real navegando por la aplicación (Login, Carga de datos).

Copiar
# Abrir interfaz de Cypress
npm run test:e2e

```

📄 Licencia
Este proyecto es de carácter académico para la Universidad Tecnológica Nacional.

Distribuido bajo la licencia MIT.
#   n u t r o g a n  
 