export type SiteMeta = {
  siteConfig: Record<string, unknown>
  siteUrl: string
  siteName: string
  siteDescription: string
  siteLanguage: string
}

// @ts-expect-error: .mjs runtime module isn't typed in TS build
export { loadSiteConfig, normalizeSiteUrl, resolveSiteMeta } from './site-config.mjs'
