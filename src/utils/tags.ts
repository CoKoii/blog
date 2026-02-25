import { siteConfig } from '@/config'
import { pinyin } from 'pinyin-pro'

export type TagEntry = { label: string; slug: string }
export type TagTab = { label: string; value: string }

export const ALL_TAG_SLUG = 'all'
export const ALL_TAG_LABEL = 'All'

const labels = Object.keys(siteConfig.tagMeta || {})
  .map((l) => l.trim())
  .filter(Boolean)

const toSlug = (text: string): string =>
  (text.match(/[\u4e00-\u9fa5]+|[^\u4e00-\u9fa5]+/g) || [])
    .map((s) =>
      /[\u4e00-\u9fa5]/.test(s)
        ? pinyin(s, { pattern: 'pinyin', toneType: 'none', type: 'array' }).join('')
        : s.replace(/[^a-zA-Z0-9]/g, ''),
    )
    .filter(Boolean)
    .join('-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const entries = labels.reduce<TagEntry[]>((acc, label) => {
  const slug = toSlug(label)
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
