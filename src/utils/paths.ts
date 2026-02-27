import type { PostMeta } from '@/types/post'

export const buildArticlePath = (post: PostMeta): string =>
  `/article/${post.categorySlug}/${post.slug}`
