export type SeoSchemaValue =
  | string
  | number
  | boolean
  | Record<string, string | number | boolean>

export interface SeoMetaConfig {
  title: string
  description: string
  image?: string
  url: string
  type: 'website' | 'article'
  author?: string
  publishDate?: string
  modifiedDate?: string
  keywords?: string[]
  schemaData?: Record<string, SeoSchemaValue>
}

export interface MetaTag extends Record<string, string | undefined> {
  name?: string
  content?: string
  property?: string
}

export interface HeadConfig {
  title: string
  htmlAttrs: Record<string, string>
  link: Array<Record<string, string>>
  meta: MetaTag[]
  script?: Array<Record<string, string>>
}
