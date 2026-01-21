declare module './scripts/utils/slug.mjs' {
  export function toPinyinSlug(text: string): string
  export function buildArticlePath(category: string, slug: string): string
}

declare module './scripts/utils/site-config.mjs' {
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
}

declare module './scripts/utils/posts.mjs' {
  export type PostFileEntry = {
    category: string
    slug: string
    fileName: string
    filePath: string
  }

  export function listPostFiles(rootDir?: string): PostFileEntry[]
}
