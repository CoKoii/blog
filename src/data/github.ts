import rawGithubData from './github-data.json'

export type GithubRepoStats = {
  username?: string
  profileUrl?: string
  repo?: string
  repoUrl?: string
  projects?: number
  stars?: number
  updatedAt?: string | null
}

export type GithubCommentsData = {
  repo?: string
  categoryId?: string
  mapping?: string
  strict?: boolean
  byPath?: Record<string, number>
}

export type GithubDataPayload = {
  generatedAt?: string
  github?: GithubRepoStats
  comments?: GithubCommentsData
}

const payload = rawGithubData as GithubDataPayload

export const githubData = payload
export const githubRepoStats = payload.github || {}
export const githubCommentsByPath = payload.comments?.byPath || {}

export const normalizeRoutePath = (value: string) => {
  const clean = String(value || '/').split(/[?#]/, 1)[0] || '/'
  if (clean !== '/' && clean.endsWith('/')) {
    return clean.replace(/\/+$/, '')
  }
  return clean
}

export const getCommentCountByPath = (value: string): number => {
  const count = githubCommentsByPath[normalizeRoutePath(value)]
  if (typeof count !== 'number' || !Number.isFinite(count)) return 0
  return count
}
