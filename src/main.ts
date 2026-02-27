import { createPinia } from 'pinia'
import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { vLazy } from './directives/vLazy'
import routes from './router'
import { configureProgress, setupRouterGuards } from './router/guards'
import { normalizeCurrentPath, setupImportErrorHandler } from './router/utils/import-error-handler'
import { queueScroll } from './router/utils/scroll'
import './styles/reset.scss'

export const createApp = ViteSSG(
  App,
  {
    routes,
    base: import.meta.env.BASE_URL,
    scrollBehavior(_to, _from, savedPosition) {
      queueScroll(savedPosition)
      return false
    },
  },
  async ({ app, router, isClient }) => {
    app.use(createPinia())
    app.directive('lazy', vLazy)

    if (!isClient) return
    configureProgress()
    normalizeCurrentPath()
    setupImportErrorHandler()
    await setupRouterGuards(router)
  },
)
