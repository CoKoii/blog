import type { TagMeta } from './types'
import { normalizedConfig } from './normalize'

export const siteUrl = normalizedConfig.siteUrl
export const siteName = normalizedConfig.siteName
export const siteDescription = normalizedConfig.siteDescription
export const siteImage = normalizedConfig.siteImage
export const siteLanguage = normalizedConfig.siteLanguage
export const siteOwner = normalizedConfig.siteOwner

export const defaultTagColor = normalizedConfig.defaultTagColor

export const getTagMeta = (tag: string): TagMeta => {
  const normalizedTag = tag.replace(/\s+/g, '')
  const config = normalizedConfig.tagMeta?.[normalizedTag]

  if (!config) {
    return { color: defaultTagColor }
  }

  if (typeof config === 'string') {
    return { color: config }
  }

  return {
    color: config.color || defaultTagColor,
    cover: config.cover,
    description: config.description,
  }
}

export const getTagColor = (tag: string): string => getTagMeta(tag).color
