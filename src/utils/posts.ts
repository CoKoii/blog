import type { MarkdownModule, PostMeta, PostModule } from '@/types/post'
import type { PostListItem } from '@/types/post-list'
import { postsMeta } from 'virtual:posts-meta'
import { computed, shallowRef } from 'vue'
import type { ShallowRef } from 'vue'
import { formatDateYMD } from './date'
import { resolveTitleFromSlug } from './strings'

export type { PostListItem } from '@/types/post-list'

const components = import.meta.glob<MarkdownModule>('/posts/**/*.md')
type MarkdownLoaders = typeof components
type PostsRuntimeState = {
  cache: Map<string, MarkdownModule>
  loaders: MarkdownLoaders
  posts: ShallowRef<PostMeta[]>
  postsById: Map<string, PostMeta>
  version: ShallowRef<number>
}
type PostsHotData = {
  state?: PostsRuntimeState
}

const getDate = (p: PostMeta): string => p.frontmatter?.date ?? p.frontmatter?.publishDate ?? ''
const getTs = (p: PostMeta) => new Date(getDate(p) || 0).getTime()
const sortPosts = (items: PostMeta[]) => [...items].sort((a, b) => getTs(b) - getTs(a))

const createRuntimeState = (): PostsRuntimeState => ({
  cache: new Map<string, MarkdownModule>(),
  loaders: components,
  posts: shallowRef<PostMeta[]>([]),
  postsById: new Map<string, PostMeta>(),
  version: shallowRef(0),
})

const hotData = import.meta.hot?.data as PostsHotData | undefined
const runtimeState = hotData?.state ?? createRuntimeState()

const syncRuntimeState = (
  nextPostsMeta: PostMeta[] = postsMeta,
  nextLoaders: MarkdownLoaders = components,
  bumpVersion = false,
) => {
  const sortedPosts = sortPosts(nextPostsMeta)
  runtimeState.loaders = nextLoaders
  runtimeState.posts.value = sortedPosts
  runtimeState.postsById = new Map(sortedPosts.map((post) => [post.id, post]))

  const validIds = new Set(sortedPosts.map((post) => post.id))
  for (const id of runtimeState.cache.keys()) {
    if (!validIds.has(id)) runtimeState.cache.delete(id)
  }

  if (bumpVersion) {
    runtimeState.cache.clear()
    runtimeState.version.value += 1
  }
}

syncRuntimeState()

export const __hmrSyncPostsRuntimeState = (bumpVersion = false) =>
  syncRuntimeState(postsMeta, components, bumpVersion)

if (import.meta.hot) {
  import.meta.hot.data.state = runtimeState
  import.meta.hot.accept((newModule) => {
    newModule?.__hmrSyncPostsRuntimeState?.(true)
  })
}

export const postsRef = computed(() => runtimeState.posts.value)
export const postsRevisionRef = computed(() => runtimeState.version.value)

export const parsePostId = (id: string) => {
  if (!id) return null
  const [category, slug] = id.split('/')
  if (!category || !slug) return null
  return { category, slug }
}

export const findPostBySlug = (catSlug: string, slug: string, posts: PostMeta[]) =>
  posts.find((p) => p.categorySlug === catSlug && p.slug === slug) ?? null

export const resolvePostIdBySlug = (catSlug: string, slug: string) =>
  catSlug && slug ? (findPostBySlug(catSlug, slug, postsRef.value)?.id ?? null) : null

const toModule = (meta: PostMeta | undefined, mod: MarkdownModule): PostModule | null =>
  mod.default ? { default: mod.default, frontmatter: meta?.frontmatter ?? {} } : null

const resolveLoader = (id: string) => {
  const meta = runtimeState.postsById.get(id)
  const path = meta?.path
  return { meta, path, loader: path ? runtimeState.loaders[path] : undefined }
}

const loadPostModule = async (id: string, force = false): Promise<PostModule | null> => {
  const { meta, path, loader } = resolveLoader(id)

  if (!path || !loader) {
    console.warn(`[Posts] Article not found: ${id}`)
    return null
  }

  if (!force) {
    const cached = runtimeState.cache.get(id)
    if (cached) return toModule(meta, cached)
  }

  try {
    const mod = await loader()
    runtimeState.cache.set(id, mod)
    return toModule(meta, mod)
  } catch (error) {
    console.error(`[Posts] Failed to ${force ? 'refresh' : 'load'} article: ${id}`, error)
    return null
  }
}

export function getPostContentSync(id: string): PostModule | null {
  const { meta, path, loader } = resolveLoader(id)
  if (!path || !loader) {
    console.warn(`[Posts] Article not found: ${id}`)
    return null
  }
  const cached = runtimeState.cache.get(id)
  return cached ? toModule(meta, cached) : null
}

export async function getPostContent(id: string): Promise<PostModule | null> {
  return loadPostModule(id)
}

export const refreshPostContent = (id: string) => loadPostModule(id, true)

export const preloadPostContent = getPostContent
export const getPostDate = (p: PostMeta) => getDate(p)
export const findPostById = (id: string | number, posts = postsRef.value) =>
  posts.find((p) => p.id === String(id)) ?? null

export const formatPostList = (posts: PostMeta[], hotCount = 2): PostListItem[] =>
  posts.map((p, i) => ({
    id: p.id,
    title: p.frontmatter.title ?? resolveTitleFromSlug(parsePostId(p.id)?.slug ?? ''),
    category: p.category,
    time: formatDateYMD(getDate(p)),
    readTime: p.frontmatter.readTime ? `${p.frontmatter.readTime} min` : '5 min',
    hot: i < hotCount,
    cover: p.frontmatter.coverImage ?? '',
    tags: p.frontmatter.tags,
  }))

export const getPostStats = (posts: PostMeta[]) => {
  const cats = new Set(posts.map((p) => p.category))
  const tags = new Set(posts.flatMap((p) => p.frontmatter?.tags ?? []))
  const words = posts.reduce((sum, p) => sum + (p.frontmatter?.wordCount ?? 0), 0)
  return {
    totalPosts: posts.length,
    totalCategories: cats.size,
    totalTags: tags.size,
    totalWords: words,
    categories: Array.from(cats),
  }
}
