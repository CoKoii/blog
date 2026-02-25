import type { SearchDocument, SearchIndex } from '@/types/search'

const MIN_CJK_NGRAM_LENGTH = 2
const MAX_CJK_NGRAM_LENGTH = 4
const LATIN_TERM_REGEXP = /[a-z0-9]+/g
const CJK_TERM_REGEXP = /[\u4e00-\u9fff]+/g

const normalizeWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim()

const normalizeForSearch = (value: string): string => normalizeWhitespace(value).toLowerCase()

const splitTermsFromNormalized = (normalized: string): string[] =>
  Array.from(new Set(normalized.split(' ').filter(Boolean)))

const extractQueryTermsFromNormalized = (normalized: string): string[] => {
  const terms = new Set<string>()

  const latinTerms = normalized.match(LATIN_TERM_REGEXP) || []
  for (const term of latinTerms) {
    terms.add(term)
  }

  const cjkChunks = normalized.match(CJK_TERM_REGEXP) || []
  for (const chunk of cjkChunks) {
    const chars = Array.from(chunk)
    if (chars.length < MIN_CJK_NGRAM_LENGTH) {
      continue
    }
    if (chars.length <= MAX_CJK_NGRAM_LENGTH) {
      terms.add(chunk)
      continue
    }

    for (let index = 0; index + MAX_CJK_NGRAM_LENGTH <= chars.length; index += 1) {
      terms.add(chars.slice(index, index + MAX_CJK_NGRAM_LENGTH).join(''))
    }
  }

  return Array.from(terms)
}

