import rawConfig from '../../site.config.json'
import type { SiteConfig, SiteOwner, SiteSocialLink, SiteStats, SiteWechat } from './types'

export type { SiteConfig, SiteOwner, SiteSocialLink, SiteStats, SiteWechat } from './types'

export const siteConfig = rawConfig as SiteConfig
