import rawConfig from '../../site.config.json'
import type { SiteConfig } from './types'
import { validateSiteConfig } from './validator'

export const siteConfig: SiteConfig = validateSiteConfig(rawConfig)
