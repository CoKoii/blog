export type GithubRepoStats = {
  projects?: number
  stars?: number
  updatedAt?: string | null
}

export type GithubCommentsData = {
  byPath?: Record<string, number>
}

export type GithubDataPayload = {
  generatedAt?: string
  github?: GithubRepoStats
  comments?: GithubCommentsData
}
