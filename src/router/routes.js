import { useAuthStore } from 'stores/auth-store'

const routes = [
  // --- RUTA PRINCIPAL (MODO OFICINA/NORMAL - HUD) ---
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('pages/DashboardPage.vue'), meta: { mapPage: true } },
      { path: 'lotes', component: () => import('pages/LotesPage.vue') },
      { path: 'lote/:id', component: () => import('pages/LoteDetailPage.vue') },
      {
        path: 'lote/:id/scan_cc',
        component: () => import('pages/CCScanPage.vue'),
        meta: { requiresAuth: true, mapPage: true },
      },
      { path: 'reportes', component: () => import('pages/ReportesPage.vue') },
      { path: 'recursos', component: () => import('pages/RecursosPage.vue') },
      { path: 'recursos/potreros', component: () => import('pages/PotrerosPage.vue') },
      {
        path: 'recursos/potreros/draw/:id?',
        component: () => import('pages/PotreroDrawPage.vue'),
        meta: { mapPage: true },
      },
      { path: 'recursos/despensa', component: () => import('pages/DespensaPage.vue') },
      { path: 'recursos/agua', component: () => import('pages/AguaPage.vue') },
      { path: 'recursos/lluvias', component: () => import('pages/LluviasPage.vue') },
      {
        path: 'recursos/satelital',
        component: () => import('pages/AnalisisSatelitalPage.vue'),
        meta: { mapPage: true },
      },
      { path: 'profile', component: () => import('pages/ProfilePage.vue') },
      { path: 'about', component: () => import('pages/AboutNutroganPage.vue') },
      { path: 'technology', component: () => import('pages/TechDeepDivePage.vue') },
      { path: 'team', component: () => import('pages/DeveloperTeamPage.vue') },

      // --- NUEVA RUTA DE SOPORTE (Añadida para el botón del header) ---
      { path: 'support', component: () => import('pages/SupportPage.vue') },
    ],
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore()
      if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login')
      } else {
        next()
      }
    },
  },

  // --- NUEVA RUTA PARALELA: MODO CAMPO ---
  {
    path: '/field',
    // Cargamos el Layout de Campo (brutalista, sin videos)
    component: () => import('layouts/FieldLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        // Cargamos el Dashboard de Campo (botones gigantes)
        component: () => import('pages/field/FieldDashboardPage.vue'),
      },
    ],
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) next('/login')
      else next()
    },
  },

  // --- RUTA DE BIENVENIDA ---
  {
    path: '/welcome',
    component: () => import('pages/WelcomePage.vue'),
    meta: { requiresAuth: true },
  },

  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
