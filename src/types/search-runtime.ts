import type { SearchDocument } from '@/types/search'

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
