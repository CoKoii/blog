export interface SearchDocument {
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

export type InvertedIndex = Record<string, number[]>

export interface SearchIndex {
  invertedIndex: InvertedIndex
  documents: SearchDocument[]
}
