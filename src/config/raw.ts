import rawConfig from '../../site.config.json'

export type SiteOwner = {
  name?: string
  headline?: string
  greeting?: string
  greetingEmoji?: string
  bio?: string
  bioEmphasis?: string
  quote?: string
  avatar?: string
  tags?: string[]
  githubUsername?: string
}

export type SiteSocialLink = {
  label: string
  icon: string
  url: string
}

export type SiteWechat = {
  qrUrl?: string
}

export type SiteStats = {
  startDate?: string
}

export type SiteConfig = {
  url?: string
  name?: string
  description?: string
  image?: string
  language?: string
  tagColors?: Record<string, string>
  defaultTagColor?: string
  brandName?: string
  owner?: SiteOwner
  socials?: SiteSocialLink[]
  wechat?: SiteWechat
  stats?: SiteStats
}

export const siteConfig = rawConfig as SiteConfig
