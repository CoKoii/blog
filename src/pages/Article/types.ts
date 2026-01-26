export type TocItem = {
  id: string
  text: string
  level: number
}

export type ArticleMeta = {
  title: string
  coverImage: string
  tags: string[]
  wordCount: number
  readTime: number
  publishDate: string
  location: string
  comments: number
}
