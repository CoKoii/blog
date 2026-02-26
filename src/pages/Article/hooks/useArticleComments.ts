import { isGiscusReady } from '@/config'
import githubData from '@/data/github-data.json'
import { ref, watch } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

type GithubDataPayload = {
  comments?: {
    byPath?: Record<string, number>
  }
}

const payload = githubData as GithubDataPayload
const commentsByPath = payload.comments?.byPath || {}
const canUseDOM = typeof window !== 'undefined'

const normalizeRoutePath = (value: string) => {
  const clean = String(value || '/').split(/[?#]/, 1)[0] || '/'
  if (clean !== '/' && clean.endsWith('/')) {
    return clean.replace(/\/+$/, '')
  }
  return clean
}

const resolveCommentCount = (value: string) => {
  const count = commentsByPath[normalizeRoutePath(value)]
  if (typeof count !== 'number' || !Number.isFinite(count)) return 0
  return count
}

export const useArticleComments = (route: RouteLocationNormalizedLoaded) => {
  const comments = ref<number | null>(
    isGiscusReady ? resolveCommentCount(String(route.path || '/')) : null,
  )

  if (!canUseDOM || !isGiscusReady || import.meta.env.SSR) return { comments }

  watch(
    () => route.path,
    (path) => {
      comments.value = resolveCommentCount(String(path || '/'))
    },
    { immediate: true },
  )

  return { comments }
}
