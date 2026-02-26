export type SiteOwner = {
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

export type SiteSocialLink = {
  label: string
  icon: string
  url: string
}

export type SiteWechat = {
  qrUrl: string
}

export type SiteStats = {
  startDate: string
}

export type SiteGithub = {
  username: string
  repo: string
  apiBase: string
}

export type SiteCommentsGiscus = {
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

export type SiteComments = {
  enabled: boolean
  giscus: SiteCommentsGiscus
}

export type TagConfig =
  | string
  | {
      color: string
      cover?: string
      description?: string
    }

export type TagMeta = {
  color: string
  cover?: string
  description?: string
}

export type SiteMeta = {
  url: string
  name: string
  description: string
  image: string
  language: string
  brandName: string
}

export type SiteTags = {
  defaultColor: string
  meta: Record<string, TagConfig>
}

export type SiteConfig = {
  site: SiteMeta
  owner: SiteOwner
  socials: SiteSocialLink[]
  wechat: SiteWechat
  stats: SiteStats
  github: SiteGithub
  comments: SiteComments
  tags: SiteTags
}
