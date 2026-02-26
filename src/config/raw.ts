import rawConfig from '../../site.config.json'
import type { SiteConfig } from './types'

export type {
  SiteComments,
  SiteCommentsGiscus,
  SiteGithub,
  SiteConfig,
  SiteOwner,
  SiteSocialLink,
  SiteStats,
  SiteWechat,
} from './types'

const isSiteConfig = (value: unknown): value is SiteConfig =>
  typeof value === 'object' && value !== null

export const siteConfig: SiteConfig = isSiteConfig(rawConfig) ? rawConfig : {}
