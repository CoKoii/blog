import { siteConfig } from './loader'

const norm = (url: string) => url.replace(/\/+$/, '')
const { site, owner, tags, socials, wechat, stats, github, comments } = siteConfig

export const siteUrl = norm(site.url)
export const siteName = site.name
export const siteDescription = site.description
export const siteImage = site.image
export const siteLanguage = site.language
export const siteOwner = owner
export const defaultTagColor = tags.defaultColor
export const brandName = site.brandName

export const socialLinks = socials

export const wechatConfig = wechat

export const statsConfig = stats

export const githubConfig = {
  ...github,
  apiBase: norm(github.apiBase),
}

const giscusConfig = comments.giscus

export const commentsConfig = comments

const hasValidGiscus =
  !!giscusConfig.repo &&
  !!giscusConfig.repoId &&
  !!giscusConfig.category &&
  !!giscusConfig.categoryId

export const isGiscusReady = commentsConfig.enabled && hasValidGiscus

export const getTagMeta = (tag: string): import('./types').TagMeta => {
  const t = tag.replace(/\s+/g, '')
  const cfg = tags.meta[t]
  return !cfg ? { color: defaultTagColor } : typeof cfg === 'string' ? { color: cfg } : cfg
}
