import type { PostMeta, PostModule, MarkdownModule } from '@/types/post'
import { postsMeta } from 'virtual:posts-meta'

type PostComponentLoader = () => Promise<MarkdownModule>

const postComponents = import.meta.glob<MarkdownModule>('/posts/**/*.md') as Record<
  string,
  PostComponentLoader
>

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

/**
 * 获取所有文章元数据
 * @returns 文章元数据数组，按日期降序排列
 */
export function getAllPosts(): PostMeta[] {
  return [...sortedPosts]
}

/**
 * 根据分类获取文章
 */
export function getPostsByCategory(category: string): PostMeta[] {
  return getAllPosts().filter((post) => post.category === category)
}

/**
 * 根据 ID 获取文章内容
 * @param id 文章 ID（文件夹/文件名，不含 .md）
 * @returns 文章模块或 null
 */
export function getPostContentSync(id: string): PostModule | null {
  const meta = postsMetaById.get(id)
  const path = meta?.path

  if (!path || !postComponents[path]) {
    console.warn(`[Posts] Article not found: ${id}`)
    return null
  }

  const cached = postModuleCache.get(id)
  if (!cached) return null
  return {
    default: cached.default,
    frontmatter: meta?.frontmatter || {},
  } as PostModule
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
    return {
      default: cached.default,
      frontmatter: meta?.frontmatter || {},
    } as PostModule
  }

  try {
    const mod = await loader()
    postModuleCache.set(id, mod)
    return {
      default: mod.default,
      frontmatter: meta?.frontmatter || {},
    } as PostModule
  } catch (error) {
    console.error(`[Posts] Failed to load article: ${id}`, error)
    return null
  }
}

export async function preloadPostContent(id: string): Promise<void> {
  await getPostContent(id)
}

/**
 * 获取所有分类
 */
export function getAllCategories(): string[] {
  const categories = new Set(getAllPosts().map((post) => post.category))
  return Array.from(categories)
}

export function getPostDate(post: PostMeta): string {
  return getPostDateValue(post)
}
