import { siteConfig } from './loader'

const norm = (url: string) => url.replace(/\/+$/, '')

export const siteUrl = norm(siteConfig.site.url)
export const siteName = siteConfig.site.name
export const siteDescription = siteConfig.site.description
export const siteImage = siteConfig.site.image
export const siteLanguage = siteConfig.site.language
export const siteOwner = siteConfig.owner
export const defaultTagColor = siteConfig.tags.defaultColor
export const brandName = siteConfig.site.brandName

export const socialLinks = siteConfig.socials

export const wechatConfig = siteConfig.wechat

export const statsConfig = siteConfig.stats

export const githubConfig = {
  ...siteConfig.github,
  apiBase: norm(siteConfig.github.apiBase),
}

const giscusConfig = siteConfig.comments.giscus

export const commentsConfig = siteConfig.comments

const hasValidGiscus =
  !!giscusConfig.repo &&
  !!giscusConfig.repoId &&
  !!giscusConfig.category &&
  !!giscusConfig.categoryId

export const isGiscusReady = commentsConfig.enabled && hasValidGiscus

export const getTagMeta = (tag: string): import('./types').TagMeta => {
  const t = tag.replace(/\s+/g, '')
  const cfg = siteConfig.tags.meta[t]
  return !cfg ? { color: defaultTagColor } : typeof cfg === 'string' ? { color: cfg } : cfg
}
