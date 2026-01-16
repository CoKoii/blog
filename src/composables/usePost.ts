import type { PostMeta } from '@/types/post'
import { getRelativeTime } from '@/utils/date'
import { getPostDate, parsePostId } from '@/utils/posts'
import { safeDecodeURIComponent } from '@/utils/strings'

/**
 * 转换文章数据为列表显示格式
 */
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

const getTitleFromSlug = (slug: string): string =>
  safeDecodeURIComponent(slug) || 'Untitled'

export function usePostListFormat(posts: PostMeta[], markHotCount = 2): PostListItem[] {
  return posts.map((post, index) => ({
    id: post.id,
    title: post.frontmatter.title ?? getTitleFromSlug(parsePostId(post.id)?.slug || ''),
    category: post.category,
    time: getRelativeTime(getPostDate(post)),
    readTime: post.frontmatter.readTime ? `${post.frontmatter.readTime} min` : '5 min',
    hot: index < markHotCount,
    cover: post.frontmatter.coverImage ?? '',
    tags: post.frontmatter.tags,
  }))
}

/**
 * 获取文章统计信息
 */
export function usePostStats(posts: PostMeta[]) {
  const totalPosts = posts.length
  const categories = new Set(posts.map((p) => p.category))
  const totalCategories = categories.size
  const totalTags = new Set(posts.flatMap((p) => p.frontmatter?.tags || []))

  // 计算总字数
  const totalWords = posts.reduce((sum, post) => {
    return sum + (post.frontmatter?.wordCount || 0)
  }, 0)

  return {
    totalPosts,
    totalCategories,
    totalTags: totalTags.size,
    totalWords,
    categories: Array.from(categories),
  }
}
