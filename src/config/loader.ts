import rawConfig from '../../site.config.json'
import { validateSiteConfig } from './validator'

export const siteConfig = validateSiteConfig(rawConfig)
