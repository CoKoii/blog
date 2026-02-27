import { isGiscusReady } from '@/config'
import { getCommentCountByPath } from '@/services/github'
import { ref, watch } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

const canUseDOM = typeof window !== 'undefined'

export const useArticleComments = (route: RouteLocationNormalizedLoaded) => {
  const comments = ref<number | null>(
    isGiscusReady ? getCommentCountByPath(String(route.path ?? '/')) : null,
  )

  if (!canUseDOM || !isGiscusReady || import.meta.env.SSR) return { comments }

  watch(
    () => route.path,
    (path) => (comments.value = getCommentCountByPath(String(path ?? '/'))),
  )

  return { comments }
}
