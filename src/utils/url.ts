import type { PostMeta } from '@/types/post'
import { buildArticlePath } from '@/utils/paths'

/**
 * 生成文章的 URL 路径（使用拼音 slug）
 */
export function getPostUrl(post: PostMeta): string {
  return buildArticlePath(post)
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
