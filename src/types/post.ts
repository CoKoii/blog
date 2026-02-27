import type { Component } from 'vue'

export interface PostFrontmatter {
  title?: string
  description?: string
  date?: string
  publishDate?: string
  tags?: string[]
  coverImage?: string
  wordCount?: number
  readTime?: number
  location?: string
  author?: string
  category?: string
  [key: string]: unknown
}

export interface PostMeta {
  id: string
  category: string
  categorySlug: string
  slug: string
  path: string
  frontmatter: PostFrontmatter
}

export interface PostModule {
  default: Component
  frontmatter: PostFrontmatter
}

export type MarkdownModule = Record<string, unknown> & {
  frontmatter?: PostFrontmatter
  default?: Component
}
