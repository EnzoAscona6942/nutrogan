import { route } from 'quasar/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'stores/auth-store'

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    if (!authStore.user) {
      await authStore.checkAuth()
    }

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

    if (requiresAuth && !authStore.user) {
      next('/login')
    } else if (!requiresAuth && authStore.user && to.path === '/login') {
      next('/')
    } else {
      next()
    }
  })

  return Router
})
