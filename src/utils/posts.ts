import type { MarkdownModule, PostMeta, PostModule } from '@/types/post'
import { postsMeta } from 'virtual:posts-meta'
import { formatDateYMD } from './date'
import { resolveTitleFromSlug } from './strings'

const postComponents = import.meta.glob<MarkdownModule>('/posts/**/*.md')

const postModuleCache = new Map<string, MarkdownModule>()

const getPostDateValue = (post: PostMeta): string =>
  post.frontmatter?.date || post.frontmatter?.publishDate || ''

export const parsePostId = (
  id: string,
): {
  category: string
  slug: string
} | null => {
  if (!id) return null
  const [category, slug] = id.split('/')
  if (!category || !slug) return null
  return { category, slug }
}

/**
 * 从 URL 参数解析文章 ID
 * 支持拼音 slug 反向查找
 */
export function findPostBySlug(
  categorySlug: string,
  slug: string,
  posts: PostMeta[],
): PostMeta | null {
  return posts.find((post) => post.categorySlug === categorySlug && post.slug === slug) || null
}

export function resolvePostIdBySlug(categorySlug: string, slug: string): string | null {
  if (!categorySlug || !slug) return null
  const post = findPostBySlug(categorySlug, slug, getAllPosts())
  return post?.id || null
}

const getPostDateTimestamp = (post: PostMeta): number =>
  new Date(getPostDateValue(post) || 0).getTime()

const sortedPosts = [...postsMeta].sort((a, b) => getPostDateTimestamp(b) - getPostDateTimestamp(a))

const postsMetaById = new Map(sortedPosts.map((post) => [post.id, post]))

const resolvePostModule = (
  meta: PostMeta | undefined,
  module: MarkdownModule,
): PostModule | null => {
  const component = module.default
  if (!component) return null
  return {
    default: component,
    frontmatter: meta?.frontmatter || {},
  }
}

/**
 * 获取所有文章元数据
 * @returns 文章元数据数组，按日期降序排列
 */
export function getAllPosts(): PostMeta[] {
  return [...sortedPosts]
}

/**
 * 根据 ID 获取文章内容
 * @param id 文章 ID（文件夹/文件名，不含 .md）
 * @returns 文章模块或 null
 */
export function getPostContentSync(id: string): PostModule | null {
  const meta = postsMetaById.get(id)
  const path = meta?.path
  const loader = path ? postComponents[path] : undefined

  if (!path || !loader) {
    console.warn(`[Posts] Article not found: ${id}`)
    return null
  }

  const cached = postModuleCache.get(id)
  if (!cached) return null
  return resolvePostModule(meta, cached)
}

export async function getPostContent(id: string): Promise<PostModule | null> {
  const meta = postsMetaById.get(id)
  const path = meta?.path

  const loader = path ? postComponents[path] : undefined

  if (!path || !loader) {
    console.warn(`[Posts] Article not found: ${id}`)
    return null
  }

  const cached = postModuleCache.get(id)
  if (cached) {
    return resolvePostModule(meta, cached)
  }

  try {
    const mod = await loader()
    postModuleCache.set(id, mod)
    return resolvePostModule(meta, mod)
  } catch (error) {
    console.error(`[Posts] Failed to load article: ${id}`, error)
    return null
  }
}

export async function preloadPostContent(id: string): Promise<void> {
  await getPostContent(id)
}

export function getPostDate(post: PostMeta): string {
  return getPostDateValue(post)
}

export function findPostById(
  postId: string | number,
  posts: PostMeta[] = sortedPosts,
): PostMeta | null {
  return posts.find((post) => post.id === String(postId)) || null
}

export interface PostListItem {
  id: string
  title: string
  category: string
  time: string
  readTime: string
  hot: boolean
  cover: string
  tags?: string[]
}

export function formatPostList(posts: PostMeta[], markHotCount = 2): PostListItem[] {
  return posts.map((post, index) => ({
    id: post.id,
    title: post.frontmatter.title ?? resolveTitleFromSlug(parsePostId(post.id)?.slug || ''),
    category: post.category,
    time: formatDateYMD(getPostDate(post)),
    readTime: post.frontmatter.readTime ? `${post.frontmatter.readTime} min` : '5 min',
    hot: index < markHotCount,
    cover: post.frontmatter.coverImage ?? '',
    tags: post.frontmatter.tags,
  }))
}

export function getPostStats(posts: PostMeta[]) {
  const totalPosts = posts.length
  const categories = new Set(posts.map((p) => p.category))
  const totalCategories = categories.size
  const totalTags = new Set(posts.flatMap((p) => p.frontmatter?.tags || []))
  const totalWords = posts.reduce((sum, post) => sum + (post.frontmatter?.wordCount || 0), 0)
  return {
    totalPosts,
    totalCategories,
    totalTags: totalTags.size,
    totalWords,
    categories: Array.from(categories),
  }
}
