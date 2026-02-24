import { pinyin } from 'pinyin-pro'
import { siteConfig } from '@/config'

export type TagEntry = {
  label: string
  slug: string
}

export type TagTab = {
  label: string
  value: string
}

export const ALL_TAG_SLUG = 'all'
export const ALL_TAG_LABEL = 'All'

const configuredTagLabels = Object.keys(siteConfig.tagMeta || {})
  .map((label) => label.trim())
  .filter(Boolean)

const toPinyinSlug = (text: string): string =>
  (text.match(/[\u4e00-\u9fa5]+|[^\u4e00-\u9fa5]+/g) || [])
    .map((segment) =>
      /[\u4e00-\u9fa5]/.test(segment)
        ? pinyin(segment, {
          pattern: 'pinyin',
          toneType: 'none',
          type: 'array',
        }).join('')
        : segment.replace(/[^a-zA-Z0-9]/g, ''),
    )
    .filter(Boolean)
    .join('-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const buildTagEntries = (): TagEntry[] => {
  const seen = new Set<string>()
  return configuredTagLabels.reduce<TagEntry[]>((acc, label) => {
    const slug = toPinyinSlug(label)
    if (!slug || slug === ALL_TAG_SLUG || seen.has(slug)) return acc
    seen.add(slug)
    acc.push({ label, slug })
    return acc
  }, [])
}

const tagEntriesCache = buildTagEntries()
const tagSlugSetCache = new Set(tagEntriesCache.map((tag) => tag.slug))
const tagEntryByLabel = new Map(tagEntriesCache.map((entry) => [entry.label, entry] as const))

const buildTagTabs = (): TagTab[] => {
  const tabs = configuredTagLabels.reduce<TagTab[]>((acc, label) => {
    if (label === ALL_TAG_SLUG) {
      acc.push({ label: ALL_TAG_LABEL, value: ALL_TAG_SLUG })
      return acc
    }

    const entry = tagEntryByLabel.get(label)
    if (entry) {
      acc.push({ label: entry.label, value: entry.slug })
    }
    return acc
  }, [])

  if (!tabs.some((tab) => tab.value === ALL_TAG_SLUG)) {
    tabs.unshift({ label: ALL_TAG_LABEL, value: ALL_TAG_SLUG })
  }

  return tabs
}

const tagTabsCache = buildTagTabs()

export const getTagEntries = (): TagEntry[] => {
  return tagEntriesCache.map((entry) => ({ ...entry }))
}

export const getTagTabs = (): TagTab[] => {
  return tagTabsCache.map((tab) => ({ ...tab }))
}

export const getTagSlugSet = (): Set<string> => new Set(tagSlugSetCache)
