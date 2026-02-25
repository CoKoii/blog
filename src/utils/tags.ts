import { siteConfig } from '@/config'
import { postsMeta } from 'virtual:posts-meta'

export type TagEntry = { label: string; slug: string }
export type TagTab = { label: string; value: string }

export const ALL_TAG_SLUG = 'all'
export const ALL_TAG_LABEL = 'All'

const labels = Object.keys(siteConfig.tagMeta || {})
  .map((l) => l.trim())
  .filter(Boolean)

const normalizeLabel = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]/g, '')
    .trim()

const slugByCategory = postsMeta.reduce((map, post) => {
  if (post.category && post.categorySlug && !map.has(post.category)) {
    map.set(post.category, post.categorySlug)
  }
  return map
}, new Map<string, string>())

const slugByNormalizedCategory = postsMeta.reduce((map, post) => {
  const normalizedLabel = normalizeLabel(post.category)
  if (normalizedLabel && post.categorySlug && !map.has(normalizedLabel)) {
    map.set(normalizedLabel, post.categorySlug)
  }
  return map
}, new Map<string, string>())

const toSlug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const resolveSlug = (label: string): string =>
  slugByCategory.get(label) ||
  slugByNormalizedCategory.get(normalizeLabel(label)) ||
  toSlug(label)

const entries = labels.reduce<TagEntry[]>((acc, label) => {
  const slug = resolveSlug(label)
  if (slug && slug !== ALL_TAG_SLUG && !acc.some((e) => e.slug === slug)) {
    acc.push({ label, slug })
  }
  return acc
}, [])

const slugs = new Set(entries.map((e) => e.slug))
const byLabel = new Map(entries.map((e) => [e.label, e]))

const tabs = (() => {
  const list = labels.reduce<TagTab[]>((acc, label) => {
    if (label === ALL_TAG_SLUG) {
      acc.push({ label: ALL_TAG_LABEL, value: ALL_TAG_SLUG })
    } else {
      const e = byLabel.get(label)
      if (e) acc.push({ label: e.label, value: e.slug })
    }
    return acc
  }, [])
  if (!list.some((t) => t.value === ALL_TAG_SLUG)) {
    list.unshift({ label: ALL_TAG_LABEL, value: ALL_TAG_SLUG })
  }
  return list
})()

export const getTagEntries = (): TagEntry[] => entries.map((e) => ({ ...e }))
export const getTagTabs = (): TagTab[] => tabs.map((t) => ({ ...t }))
export const getTagSlugSet = (): Set<string> => new Set(slugs)
