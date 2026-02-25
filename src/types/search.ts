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

export interface SearchIndex {
  documents: SearchDocument[]
  invertedIndex: Record<string, number[]>
}
