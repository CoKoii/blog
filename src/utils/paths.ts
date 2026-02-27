import type { PostMeta } from '@/types/post'

export const buildArticlePath = ({ categorySlug, slug }: PostMeta): string =>
  `/article/${categorySlug}/${slug}`
