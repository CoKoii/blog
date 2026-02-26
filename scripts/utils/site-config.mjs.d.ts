export type SiteConfigRecord = {
  site: {
    url: string
    name: string
    description: string
    image: string
    language: string
    brandName: string
  }
  owner: {
    name: string
    headline: string
    greeting: string
    greetingEmoji: string
    bio: string
    bioEmphasis: string
    quote: string
    avatar: string
    tags: string[]
  }
  socials: Array<{ label: string; icon: string; url: string }>
  wechat: { qrUrl: string }
  stats: { startDate: string }
  github: {
    username: string
    repo: string
    apiBase: string
  }
  comments: {
    enabled: boolean
    giscus: {
      host: string
      repo: string
      repoId: string
      category: string
      categoryId: string
      mapping: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number'
      term: string
      strict: boolean
      reactionsEnabled: boolean
      emitMetadata: boolean
      inputPosition: 'top' | 'bottom'
      theme: string
      lang: string
      loading: 'lazy' | 'eager'
    }
  }
  tags: {
    defaultColor: string
    meta: Record<string, string | { color: string; cover: string; description: string }>
  }
}

export function loadSiteConfig(rootDir?: string): SiteConfigRecord
export function normalizeSiteUrl(url: unknown): string
export function resolveSiteMeta(options?: {
  rootDir?: string
}): {
  siteConfig: SiteConfigRecord
  siteUrl: string
  siteName: string
  siteDescription: string
  siteLanguage: string
}
