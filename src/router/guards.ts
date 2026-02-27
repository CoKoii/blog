import { preloadPostContent, resolvePostIdBySlug } from '@/utils/posts'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import type { Router } from 'vue-router'
import {
  clearReloadKey,
  getCurrentPath,
  handleImportError,
  isImportError,
} from './utils/import-error-handler'

export const configureProgress = () => {
  NProgress.configure({
    showSpinner: false,
    minimum: 0.1,
    trickleSpeed: 120,
  })
}

const preloadArticle = async (to: { name?: unknown; params?: Record<string, unknown> }) => {
  if (to.name !== 'article') return
  const id = resolvePostIdBySlug(String(to.params?.category || ''), String(to.params?.id || ''))
  if (id) await preloadPostContent(id)
}

export const setupRouterGuards = async (router: Router) => {
  router.beforeEach((to, from) => {
    const [toPathNoHash] = to.fullPath.split('#')
    const [fromPathNoHash] = from.fullPath.split('#')
    const isTagsTabSwitch = to.name === 'tags' && from.name === 'tags'
    if (from.name && toPathNoHash !== fromPathNoHash && !isTagsTabSwitch) {
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

  router.afterEach((to) => {
    NProgress.done()
    clearReloadKey(to.fullPath)
  })

  await preloadArticle(router.resolve(window.location.pathname))
  router.beforeResolve(async (to) => {
    await preloadArticle(to)
    return true
  })
}
