import rawGithubData from '@/data/github-data.json'
import type { GithubCommentDetail, GithubDataPayload } from '@/types/github'

export type {
  GithubCommentDetail,
  GithubCommentsData,
  GithubDataPayload,
  GithubRepoStats,
} from '@/types/github'

const githubDataPayload = rawGithubData as GithubDataPayload

export const githubData = githubDataPayload
export const githubRepoStats = githubDataPayload.github ?? {}
export const githubCommentsByPath: Record<string, number> = githubDataPayload.comments?.byPath ?? {}
export const githubCommentDetailsByPath: Record<string, GithubCommentDetail[]> =
  githubDataPayload.comments?.detailsByPath ?? {}

const normalizeRoutePath = (value: string) => {
  const clean = String(value || '/').split(/[?#]/, 1)[0] || '/'
  return clean === '/' ? clean : clean.replace(/\/+$/, '')
}

export const getCommentCountByPath = (value: string): number => {
  const count = githubCommentsByPath[normalizeRoutePath(value)]
  return typeof count === 'number' && Number.isFinite(count) ? count : 0
}

export const getCommentDetailsByPath = (value: string): GithubCommentDetail[] =>
  githubCommentDetailsByPath[normalizeRoutePath(value)] ?? []
