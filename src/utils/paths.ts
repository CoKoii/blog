import type { PostMeta } from '@/types/post'

/**
 * 构建文章路径（使用拼音 slug）
 */
export const buildArticlePath = (post: PostMeta): string =>
  `/article/${post.categorySlug}/${post.slug}`
