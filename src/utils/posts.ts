import type { PostMeta, PostModule, MarkdownModule } from '@/types/post'
import { postsMeta } from 'virtual:posts-meta'

// Lazy 加载文章内容（按需加载）
const postComponents = import.meta.glob<MarkdownModule>('/posts/**/*.md')

const idToPathMap = new Map<string, string>()

// 初始化映射
for (const path of Object.keys(postComponents)) {
  const parts = path.split('/')
  const fileName = parts.pop() || ''
  const category = parts.pop() || ''
  const id = category ? `${category}/${fileName.replace(/\.md$/, '')}` : fileName.replace(/\.md$/, '')
  idToPathMap.set(id, path)
}

const sortedPosts = [...postsMeta].sort((a, b) => {
  const dateA = new Date(a.frontmatter?.date || a.frontmatter?.publishDate || 0)
  const dateB = new Date(b.frontmatter?.date || b.frontmatter?.publishDate || 0)
  return dateB.getTime() - dateA.getTime()
})

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
export async function getPostContent(id: string): Promise<PostModule | null> {
  const path = idToPathMap.get(id)

  if (!path || !postComponents[path]) {
    console.warn(`[Posts] Article not found: ${id}`)
    return null
  }

  try {
    // 加载 Vue 组件
    const mod = await postComponents[path]()

    // 从虚拟模块中获取 frontmatter（预解析的）
    const meta = postsMetaById.get(id)
    const frontmatter = meta?.frontmatter || {}

    return {
      default: mod.default,
      frontmatter,
    } as PostModule
  } catch (error) {
    console.error(`[Posts] Failed to load article: ${id}`, error)
    return null
  }
}

/**
 * 检查文章是否存在
 */
export function hasPost(id: string): boolean {
  return idToPathMap.has(id)
}

/**
 * 获取所有分类
 */
export function getAllCategories(): string[] {
  const categories = new Set(getAllPosts().map((post) => post.category))
  return Array.from(categories)
}
