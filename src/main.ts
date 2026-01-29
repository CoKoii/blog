import { createPinia } from 'pinia'
import App from './App.vue'
import routes from './router'
import { ViteSSG } from 'vite-ssg'
import './styles/reset.scss'
import { vLazy } from './directives/vLazy'
import { queueScroll } from './router/scroll'
import { resolvePostIdBySlug, preloadPostContent } from '@/utils/posts'

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
  async ({ app, router, isClient }) => {
    app.use(createPinia())
    app.directive('lazy', vLazy)

    if (isClient) {
      const resolved = router.resolve(window.location.pathname)
      if (resolved.name === 'article') {
        const category = String(resolved.params.category || '')
        const slug = String(resolved.params.id || '')
        const id = resolvePostIdBySlug(category, slug)
        if (id) {
          await preloadPostContent(id)
        }
      }

      router.beforeResolve(async (to) => {
        if (to.name !== 'article') return true
        const category = String(to.params.category || '')
        const slug = String(to.params.id || '')
        const id = resolvePostIdBySlug(category, slug)
        if (id) {
          await preloadPostContent(id)
        }
        return true
      })
    }
  },
)
