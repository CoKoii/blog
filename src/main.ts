import { createPinia } from 'pinia'
import App from './App.vue'
import routes from './router'
import { ViteSSG } from 'vite-ssg'
import './styles/reset.scss'
import { vLazy } from './directives/vLazy'
import { queueScroll } from './router/scroll'
import { resolvePostIdBySlug, preloadPostContent } from '@/utils/posts'

const base = import.meta.env.BASE_URL
const ROUTER_IMPORT_RELOAD_KEY = '__router_import_reload_path__'
const ROUTER_IMPORT_RELOAD_QUERY_KEY = '__reload'
const DYNAMIC_IMPORT_ERROR_PATTERN =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i

const normalizeReloadPath = (path: string): string => {
  const url = new URL(path, window.location.origin)
  url.searchParams.delete(ROUTER_IMPORT_RELOAD_QUERY_KEY)
  return `${url.pathname}${url.search}${url.hash}`
}

const addReloadQuery = (path: string): string => {
  const url = new URL(path, window.location.origin)
  url.searchParams.set(ROUTER_IMPORT_RELOAD_QUERY_KEY, Date.now().toString())
  return `${url.pathname}${url.search}${url.hash}`
}

const isDynamicImportError = (error: unknown): error is Error =>
  error instanceof Error && DYNAMIC_IMPORT_ERROR_PATTERN.test(error.message)

const getCurrentPath = (): string =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`

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
      const currentPath = getCurrentPath()
      const normalizedCurrentPath = normalizeReloadPath(currentPath)
      if (normalizedCurrentPath !== currentPath) {
        window.history.replaceState(window.history.state, '', normalizedCurrentPath)
      }

      const reloadForDynamicImportError = (error: unknown, targetPath = getCurrentPath()) => {
        const normalizedTargetPath = normalizeReloadPath(targetPath)
        if (sessionStorage.getItem(ROUTER_IMPORT_RELOAD_KEY) === normalizedTargetPath) {
          sessionStorage.removeItem(ROUTER_IMPORT_RELOAD_KEY)
          console.error(
            '[Router] Dynamic import still failed after one reload. Check deployment/cache strategy.',
            error,
          )
          return
        }

        sessionStorage.setItem(ROUTER_IMPORT_RELOAD_KEY, normalizedTargetPath)
        window.location.replace(addReloadQuery(normalizedTargetPath))
      }

      window.addEventListener('vite:preloadError', (event) => {
        event.preventDefault()
        reloadForDynamicImportError(event)
      })

      router.onError((error, to) => {
        if (!isDynamicImportError(error)) return
        reloadForDynamicImportError(error, to?.fullPath || getCurrentPath())
      })

      router.afterEach((to) => {
        if (sessionStorage.getItem(ROUTER_IMPORT_RELOAD_KEY) === normalizeReloadPath(to.fullPath)) {
          sessionStorage.removeItem(ROUTER_IMPORT_RELOAD_KEY)
        }
      })

      const preloadArticleByRoute = async (to: { name?: unknown; params?: Record<string, unknown> }) => {
        if (to.name !== 'article') return
        const category = String(to.params?.category || '')
        const slug = String(to.params?.id || '')
        const id = resolvePostIdBySlug(category, slug)
        if (id) {
          await preloadPostContent(id)
        }
      }

      const resolved = router.resolve(window.location.pathname)
      await preloadArticleByRoute(resolved)

      router.beforeResolve(async (to) => {
        await preloadArticleByRoute(to)
        return true
      })
    }
  },
)
