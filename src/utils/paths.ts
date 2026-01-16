import type { PostMeta } from '@/types/post'

/**
 * 构建文章路径（使用拼音 slug）
 */
export const buildArticlePath = (post: PostMeta): string =>
  `/article/${post.categorySlug}/${post.slug}`

/**
 * 构建文章路径（通过 category slug 和 article slug）
 */
export const buildArticlePathBySlug = (categorySlug: string, articleSlug: string): string =>
  `/article/${categorySlug}/${articleSlug}`
