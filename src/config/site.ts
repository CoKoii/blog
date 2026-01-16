import rawConfig from '../../site.config.json'

type SiteConfig = {
  url?: string
  name?: string
  description?: string
  image?: string
  language?: string
  tagColors?: Record<string, string>
  defaultTagColor?: string
}

const normalizeSiteUrl = (url: string): string => url.replace(/\/+$/, '')

const config = rawConfig as SiteConfig
const env = import.meta.env

const resolvedUrl = env.VITE_SITE_URL || config.url || 'https://example.com'
const resolvedName = env.VITE_SITE_NAME || config.name || 'CaoKai - 技术博客'
const resolvedDescription =
  env.VITE_SITE_DESCRIPTION ||
  config.description ||
  '专注前端、SSG、Vue、工程化实践等技术领域的分享'

export const siteUrl = normalizeSiteUrl(resolvedUrl)
export const siteName = resolvedName
export const siteDescription = resolvedDescription
export const siteImage = env.VITE_SITE_IMAGE || config.image || ''
export const siteLanguage = env.VITE_SITE_LANGUAGE || config.language || 'zh-CN'

export const defaultTagColor = config.defaultTagColor || '#9ca3af'

export const getTagColor = (tag: string): string => {
  const normalizedTag = tag.replace(/\s+/g, '')
  return config.tagColors?.[normalizedTag] || defaultTagColor
}
