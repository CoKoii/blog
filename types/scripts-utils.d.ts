declare module './scripts/utils/slug.mjs' {
  export function toPinyinSlug(text: string): string
  export function buildArticlePath(category: string, slug: string): string
}

declare module './scripts/utils/site-config.mjs' {
  export type SiteMeta = {
    siteConfig: Record<string, unknown>
    siteUrl: string
    siteName: string
    siteDescription: string
    siteLanguage: string
  }

  export function loadSiteConfig(rootDir?: string): Record<string, unknown>
  export function normalizeSiteUrl(url: string): string
  export function resolveSiteMeta(options?: {
    env?: Record<string, string | undefined>
    rootDir?: string
  }): SiteMeta
}
