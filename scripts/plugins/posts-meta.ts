import fs from 'node:fs'
import path from 'node:path'

import matter from 'gray-matter'
import type { HmrContext, ViteDevServer } from 'vite'

import { listPostFiles } from '../utils/posts.mjs'
import { buildArticlePath, toPinyinSlug } from '../utils/slug.mjs'

const POSTS_META_VIRTUAL_MODULE_ID = 'virtual:posts-meta'
const SEARCH_INDEX_VIRTUAL_MODULE_ID = 'virtual:search-index'
const ALL_TAG_SLUG = 'all'
const MAX_SEARCH_CONTENT_LENGTH = 12000
const MAX_INDEX_TERMS_PER_DOCUMENT = 480
const MIN_LATIN_PREFIX_LENGTH = 2
const MAX_LATIN_PREFIX_LENGTH = 8
const MIN_CJK_NGRAM_LENGTH = 2
const MAX_CJK_NGRAM_LENGTH = 4
const LATIN_TERM_REGEXP = /[a-z0-9]+/g
const CJK_TERM_REGEXP = /[\u4e00-\u9fff]+/g
const CJK_CHAR_REGEXP = /[\u3400-\u9fff]/g
const LATIN_WORD_REGEXP = /[a-z0-9]+(?:[._-][a-z0-9]+)*/gi
const CJK_CHARS_PER_MINUTE = 200
const LATIN_WORDS_PER_MINUTE = 180

type PostFileEntry = {
  category: string
  slug: string
  fileName: string
  filePath: string
}

type PostFrontmatter = Record<string, unknown>

type ParsedPostEntry = {
  id: string
  category: string
  categorySlug: string
  slug: string
  sourceSlug: string
  fileName: string
  frontmatter: PostFrontmatter
  markdownContent: string
  wordCount: number
  readTime: number
}

type SearchDocument = {
  id: string
  title: string
  category: string
  categorySlug: string
  slug: string
  url: string
  description: string
  content: string
  tags: string[]
  date: string
}

type SearchIndex = {
  documents: SearchDocument[]
  invertedIndex: Record<string, number[]>
}

export const getPostRoutes = (rootDir: string) => {
  return listPostFiles(rootDir).map((post: PostFileEntry) =>
    buildArticlePath(post.category, post.slug),
  )
}

export const getTagRoutes = (rootDir: string) => {
  const tagSlugs = new Set<string>()
  for (const post of listPostFiles(rootDir)) {
    tagSlugs.add(toPinyinSlug(post.category))
  }

  tagSlugs.delete(ALL_TAG_SLUG)

  return [
    `/tags/${ALL_TAG_SLUG}`,
    ...Array.from(tagSlugs)
      .sort()
      .map((slug) => `/tags/${slug}`),
  ]
}

const getStringValue = (value: unknown): string => (typeof value === 'string' ? value : '')

const getStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

const formatDateValue = (value: Date): string => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getDateValue = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDateValue(value)
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return formatDateValue(date)
    }
  }
  return ''
}

const collapseWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim()

const normalizeForSearch = (value: string): string => collapseWhitespace(value).toLowerCase()

