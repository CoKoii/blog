import type { SiteOwner, SiteSocialLink, SiteStats, SiteWechat } from './raw'
import { normalizedConfig } from './normalize'

export const brandName = normalizedConfig.brandName

export const ownerProfile: Required<SiteOwner> = normalizedConfig.ownerProfile

export const socialLinks: SiteSocialLink[] = normalizedConfig.socialLinks

export const wechatConfig: Required<SiteWechat> = normalizedConfig.wechatConfig

export const statsConfig: Required<SiteStats> = normalizedConfig.statsConfig
