export type GithubRepoStats = {
  projects?: number
  stars?: number
  updatedAt?: string | null
}

export type GithubCommentsData = {
  byPath?: Record<string, number>
  detailsByPath?: Record<string, GithubCommentDetail[]>
}

export type GithubCommentDetail = {
  id: string
  author: string
  avatarUrl: string
  body: string
  createdAt: string
}

export type GithubDataPayload = {
  generatedAt?: string
  github?: GithubRepoStats
  comments?: GithubCommentsData
}
