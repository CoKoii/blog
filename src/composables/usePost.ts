import type { PostMeta } from '@/types/post'

/**
 * 计算相对时间显示
 */
export function useRelativeTime(dateString?: string): string {
  if (!dateString) return 'Recently'

  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

/**
 * 格式化日期为友好显示
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return ''

  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

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

export function usePostListFormat(posts: PostMeta[], markHotCount = 2): PostListItem[] {
  return posts.map((post, index) => ({
    id: post.id,
    title: post.frontmatter?.title || 'Untitled',
    category: post.category,
    time: useRelativeTime(post.frontmatter?.date || post.frontmatter?.publishDate),
    readTime: post.frontmatter?.readTime ? `${post.frontmatter.readTime} min` : '5 min',
    hot: index < markHotCount,
    cover:
      post.frontmatter?.coverImage ||
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80',
    tags: post.frontmatter?.tags,
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
