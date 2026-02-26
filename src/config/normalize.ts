import {
  siteConfig,
  type SiteCommentsGiscus,
  type SiteGithub,
  type SiteOwner,
  type SiteSocialLink,
  type SiteStats,
  type SiteWechat,
} from './raw'

const norm = (url: string) => url.replace(/\/+$/, '')

export const siteUrl = siteConfig.url ? norm(siteConfig.url) : ''
export const siteName = siteConfig.name || ''
export const siteDescription = siteConfig.description || ''
export const siteImage = siteConfig.image || ''
export const siteLanguage = siteConfig.language || ''
export const siteOwner: SiteOwner = siteConfig.owner || {}
export const defaultTagColor = siteConfig.defaultTagColor || ''
export const brandName = siteConfig.brandName || siteOwner.name || ''

export const ownerProfile: Required<SiteOwner> = {
  name: siteOwner.name || '',
  headline: siteOwner.headline || '',
  greeting: siteOwner.greeting || '',
  greetingEmoji: siteOwner.greetingEmoji || '',
  bio: siteOwner.bio || '',
  bioEmphasis: siteOwner.bioEmphasis || '',
  quote: siteOwner.quote || '',
  avatar: siteOwner.avatar || '',
  tags: siteOwner.tags || [],
  githubUsername: siteOwner.githubUsername || '',
}

export const socialLinks: SiteSocialLink[] = (siteConfig.socials || []).filter(
  (l) => l.label && l.icon && l.url,
)

export const wechatConfig: Required<SiteWechat> = { qrUrl: siteConfig.wechat?.qrUrl || '' }

export const statsConfig: Required<SiteStats> = { startDate: siteConfig.stats?.startDate || '' }

export const githubConfig: Required<SiteGithub> = {
  username: siteConfig.github?.username || ownerProfile.githubUsername || '',
  repo: siteConfig.github?.repo || '',
  apiBase: norm(siteConfig.github?.apiBase || 'https://api.github.com'),
}

const gis = siteConfig.comments?.giscus
const giscusConfig: Required<SiteCommentsGiscus> = {
  host: gis?.host || '',
  repo: gis?.repo || githubConfig.repo || '',
  repoId: gis?.repoId || '',
  category: gis?.category || '',
  categoryId: gis?.categoryId || '',
  mapping: gis?.mapping || 'pathname',
  term: gis?.term || '',
  strict: gis?.strict ?? true,
  reactionsEnabled: gis?.reactionsEnabled ?? true,
  emitMetadata: gis?.emitMetadata ?? false,
  inputPosition: gis?.inputPosition || 'top',
  theme: gis?.theme || 'light',
  lang: gis?.lang || 'zh-CN',
  loading: gis?.loading || 'lazy',
}

export const commentsConfig = {
  enabled: Boolean(siteConfig.comments?.enabled),
  giscus: giscusConfig,
}

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
  tagMeta: siteConfig.tagMeta,
}

export const isGiscusReady = commentsConfig.enabled && hasValidGiscus

export const getTagMeta = (tag: string): import('./types').TagMeta => {
  const t = tag.replace(/\s+/g, '')
  const cfg = normalizedConfig.tagMeta?.[t]
  if (!cfg) return { color: defaultTagColor }
  if (typeof cfg === 'string') return { color: cfg }
  return {
    color: cfg.color || defaultTagColor,
    cover: cfg.cover,
    description: cfg.description,
  }
}

export const getTagColor = (tag: string) => getTagMeta(tag).color
