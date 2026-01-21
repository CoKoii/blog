import { siteConfig } from './raw'

const normalizeSiteUrl = (url: string): string => url.replace(/\/+$/, '')

const env = import.meta.env

const resolvedUrl = env.VITE_SITE_URL || siteConfig.url || 'https://example.com'
const resolvedName = env.VITE_SITE_NAME || siteConfig.name || 'CaoKai - 技术博客'
const resolvedDescription =
  env.VITE_SITE_DESCRIPTION ||
  siteConfig.description ||
  '专注前端、SSG、Vue、工程化实践等技术领域的分享'

export const siteUrl = normalizeSiteUrl(resolvedUrl)
export const siteName = resolvedName
export const siteDescription = resolvedDescription
export const siteImage = env.VITE_SITE_IMAGE || siteConfig.image || ''
export const siteLanguage = env.VITE_SITE_LANGUAGE || siteConfig.language || 'zh-CN'
export const siteOwner = siteConfig.owner || { name: 'Author' }

export const defaultTagColor = siteConfig.defaultTagColor || '#9ca3af'

type TagMeta = {
  color: string
  cover?: string
  description?: string
}

export const getTagMeta = (tag: string): TagMeta => {
  const normalizedTag = tag.replace(/\s+/g, '')
  const config = siteConfig.tagMeta?.[normalizedTag]

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
