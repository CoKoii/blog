import { preloadPostContent, resolvePostIdBySlug } from '@/utils/posts'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { createPinia } from 'pinia'
import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { vLazy } from './directives/vLazy'
import routes from './router'
import { consumeScroll, queueScroll } from './router/scroll'
import './styles/reset.scss'

const RELOAD_KEY = '__router_import_reload_path__'
const RELOAD_QUERY = '__reload'
const IMPORT_ERROR_RE =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i

const buildPath = (path: string, query?: string) => {
  const url = new URL(path, window.location.origin)
  if (query) {
    url.searchParams.set(RELOAD_QUERY, Date.now().toString())
  } else {
    url.searchParams.delete(RELOAD_QUERY)
  }
  return `${url.pathname}${url.search}${url.hash}`
}

const isImportError = (error: unknown): error is Error =>
  error instanceof Error && IMPORT_ERROR_RE.test(error.message)

const getCurrentPath = () =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`

const restoreQueuedScroll = () => {
  const pos = consumeScroll()
  const apply = () => window.scrollTo({ left: pos.left ?? 0, top: pos.top ?? 0, behavior: 'auto' })
  if (typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(() => apply())
  } else {
    setTimeout(() => apply(), 0)
  }
}

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

    NProgress.configure({
      showSpinner: false,
      minimum: 0.1,
      trickleSpeed: 120,
    })

    const currentPath = getCurrentPath()
    const normalized = buildPath(currentPath)
    if (normalized !== currentPath) {
      window.history.replaceState(window.history.state, '', normalized)
    }

    const handleImportError = (error: unknown, targetPath: string = getCurrentPath()) => {
      const path = buildPath(targetPath)
      if (sessionStorage.getItem(RELOAD_KEY) === path) {
        sessionStorage.removeItem(RELOAD_KEY)
        console.error(
          '[Router] Import failed after reload. Check deployment/cache strategy.',
          error,
        )
        return
      }
      sessionStorage.setItem(RELOAD_KEY, path)
      window.location.replace(buildPath(targetPath, 'reload'))
    }

    window.addEventListener('vite:preloadError', (event) => {
      event.preventDefault()
      handleImportError(event)
    })

    router.beforeEach((to, from) => {
      const [toPathNoHash] = to.fullPath.split('#')
      const [fromPathNoHash] = from.fullPath.split('#')
      if (from.name && toPathNoHash !== fromPathNoHash) {
        NProgress.start()
      }
      return true
    })

    router.onError((error, to) => {
      NProgress.done()
      if (isImportError(error)) {
        handleImportError(error, to?.fullPath || getCurrentPath())
      }
    })

    router.afterEach((to, from) => {
      NProgress.done()

      if (sessionStorage.getItem(RELOAD_KEY) === buildPath(to.fullPath)) {
        sessionStorage.removeItem(RELOAD_KEY)
      }

      if (to.name && from.name && to.name === from.name && to.path !== from.path) {
        restoreQueuedScroll()
      }
    })

    const preloadArticle = async (to: { name?: unknown; params?: Record<string, unknown> }) => {
      if (to.name !== 'article') return
      const id = resolvePostIdBySlug(String(to.params?.category || ''), String(to.params?.id || ''))
      if (id) await preloadPostContent(id)
    }

    await preloadArticle(router.resolve(window.location.pathname))
    router.beforeResolve(async (to) => {
      await preloadArticle(to)
      return true
    })
  },
)
