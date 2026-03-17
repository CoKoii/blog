import { siteConfig } from '@/config'
import type { TagEntry, TagTab } from '@/types/tag'
import { computed } from 'vue'
import { postsRef } from './posts'

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

const toSlug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const tagStateRef = computed(() => {
  const posts = postsRef.value
  const slugByCategory = new Map<string, string>()
  const slugByNormalizedCategory = new Map<string, string>()

  for (const post of posts) {
    if (!post.category || !post.categorySlug) continue
    if (!slugByCategory.has(post.category)) {
      slugByCategory.set(post.category, post.categorySlug)
    }
    const normalized = normalizeLabel(post.category)
    if (normalized && !slugByNormalizedCategory.has(normalized)) {
      slugByNormalizedCategory.set(normalized, post.categorySlug)
    }
  }

  const resolveSlug = (label: string): string =>
    slugByCategory.get(label) ??
    slugByNormalizedCategory.get(normalizeLabel(label)) ??
    toSlug(label)

  const seenSlugs = new Set<string>()
  const entries = labels.reduce<TagEntry[]>((acc, label) => {
    const slug = resolveSlug(label)
    if (slug && slug !== ALL_TAG_SLUG && !seenSlugs.has(slug)) {
      seenSlugs.add(slug)
      acc.push({ label, slug })
    }
    return acc
  }, [])

  const byLabel = new Map(entries.map((entry) => [entry.label, entry]))
  const tabs = labels.reduce<TagTab[]>((acc, label) => {
    if (label === ALL_TAG_SLUG) {
      acc.push({ label: ALL_TAG_LABEL, value: ALL_TAG_SLUG })
      return acc
    }
    const entry = byLabel.get(label)
    if (entry) acc.push({ label: entry.label, value: entry.slug })
    return acc
  }, [])

  if (!tabs.some((tab) => tab.value === ALL_TAG_SLUG)) {
    tabs.unshift({ label: ALL_TAG_LABEL, value: ALL_TAG_SLUG })
  }

  return {
    entries,
    tabs,
    slugs: new Set(entries.map((entry) => entry.slug)),
  }
})

export const tagEntriesRef = computed(() => tagStateRef.value.entries)
export const tagTabsRef = computed(() => tagStateRef.value.tabs)
export const tagSlugSetRef = computed(() => tagStateRef.value.slugs)
