import type { MarkdownModule, PostMeta, PostModule } from '@/types/post'
import type { PostListItem } from '@/types/post-list'
import { postsMeta } from 'virtual:posts-meta'
import { formatDateYMD } from './date'
import { resolveTitleFromSlug } from './strings'

export type { PostListItem } from '@/types/post-list'

const components = import.meta.glob<MarkdownModule>('/posts/**/*.md')
const cache = new Map<string, MarkdownModule>()

const getDate = (p: PostMeta): string => p.frontmatter?.date ?? p.frontmatter?.publishDate ?? ''
const getTs = (p: PostMeta) => new Date(getDate(p) || 0).getTime()

const sorted = [...postsMeta].sort((a, b) => getTs(b) - getTs(a))
const byId = new Map(sorted.map((p) => [p.id, p]))

export const parsePostId = (id: string) => {
  if (!id) return null
  const [category, slug] = id.split('/')
  if (!category || !slug) return null
  return { category, slug }
}

export const findPostBySlug = (catSlug: string, slug: string, posts: PostMeta[]) =>
  posts.find((p) => p.categorySlug === catSlug && p.slug === slug) ?? null

export const resolvePostIdBySlug = (catSlug: string, slug: string) =>
  catSlug && slug ? (findPostBySlug(catSlug, slug, sorted)?.id ?? null) : null

const toModule = (meta: PostMeta | undefined, mod: MarkdownModule): PostModule | null =>
  mod.default ? { default: mod.default, frontmatter: meta?.frontmatter ?? {} } : null

const resolveLoader = (id: string) => {
  const meta = byId.get(id)
  const path = meta?.path
  return { meta, path, loader: path ? components[path] : undefined }
}

export const getAllPosts = () => [...sorted]

export function getPostContentSync(id: string): PostModule | null {
  const { meta, path, loader } = resolveLoader(id)
  if (!path || !loader) {
    console.warn(`[Posts] Article not found: ${id}`)
    return null
  }
  const cached = cache.get(id)
  return cached ? toModule(meta, cached) : null
}

export async function getPostContent(id: string): Promise<PostModule | null> {
  const { meta, path, loader } = resolveLoader(id)

  if (!path || !loader) {
    console.warn(`[Posts] Article not found: ${id}`)
    return null
  }

  const cached = cache.get(id)
  if (cached) return toModule(meta, cached)

  try {
    const mod = await loader()
    cache.set(id, mod)
    return toModule(meta, mod)
  } catch (error) {
    console.error(`[Posts] Failed to load article: ${id}`, error)
    return null
  }
}

export const preloadPostContent = getPostContent
export const getPostDate = (p: PostMeta) => getDate(p)
export const findPostById = (id: string | number, posts = sorted) =>
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
