import {
  siteConfig,
  type SiteOwner,
  type SiteSocialLink,
} from './raw'

const norm = (url: string) => url.replace(/\/+$/, '')

export const siteUrl = norm(siteConfig.site.url)
export const siteName = siteConfig.site.name
export const siteDescription = siteConfig.site.description
export const siteImage = siteConfig.site.image
export const siteLanguage = siteConfig.site.language
export const siteOwner: SiteOwner = siteConfig.owner
export const defaultTagColor = siteConfig.tags.defaultColor
export const brandName = siteConfig.site.brandName

export const ownerProfile: SiteOwner = siteConfig.owner

export const socialLinks: SiteSocialLink[] = siteConfig.socials

export const wechatConfig = siteConfig.wechat

export const statsConfig = siteConfig.stats

export const githubConfig = {
  ...siteConfig.github,
  apiBase: norm(siteConfig.github.apiBase),
}

const giscusConfig = siteConfig.comments.giscus

export const commentsConfig = siteConfig.comments

const hasValidGiscus = Boolean(
  giscusConfig.repo && giscusConfig.repoId && giscusConfig.category && giscusConfig.categoryId,
)

export const normalizedConfig = {
  siteUrl,
  siteName,
  siteDescription,
  siteImage,
  siteLanguage,
  siteOwner,
  defaultTagColor,
  brandName,
  ownerProfile,
  socialLinks,
  wechatConfig,
  statsConfig,
  githubConfig,
  commentsConfig,
  hasValidGiscusConfig: hasValidGiscus,
  tagMeta: siteConfig.tags.meta,
}

export const isGiscusReady = commentsConfig.enabled && hasValidGiscus

export const getTagMeta = (tag: string): import('./types').TagMeta => {
  const t = tag.replace(/\s+/g, '')
  const cfg = normalizedConfig.tagMeta[t]
  if (!cfg) return { color: defaultTagColor }
  if (typeof cfg === 'string') return { color: cfg }
  return {
    color: cfg.color,
    cover: cfg.cover,
    description: cfg.description,
  }
}

export const getTagColor = (tag: string) => getTagMeta(tag).color