const stripMarkdown = (value: string): string => {
  let text = value
  text = text.replace(/```[\s\S]*?```/g, ' ')
  text = text.replace(/~~~[\s\S]*?~~~/g, ' ')
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1 ')
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ')
  text = text.replace(/`([^`]+)`/g, '$1')
  text = text.replace(/<[^>]+>/g, ' ')
  text = text.replace(/(^|\n)\s{0,3}#{1,6}\s+/g, '$1')
  text = text.replace(/(^|\n)\s{0,3}>\s?/g, '$1')
  text = text.replace(/(^|\n)\s*[-*+]\s+/g, '$1')
  text = text.replace(/(^|\n)\s*\d+\.\s+/g, '$1')
  text = text.replace(/[*_~]/g, '')
  return collapseWhitespace(text)
}

const estimateReadingMetrics = (markdownContent: string) => {
  const text = stripMarkdown(markdownContent)
  const cjkChars = text.match(CJK_CHAR_REGEXP)?.length || 0
  const latinWords = text.replace(CJK_CHAR_REGEXP, ' ').match(LATIN_WORD_REGEXP)?.length || 0
  const wordCount = cjkChars + latinWords

  if (!wordCount) {
    return { wordCount: 0, readTime: 0 }
  }

  const readTime = Math.max(
    1,
    Math.ceil(cjkChars / CJK_CHARS_PER_MINUTE + latinWords / LATIN_WORDS_PER_MINUTE),
  )

  return { wordCount, readTime }
}

const addLatinTokenTerms = (token: string, terms: Set<string>, maxTerms: number): boolean => {
  if (!token) return false

  terms.add(token)
  if (terms.size >= maxTerms) return true

  const maxPrefixLength = Math.min(token.length, MAX_LATIN_PREFIX_LENGTH)
  for (let length = MIN_LATIN_PREFIX_LENGTH; length <= maxPrefixLength; length += 1) {
    terms.add(token.slice(0, length))
    if (terms.size >= maxTerms) return true
  }

  return false
}

const addCjkChunkTerms = (chunk: string, terms: Set<string>, maxTerms: number): boolean => {
  const chars = Array.from(chunk)
  if (chars.length < MIN_CJK_NGRAM_LENGTH) return false

  for (let start = 0; start < chars.length; start += 1) {
    for (
      let length = MIN_CJK_NGRAM_LENGTH;
      length <= MAX_CJK_NGRAM_LENGTH && start + length <= chars.length;
      length += 1
    ) {
      terms.add(chars.slice(start, start + length).join(''))
      if (terms.size >= maxTerms) return true
    }
  }

  return false
}

const extractSearchTerms = (
  value: string,
  maxTerms = MAX_INDEX_TERMS_PER_DOCUMENT,
): Set<string> => {
  const normalized = normalizeForSearch(value)
  const terms = new Set<string>()

  const latinTokens = normalized.match(LATIN_TERM_REGEXP) || []
  for (const token of latinTokens) {
    if (addLatinTokenTerms(token, terms, maxTerms)) {
      return terms
    }
  }

  const cjkChunks = normalized.match(CJK_TERM_REGEXP) || []
  for (const chunk of cjkChunks) {
    if (addCjkChunkTerms(chunk, terms, maxTerms)) {
      return terms
    }
  }

  return terms
}

const collectParsedPosts = (rootDir: string): ParsedPostEntry[] => {
  const postFiles = [...listPostFiles(rootDir)].sort((a, b) => a.filePath.localeCompare(b.filePath))

  return postFiles.map((post) => {
    const source = fs.readFileSync(post.filePath, 'utf-8')
    const { data, content } = matter(source)
    const metrics = estimateReadingMetrics(content)

    return {
      id: `${post.category}/${post.slug}`,
      category: post.category,
      categorySlug: toPinyinSlug(post.category),
      slug: toPinyinSlug(post.slug),
      sourceSlug: post.slug,
      fileName: post.fileName,
      frontmatter: data as PostFrontmatter,
      markdownContent: content,
      wordCount: metrics.wordCount,
      readTime: metrics.readTime,
    }
  })
}

const createPostsMetaData = (posts: ParsedPostEntry[]) => {
  return posts.map((post) => ({
    id: post.id,
    category: post.category,
    categorySlug: post.categorySlug,
    slug: post.slug,
    path: `/posts/${post.category}/${post.fileName}`,
    frontmatter: {
      ...post.frontmatter,
      wordCount: post.wordCount,
      readTime: post.readTime,
    },
  }))
}

const createSearchDocuments = (posts: ParsedPostEntry[]): SearchDocument[] => {
  return posts.map((post) => {
    const title = getStringValue(post.frontmatter.title) || post.sourceSlug
    const description = getStringValue(post.frontmatter.description)
    const tags = getStringArray(post.frontmatter.tags)
    const date = getDateValue(post.frontmatter.date) || getDateValue(post.frontmatter.publishDate)
    const content = stripMarkdown(post.markdownContent)

    return {
      id: post.id,
      title,
      category: post.category,
      categorySlug: post.categorySlug,
      slug: post.slug,
      url: `/article/${post.categorySlug}/${post.slug}`,
      description,
      content: `${description} ${content}`.trim().slice(0, MAX_SEARCH_CONTENT_LENGTH),
      tags,
      date,
    }
  })
}

const createSearchIndexData = (documents: SearchDocument[]): SearchIndex => {
  const invertedMap = new Map<string, number[]>()

  documents.forEach((document, docIndex) => {
    const searchableText = [
      document.title,
      document.description,
      document.content,
      document.category,
      ...document.tags,
    ]
      .filter(Boolean)
      .join(' ')

    const terms = extractSearchTerms(searchableText)
    for (const term of terms) {
      const list = invertedMap.get(term)
      if (list) {
        list.push(docIndex)
      } else {
        invertedMap.set(term, [docIndex])
      }
    }
  })

  return {
    documents,
    invertedIndex: Object.fromEntries(invertedMap.entries()),
  }
}

export const createPostsMetaPlugin = (rootDir: string) => {
  const postsDir = path.resolve(rootDir, 'posts')
  const resolvedPostsMetaModuleId = `\0${POSTS_META_VIRTUAL_MODULE_ID}`
  const resolvedSearchIndexModuleId = `\0${SEARCH_INDEX_VIRTUAL_MODULE_ID}`
  let parsedPostsCache: ParsedPostEntry[] | null = null

  const getParsedPosts = () => {
    if (parsedPostsCache) return parsedPostsCache
    parsedPostsCache = collectParsedPosts(rootDir)
    return parsedPostsCache
  }

  const invalidateParsedPostsCache = () => {
    parsedPostsCache = null
  }

  return {
    name: 'posts-meta-plugin',
    resolveId(id: string) {
      if (id === POSTS_META_VIRTUAL_MODULE_ID) return resolvedPostsMetaModuleId
      if (id === SEARCH_INDEX_VIRTUAL_MODULE_ID) return resolvedSearchIndexModuleId
      return undefined
    },
    load(id: string) {
      const parsedPosts = getParsedPosts()

      if (id === resolvedPostsMetaModuleId) {
        const postsMeta = createPostsMetaData(parsedPosts)
        return `export const postsMeta = ${JSON.stringify(postsMeta, null, 2)}`
      }

      if (id === resolvedSearchIndexModuleId) {
        const documents = createSearchDocuments(parsedPosts)
        const searchIndex = createSearchIndexData(documents)
        return `export const searchIndex = ${JSON.stringify(searchIndex, null, 2)}`
      }

      return undefined
    },
    configureServer(server: ViteDevServer) {
      server.watcher.add(postsDir)
    },
    handleHotUpdate(ctx: HmrContext) {
      if (!ctx.file.startsWith(postsDir) || !ctx.file.endsWith('.md')) return undefined

      invalidateParsedPostsCache()

      const moduleIds = [resolvedPostsMetaModuleId, resolvedSearchIndexModuleId]
      for (const moduleId of moduleIds) {
        const mod = ctx.server.moduleGraph.getModuleById(moduleId)
        if (mod) ctx.server.moduleGraph.invalidateModule(mod)
      }

      ctx.server.ws.send({ type: 'full-reload' })
      return []
    },
  }
}
