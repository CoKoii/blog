import { commentsConfig, isGiscusReady } from '@/config'
import { ref, watch } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

type Discussion = {
  title?: string
  comments?: number
  category?: {
    node_id?: string
  }
}

type RepoInfo = {
  owner: string
  name: string
}

type Lookup = { type: 'title'; key: string } | { type: 'number'; key: string }

const canUseDOM = typeof window !== 'undefined'
const GITHUB_API_BASE = 'https://api.github.com'
const CACHE_TTL_MS = 5 * 60 * 1000
const PER_PAGE = 100
const MAX_PAGES = 10
const countCache = new Map<string, { count: number; expireAt: number }>()
const inflight = new Map<string, Promise<number>>()
const githubToken = (import.meta.env.VITE_GITHUB_TOKEN || __GITHUB_TOKEN__ || '').trim()

const decodeSafe = (value: string) => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const normalizePathnameTerm = (pathname: string) => {
  const cleanPath = pathname.split(/[?#]/, 1)[0] || ''
  if (cleanPath.length < 2) return 'index'
  return cleanPath.replace(/^\/+/, '').replace(/\.\w+$/, '')
}

const normalizeTitle = (value: string) => decodeSafe(value).trim().toLowerCase()

const parseRepo = (repo: string): RepoInfo | null => {
  const [owner, name] = repo.split('/')
  if (!owner || !name) return null
  return { owner, name }
}

const resolveLookup = (pathname: string): Lookup | null => {
  const { mapping, term } = commentsConfig.giscus

  switch (mapping) {
    case 'pathname':
      return { type: 'title', key: normalizePathnameTerm(pathname) }
    case 'specific':
      return term ? { type: 'title', key: term.trim() } : null
    case 'number': {
      const key = term?.trim() || ''
      return /^\d+$/.test(key) ? { type: 'number', key } : null
    }
    default:
      return null
  }
}

const createRequestHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  }

  if (githubToken) {
    headers.Authorization = `Bearer ${githubToken}`
    headers['X-GitHub-Api-Version'] = '2022-11-28'
  }

  return headers
}

const requestJson = async <T>(path: string): Promise<T | null> => {
  try {
    const response = await fetch(`${GITHUB_API_BASE}${path}`, { headers: createRequestHeaders() })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch (error) {
    console.warn('[Giscus] Failed to request discussion data:', error)
    return null
  }
}

const matchTitle = (discussionTitle: string, targetTitle: string, strict: boolean) => {
  const left = normalizeTitle(discussionTitle)
  const right = normalizeTitle(targetTitle)
  return strict ? left === right : left.includes(right)
}

const fetchCountByNumber = async (
  repo: RepoInfo,
  number: string,
  categoryId: string,
) => {
  const discussion = await requestJson<Discussion>(
    `/repos/${repo.owner}/${repo.name}/discussions/${number}`,
  )
  if (!discussion) return 0
  if (categoryId && discussion.category?.node_id !== categoryId) return 0
  return discussion.comments ?? 0
}

const fetchCountByTitle = async (
  repo: RepoInfo,
  title: string,
  categoryId: string,
  strict: boolean,
) => {
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const discussions = await requestJson<Discussion[]>(
      `/repos/${repo.owner}/${repo.name}/discussions?per_page=${PER_PAGE}&page=${page}`,
    )
    if (!discussions?.length) return 0

    const matched = discussions.find((discussion) => {
      if (categoryId && discussion.category?.node_id !== categoryId) return false
      return matchTitle(discussion.title || '', title, strict)
    })

    if (matched) return matched.comments ?? 0
    if (discussions.length < PER_PAGE) return 0
  }
  return 0
}

const getCachedCount = (cacheKey: string) => {
  const cached = countCache.get(cacheKey)
  return cached && cached.expireAt > Date.now() ? cached.count : null
}

const withCachedCount = (cacheKey: string, loader: () => Promise<number>) => {
  const cached = getCachedCount(cacheKey)
  if (cached !== null) return Promise.resolve(cached)

  const pending = inflight.get(cacheKey)
  if (pending) return pending

  const task = loader()
    .then((count) => {
      countCache.set(cacheKey, {
        count,
        expireAt: Date.now() + CACHE_TTL_MS,
      })
      return count
    })
    .finally(() => {
      inflight.delete(cacheKey)
    })

  inflight.set(cacheKey, task)
  return task
}

const fetchCommentCount = async (pathname: string): Promise<number> => {
  if (!isGiscusReady) return 0
  const repo = parseRepo(commentsConfig.giscus.repo)
  const lookup = resolveLookup(pathname)
  if (!repo || !lookup) return 0

  const { categoryId, strict } = commentsConfig.giscus
  const cacheKey = `${repo.owner}/${repo.name}|${categoryId}|${lookup.type}|${lookup.key}`

  return withCachedCount(cacheKey, () =>
    lookup.type === 'number'
      ? fetchCountByNumber(repo, lookup.key, categoryId)
      : fetchCountByTitle(repo, lookup.key, categoryId, strict),
  )
}

export const useArticleComments = (route: RouteLocationNormalizedLoaded) => {
  const comments = ref<number | null>(isGiscusReady ? 0 : null)
  if (!canUseDOM || !isGiscusReady || import.meta.env.SSR) return { comments }

  watch(
    () => route.path,
    (path, _prev, onCleanup) => {
      let canceled = false
      onCleanup(() => {
        canceled = true
      })

      void fetchCommentCount(String(path || '/')).then((count) => {
        if (!canceled) comments.value = count
      })
    },
    { immediate: true },
  )

  return { comments }
}
