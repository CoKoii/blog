import { createPinia } from 'pinia'
import App from './App.vue'
import routes from './router'
import { ViteSSG } from 'vite-ssg'
import './styles/reset.scss'
import { vLazy } from './directives/vLazy'
import { queueScroll } from './router/scroll'

const base = import.meta.env.BASE_URL

export const createApp = ViteSSG(
  App,
  {
    routes,
    base,
    scrollBehavior(_to, _from, savedPosition) {
      queueScroll(savedPosition)
      return false
    },
  },
  ({ app }) => {
    app.use(createPinia())
    app.directive('lazy', vLazy)
  }
)
