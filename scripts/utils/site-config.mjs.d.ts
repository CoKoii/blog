export function loadSiteConfig(rootDir?: string): Record<string, unknown>
export function normalizeSiteUrl(url: unknown): string
export function resolveSiteMeta(options?: {
  env?: Record<string, string | undefined>
  rootDir?: string
}): {
  siteConfig: Record<string, unknown>
  siteUrl: string
  siteName: string
  siteDescription: string
  siteLanguage: string
}
