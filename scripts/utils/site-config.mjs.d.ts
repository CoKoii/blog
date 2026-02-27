type Text = string

export type SiteConfigRecord = {
  site: {
    url: Text
    name: Text
    description: Text
    image: Text
    language: Text
    brandName: Text
  }
  owner: {
    name: Text
    headline: Text
    greeting: Text
    greetingEmoji: Text
    bio: Text
    bioEmphasis: Text
    quote: Text
    avatar: Text
    tags: Text[]
  }
  socials: Array<{ label: Text; icon: Text; url: Text }>
  wechat: { qrUrl: Text }
  stats: { startDate: Text }
  github: {
    username: Text
    repo: Text
    apiBase: Text
  }
  comments: {
    enabled: boolean
    giscus: {
      host: Text
      repo: Text
      repoId: Text
      category: Text
      categoryId: Text
      mapping: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number'
      term: Text
      strict: boolean
      reactionsEnabled: boolean
      emitMetadata: boolean
      inputPosition: 'top' | 'bottom'
      theme: Text
      lang: Text
      loading: 'lazy' | 'eager'
    }
  }
  tags: {
    defaultColor: Text
    meta: Record<Text, Text | { color: Text; cover: Text; description: Text }>
  }
}

export function loadSiteConfig(rootDir?: string): SiteConfigRecord
export function normalizeSiteUrl(url: unknown): string
export function resolveSiteMeta(options?: { rootDir?: string }): {
  siteConfig: SiteConfigRecord
  siteUrl: string
  siteName: string
  siteDescription: string
  siteLanguage: string
}
