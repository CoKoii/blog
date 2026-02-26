import rawConfig from '../../site.config.json'
import type { SiteConfig } from './types'
import { validateSiteConfig } from './validator'

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

export const siteConfig: SiteConfig = validateSiteConfig(rawConfig)
