import type { SearchDocument, SearchIndex } from '@/types/search'

const MIN_NGRAM = 2
const MAX_NGRAM = 4
const LATIN_RE = /[a-z0-9]+/g
const CJK_RE = /[\u4e00-\u9fff]+/g

const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase()

const splitTerms = (s: string) => Array.from(new Set(s.split(' ').filter(Boolean)))

const extractQueryTerms = (s: string): string[] => {
  const terms = new Set<string>()
  for (const t of s.match(LATIN_RE) || []) terms.add(t)

  for (const chunk of s.match(CJK_RE) || []) {
    const chars = Array.from(chunk)
    if (chars.length < MIN_NGRAM) continue
    if (chars.length <= MAX_NGRAM) {
      terms.add(chunk)
    } else {
      for (let i = 0; i + MAX_NGRAM <= chars.length; i++) {
        terms.add(chars.slice(i, i + MAX_NGRAM).join(''))
      }
    }
  }
  return Array.from(terms)
}

const parseKeyword = (kw: string) => {
  const norm = normalize(kw)
  return {
    normalized: norm,
    highlight: splitTerms(norm),
    query: extractQueryTerms(norm),
  }
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const toTs = (s: string) => {
  const ts = Date.parse(s)
  return Number.isNaN(ts) ? 0 : ts
}

const intersect = (postings: number[][]): number[] => {
  if (!postings.length) return []
  const sorted = [...postings].sort((a, b) => a.length - b.length)
  const first = sorted[0]
  if (!first) return []
  let result = [...first]

  for (let i = 1; i < sorted.length; i++) {
    const p = sorted[i]
    if (!p || !p.length) return []

    const inter: number[] = []
    let l = 0,
      r = 0
    while (l < result.length && r < p.length) {
      const lv = result[l]
      const rv = p[r]
      if (lv == null || rv == null) break
      if (lv === rv) {
        inter.push(lv)
        l++
        r++
      } else if (lv < rv) {
        l++
      } else {
        r++
      }
    }
    result = inter
    if (!result.length) break
  }
  return result
}

const findMatch = (text: string, query: string, terms: string[]): number => {
  const exact = text.indexOf(query)
  if (exact >= 0) return exact

  let first = -1
  for (const t of terms) {
    const idx = text.indexOf(t)
    if (idx >= 0 && (first < 0 || idx < first)) first = idx
  }
  return first
}

const buildSnippet = (doc: SearchDocument, query: string, terms: string[]): string => {
  const src = [doc.description, doc.content].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
  if (!src) return '暂无摘要'

  const match = findMatch(src.toLowerCase(), query, terms)
  const len = 96
  const start = Math.max(0, match - 28)
  const end = Math.min(src.length, start + len)
  const pre = start > 0 ? '...' : ''
  const suf = end < src.length ? '...' : ''
  return `${pre}${src.slice(start, end).trim()}${suf}`
}

const getCandidates = (terms: string[], idx: PreparedSearchIndex): number[] => {
  if (!terms.length) return idx.allDocs

  const postings: number[][] = []
  for (const t of terms) {
    const p = idx.inverted[t]
    if (!p?.length) return idx.allDocs
    postings.push(p)
  }
  return intersect(postings)
}

export type PreparedSearchDocument = {
  source: SearchDocument
  normTitle: string
  normDesc: string
  normContent: string
  normMeta: string
}

export type PreparedSearchIndex = {
  docs: PreparedSearchDocument[]
  inverted: Record<string, number[]>
  allDocs: number[]
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
  docs: [],
  inverted: {},
  allDocs: [],
})

export const prepareSearchIndex = (idx: SearchIndex): PreparedSearchIndex => {
  const docs = idx.documents.map((d) => ({
    source: d,
    normTitle: normalize(d.title),
    normDesc: normalize(d.description),
    normContent: normalize(d.content),
    normMeta: normalize([d.category, ...d.tags].join(' ')),
  }))

  return {
    docs,
    inverted: idx.invertedIndex,
    allDocs: Array.from({ length: docs.length }, (_, i) => i),
  }
}

export const searchDocuments = (
  kw: string,
  idx: PreparedSearchIndex,
  limit = 12,
): SearchResult[] => {
  const { normalized, highlight, query } = parseKeyword(kw)
  if (!normalized) return []

  const candidates = getCandidates(query, idx)
  if (!candidates.length) return []

  const results: SearchResult[] = []

  for (const i of candidates) {
    const doc = idx.docs[i]
    if (!doc) continue

    let score = 0

    const titleIdx = doc.normTitle.indexOf(normalized)
    if (titleIdx >= 0) score += 180 - Math.min(titleIdx, 80)

    const descIdx = doc.normDesc.indexOf(normalized)
    if (descIdx >= 0) score += 90 - Math.min(descIdx, 60)

    const contentIdx = doc.normContent.indexOf(normalized)
    if (contentIdx >= 0) score += 45 - Math.min(Math.floor(contentIdx / 24), 30)

    let matched = 0
    for (const t of highlight) {
      if (doc.normTitle.includes(t)) {
        score += 55
        matched++
      } else if (doc.normDesc.includes(t)) {
        score += 30
        matched++
      } else if (doc.normContent.includes(t)) {
        score += 14
        matched++
      } else if (doc.normMeta.includes(t)) {
        score += 8
        matched++
      }
    }

    if (matched === highlight.length) score += 35
    if (score <= 0) continue

    results.push({
      ...doc.source,
      score,
      snippet: buildSnippet(doc.source, normalized, highlight),
    })
  }

  results.sort((a, b) => (a.score !== b.score ? b.score - a.score : toTs(b.date) - toTs(a.date)))
  return results.slice(0, limit)
}

export const splitHighlightSegments = (text: string, kw: string): HighlightSegment[] => {
  const norm = text.replace(/\s+/g, ' ').trim()
  if (!norm) return []

  const terms = splitTerms(normalize(kw))
  if (!terms.length) return [{ text: norm, match: false }]

  const escaped = terms.map(escapeRe).sort((a, b) => b.length - a.length)
  const re = new RegExp(`(${escaped.join('|')})`, 'gi')
  const set = new Set(terms)

  return norm
    .split(re)
    .filter(Boolean)
    .map((s) => ({
      text: s,
      match: set.has(s.toLowerCase()),
    }))
}
