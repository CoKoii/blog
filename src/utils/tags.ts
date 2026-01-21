import { getAllPosts } from '@/utils/posts'

export type TagEntry = {
  label: string
  slug: string
}

export const ALL_TAG_SLUG = 'all'

export const getTagEntries = (): TagEntry[] => {
  const posts = getAllPosts()
  const seen = new Set<string>()
  return posts.reduce<TagEntry[]>((acc, post) => {
    if (seen.has(post.categorySlug)) return acc
    seen.add(post.categorySlug)
    acc.push({
      label: post.category,
      slug: post.categorySlug,
    })
    return acc
  }, [])
}

export const getTagSlugSet = (): Set<string> => new Set(getTagEntries().map((tag) => tag.slug))
