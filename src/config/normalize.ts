import {
  siteConfig,
  type SiteOwner,
  type SiteSocialLink,
  type SiteStats,
  type SiteWechat,
} from './raw'

const normalizeSiteUrl = (url: string): string => url.replace(/\/+$/, '')

const siteUrl = siteConfig.url ? normalizeSiteUrl(siteConfig.url) : (siteConfig.url as string)
const siteName = siteConfig.name as string
const siteDescription = siteConfig.description as string
const siteImage = siteConfig.image as string
const siteLanguage = siteConfig.language as string
const siteOwner = siteConfig.owner as SiteOwner

const defaultTagColor = siteConfig.defaultTagColor as string

const brandName = (siteConfig.brandName || siteConfig.owner?.name) as string

const ownerProfile = (siteConfig.owner || {}) as Required<SiteOwner>

const socialLinks = siteConfig.socials as SiteSocialLink[]

const wechatConfig = (siteConfig.wechat || {}) as Required<SiteWechat>

const statsConfig = (siteConfig.stats || {}) as Required<SiteStats>

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
