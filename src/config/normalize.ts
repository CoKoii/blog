import {
  siteConfig,
  type SiteCommentsGiscus,
  type SiteOwner,
  type SiteSocialLink,
  type SiteStats,
  type SiteWechat,
} from './raw'

const normalizeSiteUrl = (url: string): string => url.replace(/\/+$/, '')

const siteUrl = siteConfig.url ? normalizeSiteUrl(siteConfig.url) : ''
const siteName = siteConfig.name || ''
const siteDescription = siteConfig.description || ''
const siteImage = siteConfig.image || ''
const siteLanguage = siteConfig.language || ''
const siteOwner: SiteOwner = siteConfig.owner || {}

const defaultTagColor = siteConfig.defaultTagColor || ''

const brandName = siteConfig.brandName || siteOwner.name || ''

const ownerProfile: Required<SiteOwner> = {
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

const isValidSocialLink = (link: SiteSocialLink): boolean =>
  Boolean(link.label) && Boolean(link.icon) && Boolean(link.url)

const socialLinks: SiteSocialLink[] = (siteConfig.socials || []).filter(isValidSocialLink)

const wechatConfig: Required<SiteWechat> = {
  qrUrl: siteConfig.wechat?.qrUrl || '',
}

const statsConfig: Required<SiteStats> = {
  startDate: siteConfig.stats?.startDate || '',
}

const rawGiscus = siteConfig.comments?.giscus

const giscusConfig: Required<SiteCommentsGiscus> = {
  host: rawGiscus?.host || '',
  repo: rawGiscus?.repo || '',
  repoId: rawGiscus?.repoId || '',
  category: rawGiscus?.category || '',
  categoryId: rawGiscus?.categoryId || '',
  mapping: rawGiscus?.mapping || 'pathname',
  term: rawGiscus?.term || '',
  strict: rawGiscus?.strict ?? true,
  reactionsEnabled: rawGiscus?.reactionsEnabled ?? true,
  emitMetadata: rawGiscus?.emitMetadata ?? false,
  inputPosition: rawGiscus?.inputPosition || 'top',
  theme: rawGiscus?.theme || 'light',
  lang: rawGiscus?.lang || 'zh-CN',
  loading: rawGiscus?.loading || 'lazy',
}

const commentsConfig = {
  enabled: Boolean(siteConfig.comments?.enabled),
  giscus: giscusConfig,
}

const hasValidGiscusConfig = Boolean(
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
  commentsConfig,
  hasValidGiscusConfig,
  tagMeta: siteConfig.tagMeta,
}
