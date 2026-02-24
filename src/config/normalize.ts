import {
  siteConfig,
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
  tagMeta: siteConfig.tagMeta,
}