const parseKeyword = (keyword: string) => {
  const normalizedKeyword = normalizeForSearch(keyword)
  const highlightTerms = splitTermsFromNormalized(normalizedKeyword)
  const queryTerms = extractQueryTermsFromNormalized(normalizedKeyword)

  return {
    normalizedKeyword,
    highlightTerms,
    queryTerms,
  }
}

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const toTimestamp = (value: string): number => {
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const intersectSortedPostings = (postings: number[][]): number[] => {
  if (!postings.length) return []
  const sortedPostings = [...postings].sort((a, b) => a.length - b.length)
  const [firstPosting, ...restPostings] = sortedPostings
  if (!firstPosting) return []
  let result = [...firstPosting]

  for (const posting of restPostings) {
    if (!posting.length) return []

    const intersection: number[] = []
    let left = 0
    let right = 0

    while (left < result.length && right < posting.length) {
      const leftValue = result[left]
      const rightValue = posting[right]
      if (leftValue == null || rightValue == null) break

      if (leftValue === rightValue) {
        intersection.push(leftValue)
        left += 1
        right += 1
        continue
      }
      if (leftValue < rightValue) {
        left += 1
      } else {
        right += 1
      }
    }

    result = intersection
    if (!result.length) {
      break
    }
  }

  return result
}

const findBestMatchIndex = (text: string, query: string, terms: string[]): number => {
  const exactIndex = text.indexOf(query)
  if (exactIndex >= 0) return exactIndex

  let firstIndex = -1
  for (const term of terms) {
    const index = text.indexOf(term)
    if (index < 0) continue
    if (firstIndex < 0 || index < firstIndex) {
      firstIndex = index
    }
  }

  return firstIndex
}

const buildSnippet = (document: SearchDocument, query: string, terms: string[]): string => {
  const source = normalizeWhitespace([document.description, document.content].filter(Boolean).join(' '))
  if (!source) return '暂无摘要'

  const normalizedSource = source.toLowerCase()
  const matchIndex = findBestMatchIndex(normalizedSource, query, terms)

  const snippetLength = 96
  const start = Math.max(0, matchIndex - 28)
  const end = Math.min(source.length, start + snippetLength)
  const prefix = start > 0 ? '...' : ''
  const suffix = end < source.length ? '...' : ''

  return `${prefix}${source.slice(start, end).trim()}${suffix}`
}

const buildDefaultDocIndexes = (count: number): number[] => Array.from({ length: count }, (_, index) => index)

const resolveCandidateDocIndexes = (terms: string[], searchIndex: PreparedSearchIndex): number[] => {
  if (!terms.length) return searchIndex.allDocumentIndexes

  const postings: number[][] = []
  for (const term of terms) {
    const posting = searchIndex.invertedIndex[term]
    if (!posting?.length) {
      // 回退全量候选，避免因为词条未建索引而漏结果
      return searchIndex.allDocumentIndexes
    }
    postings.push(posting)
  }

  return intersectSortedPostings(postings)
}

export type PreparedSearchDocument = {
  source: SearchDocument
  normalizedTitle: string
  normalizedDescription: string
  normalizedContent: string
  normalizedMeta: string
}

export type PreparedSearchIndex = {
  documents: PreparedSearchDocument[]
  invertedIndex: Record<string, number[]>
  allDocumentIndexes: number[]
}

export interface SearchResult extends SearchDocument {
  score: number
  snippet: string
}

export interface HighlightSegment {
  text: string
  match: boolean
}

export const createEmptyPreparedSearchIndex = (): PreparedSearchIndex => ({
  documents: [],
  invertedIndex: {},
  allDocumentIndexes: [],
})

export const prepareSearchIndex = (searchIndex: SearchIndex): PreparedSearchIndex => {
  const documents = searchIndex.documents.map((document) => ({
    source: document,
    normalizedTitle: normalizeForSearch(document.title),
    normalizedDescription: normalizeForSearch(document.description),
    normalizedContent: normalizeForSearch(document.content),
    normalizedMeta: normalizeForSearch([document.category, ...document.tags].join(' ')),
  }))

  return {
    documents,
    invertedIndex: searchIndex.invertedIndex,
    allDocumentIndexes: buildDefaultDocIndexes(documents.length),
  }
}

export const searchDocuments = (
  keyword: string,
  searchIndex: PreparedSearchIndex,
  limit = 12,
): SearchResult[] => {
  const { normalizedKeyword, highlightTerms, queryTerms } = parseKeyword(keyword)
  if (!normalizedKeyword) return []

  const candidateIndexes = resolveCandidateDocIndexes(queryTerms, searchIndex)
  if (!candidateIndexes.length) return []

  const results: SearchResult[] = []

  for (const index of candidateIndexes) {
    const document = searchIndex.documents[index]
    if (!document) continue

    let score = 0

    const titleExactIndex = document.normalizedTitle.indexOf(normalizedKeyword)
    if (titleExactIndex >= 0) {
      score += 180 - Math.min(titleExactIndex, 80)
    }

    const descriptionExactIndex = document.normalizedDescription.indexOf(normalizedKeyword)
    if (descriptionExactIndex >= 0) {
      score += 90 - Math.min(descriptionExactIndex, 60)
    }

    const contentExactIndex = document.normalizedContent.indexOf(normalizedKeyword)
    if (contentExactIndex >= 0) {
      score += 45 - Math.min(Math.floor(contentExactIndex / 24), 30)
    }

    let matchedTermCount = 0
    for (const term of highlightTerms) {
      if (document.normalizedTitle.includes(term)) {
        score += 55
        matchedTermCount += 1
        continue
      }

      if (document.normalizedDescription.includes(term)) {
        score += 30
        matchedTermCount += 1
        continue
      }

      if (document.normalizedContent.includes(term)) {
        score += 14
        matchedTermCount += 1
        continue
      }

      if (document.normalizedMeta.includes(term)) {
        score += 8
        matchedTermCount += 1
      }
    }

    if (matchedTermCount === highlightTerms.length) {
      score += 35
    }

    if (score <= 0) continue

    results.push({
      ...document.source,
      score,
      snippet: buildSnippet(document.source, normalizedKeyword, highlightTerms),
    })
  }

  results.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score
    return toTimestamp(b.date) - toTimestamp(a.date)
  })

  return results.slice(0, limit)
}

export const splitHighlightSegments = (text: string, keyword: string): HighlightSegment[] => {
  const normalizedText = normalizeWhitespace(text)
  if (!normalizedText) return []

  const terms = splitTermsFromNormalized(normalizeForSearch(keyword))
  if (!terms.length) {
    return [{ text: normalizedText, match: false }]
  }

  const escapedTerms = terms.map(escapeRegExp).sort((a, b) => b.length - a.length)
  const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi')
  const termSet = new Set(terms)

  return normalizedText.split(pattern).filter(Boolean).map((segment) => ({
    text: segment,
    match: termSet.has(segment.toLowerCase()),
  }))
}
