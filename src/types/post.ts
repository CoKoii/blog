import type { Component } from 'vue'

/**
 * 文章 Frontmatter 接口
 */
export interface PostFrontmatter {
  title?: string
  description?: string
  date?: string
  publishDate?: string
  tags?: string[]
  coverImage?: string
  wordCount?: number
  readTime?: number
  views?: number
  location?: string
  comments?: number
  author?: string
  category?: string
  [key: string]: unknown
}

/**
 * 文章元数据接口
 */
export interface PostMeta {
  id: string
  category: string
  path: string
  frontmatter: PostFrontmatter
}

/**
 * 文章模块接口（从 Markdown 加载的模块）
 */
export interface PostModule {
  default: Component
  frontmatter: PostFrontmatter
}

/**
 * Markdown 文件模块类型（用于 import.meta.glob）
 */
export type MarkdownModule = Record<string, unknown> & {
  frontmatter?: PostFrontmatter
  default?: Component
}
