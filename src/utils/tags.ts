import { getAllPosts } from '@/utils/posts'

export type TagEntry = {
  label: string
  slug: string
}

export const ALL_TAG_SLUG = 'all'

const buildTagEntries = (): TagEntry[] => {
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

const tagEntriesCache = buildTagEntries()
const tagSlugSetCache = new Set(tagEntriesCache.map((tag) => tag.slug))

export const getTagEntries = (): TagEntry[] => {
  return tagEntriesCache.map((entry) => ({ ...entry }))
}

export const getTagSlugSet = (): Set<string> => new Set(tagSlugSetCache)
