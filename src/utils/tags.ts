import { siteConfig } from '@/config'
import type { TagEntry, TagTab } from '@/types/tag'
import { postsMeta } from 'virtual:posts-meta'

export type { TagEntry, TagTab } from '@/types/tag'

export const ALL_TAG_SLUG = 'all'
export const ALL_TAG_LABEL = 'All'

const labels = Object.keys(siteConfig.tags.meta)
  .map((label) => label.trim())
  .filter(Boolean)

const normalizeLabel = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]/g, '')
    .trim()

const { slugByCategory, slugByNormalizedCategory } = postsMeta.reduce(
  (maps, post) => {
    if (!post.category || !post.categorySlug) return maps
    if (!maps.slugByCategory.has(post.category)) {
      maps.slugByCategory.set(post.category, post.categorySlug)
    }
    const normalized = normalizeLabel(post.category)
    if (normalized && !maps.slugByNormalizedCategory.has(normalized)) {
      maps.slugByNormalizedCategory.set(normalized, post.categorySlug)
    }
    return maps
  },
  {
    slugByCategory: new Map<string, string>(),
    slugByNormalizedCategory: new Map<string, string>(),
  },
)

const toSlug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const resolveSlug = (label: string): string =>
  slugByCategory.get(label) ?? slugByNormalizedCategory.get(normalizeLabel(label)) ?? toSlug(label)

const seenSlugs = new Set<string>()
const entries = labels.reduce<TagEntry[]>((acc, label) => {
  const slug = resolveSlug(label)
  if (slug && slug !== ALL_TAG_SLUG && !seenSlugs.has(slug)) {
    seenSlugs.add(slug)
    acc.push({ label, slug })
  }
  return acc
}, [])

const slugs = new Set(entries.map((e) => e.slug))
const byLabel = new Map(entries.map((e) => [e.label, e]))

const tabs = labels.reduce<TagTab[]>((acc, label) => {
  if (label === ALL_TAG_SLUG) {
    acc.push({ label: ALL_TAG_LABEL, value: ALL_TAG_SLUG })
    return acc
  }
  const e = byLabel.get(label)
  if (e) acc.push({ label: e.label, value: e.slug })
  return acc
}, [])

if (!tabs.some((t) => t.value === ALL_TAG_SLUG)) {
  tabs.unshift({ label: ALL_TAG_LABEL, value: ALL_TAG_SLUG })
}

export const getTagEntries = (): TagEntry[] => entries.map((e) => ({ ...e }))
export const getTagTabs = (): TagTab[] => tabs.map((t) => ({ ...t }))
export const getTagSlugSet = (): Set<string> => new Set(slugs)
