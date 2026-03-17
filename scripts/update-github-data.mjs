import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from './utils/env.mjs'
import { listPostFiles } from './utils/posts.mjs'
import { loadSiteConfig } from './utils/site-config.mjs'
import { buildArticlePath } from './utils/slug.mjs'

const color = {
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
}

const info = (message) => console.log(`${color.cyan}${message}${color.reset}`)
const success = (message) => console.log(`${color.green}${message}${color.reset}`)
const warn = (message) => console.log(`${color.yellow}${message}${color.reset}`)
const error = (message) => console.log(`${color.red}${message}${color.reset}`)

const DISCUSSION_PER_PAGE = 100
const DISCUSSION_MAX_PAGES = 10
const COMMENT_PER_PAGE = 20
const COMMENT_DETAIL_LIMIT = 8
const ROOT_DIR = process.cwd()

const env = loadEnv(ROOT_DIR)
const siteConfig = loadSiteConfig(ROOT_DIR)

const toTrimmedString = (value) => String(value ?? '').trim()

const githubConfig = siteConfig.github
const commentsConfig = siteConfig.comments
const giscusConfig = siteConfig.comments.giscus

const username = toTrimmedString(githubConfig.username)
const repo = toTrimmedString(giscusConfig.repo)
const apiBase = toTrimmedString(githubConfig.apiBase).replace(/\/+$/, '')
const token = toTrimmedString(env.GITHUB_TOKEN)
const commentsEnabled = commentsConfig.enabled
const categoryId = toTrimmedString(giscusConfig.categoryId)
const mapping = toTrimmedString(giscusConfig.mapping)
const term = toTrimmedString(giscusConfig.term)
const strict = giscusConfig.strict

const decodeSafe = (value) => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const normalizeTitle = (value) =>
  decodeSafe(String(value ?? ''))
    .trim()
    .toLowerCase()

const normalizePathnameTerm = (pathname) => {
  const cleanPath = String(pathname ?? '').split(/[?#]/, 1)[0] || ''
  if (cleanPath.length < 2) return 'index'
  return cleanPath.replace(/^\/+/, '').replace(/\.\w+$/, '')
}

const parseRepo = (value) => {
  const [owner, name] = String(value ?? '').split('/')
  if (!owner || !name) return null
  return { owner, name }
}

const createRequestHeaders = () => {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

const requestJson = async (url) => {
  try {
    const response = await fetch(url, {
      headers: createRequestHeaders(),
    })

    if (!response.ok) {
      warn(`GitHub 请求失败：${response.status} ${response.statusText} -> ${url}`)
      return null
    }

    return await response.json()
  } catch (requestError) {
    warn(`GitHub 请求异常：${url}`)
    warn(String(requestError))
    return null
  }
}

const buildArticlePaths = () =>
  listPostFiles(ROOT_DIR).map((post) => buildArticlePath(post.category, post.slug))

const toPathCommentsMap = (paths, defaultValue = 0) =>
  Object.fromEntries(paths.map((path) => [path, defaultValue]))

const toPathDetailMap = (paths) => Object.fromEntries(paths.map((path) => [path, []]))

const matchTitle = (discussionTitle, expectedTitle, strictMode) => {
  const left = normalizeTitle(discussionTitle)
  const right = normalizeTitle(expectedTitle)
  return strictMode ? left === right : left.includes(right)
}

const createRepoStats = ({ projects = 0, stars = 0, updatedAt = null } = {}) => ({
  projects,
  stars,
  updatedAt,
})

const fetchRepoStats = async () => {
  const apiUrl = `${apiBase}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`
  const repos = await requestJson(apiUrl)
  if (!Array.isArray(repos)) {
    return createRepoStats()
  }

  const filtered = repos.filter((item) => !item.fork)
  const stars = filtered.reduce((sum, item) => sum + (item.stargazers_count ?? 0), 0)
  const updatedList = filtered
    .map((item) => item.updated_at)
    .filter(Boolean)
    .sort()
  const latestUpdatedAt = updatedList[updatedList.length - 1] ?? null

  return createRepoStats({
    projects: filtered.length,
    stars,
    updatedAt: latestUpdatedAt,
  })
}

const fetchDiscussions = async (repoInfo) => {
  const discussions = []

  for (let page = 1; page <= DISCUSSION_MAX_PAGES; page += 1) {
    const apiUrl = `${apiBase}/repos/${repoInfo.owner}/${repoInfo.name}/discussions?per_page=${DISCUSSION_PER_PAGE}&page=${page}`
    const pageData = await requestJson(apiUrl)
    if (!Array.isArray(pageData) || pageData.length === 0) break

    discussions.push(...pageData)

    if (pageData.length < DISCUSSION_PER_PAGE) break
  }

  return discussions
}

const fetchCommentsByNumber = async (repoInfo, discussionNumber) => {
  const apiUrl = `${apiBase}/repos/${repoInfo.owner}/${repoInfo.name}/discussions/${discussionNumber}`
  const discussion = await requestJson(apiUrl)
  if (!discussion || typeof discussion !== 'object') return 0

  if (categoryId) {
    const nodeId = discussion?.category?.node_id
    if (!nodeId || nodeId !== categoryId) return 0
  }

  return Number(discussion.comments || 0)
}

const fetchDiscussionComments = async (repoInfo, discussionNumber) => {
  const apiUrl = `${apiBase}/repos/${repoInfo.owner}/${repoInfo.name}/discussions/${discussionNumber}/comments?per_page=${COMMENT_PER_PAGE}`
  const comments = await requestJson(apiUrl)
  return Array.isArray(comments) ? comments : []
}

const normalizeCommentBody = (value) => {
  const text = String(value ?? '')
    .replace(/```[\s\S]*?```/g, ' [代码片段] ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[>#*_~\-|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) return '发表了新评论'
  return text.length > 120 ? `${text.slice(0, 120)}…` : text
}

const toCommentFallbackId = (item, index) =>
  [
    item?.user?.login ?? 'anonymous',
    item?.created_at ?? 'unknown',
    item?.updated_at ?? 'unknown',
    index,
  ].join(':')

const toCommentDetails = (comments) =>
  comments
    .map((item, index) => ({
      id: String(item?.id ?? item?.node_id ?? toCommentFallbackId(item, index)),
      author: String(item?.user?.login ?? '匿名用户'),
      avatarUrl: String(item?.user?.avatar_url ?? ''),
      body: normalizeCommentBody(item?.body),
      createdAt: String(item?.created_at ?? ''),
    }))
    .filter((item) => item.body)
    .sort((left, right) => Date.parse(right.createdAt || 0) - Date.parse(left.createdAt || 0))
    .slice(0, COMMENT_DETAIL_LIMIT)

const stringifyJson = (value) => `${JSON.stringify(value, null, 2)}\n`

const writeJsonIfChanged = async (outputPath, payload) => {
  const nextContent = stringifyJson(payload)
  const currentContent = await readFile(outputPath, 'utf8').catch(() => '')

  if (currentContent === nextContent) return false

  await writeFile(outputPath, nextContent, 'utf8')
  return true
}

const resolveCommentData = async (paths) => {
  const byPath = toPathCommentsMap(paths, 0)
  const detailsByPath = toPathDetailMap(paths)

  if (!commentsEnabled) return { byPath, detailsByPath }

  const repoInfo = parseRepo(repo)
  if (!repoInfo) throw new Error('GitHub 仓库配置无效，必须为 owner/repo 格式。')

  if (mapping === 'number') {
    if (!/^\d+$/.test(term)) {
      throw new Error('评论映射为 number 时，「评论.giscus.指定词」必须为数字。')
    }
    const count = await fetchCommentsByNumber(repoInfo, term)
    const sharedDetails = toCommentDetails(await fetchDiscussionComments(repoInfo, term))
    for (const path of paths) {
      byPath[path] = count
      detailsByPath[path] = sharedDetails
    }
    return { byPath, detailsByPath }
  }

  if (mapping !== 'pathname' && mapping !== 'specific') {
    throw new Error(
      `评论映射值「${mapping}」不支持构建期统计，请使用 pathname / specific / number。`,
    )
  }

  const discussions = await fetchDiscussions(repoInfo)
  if (!discussions.length) return { byPath, detailsByPath }

  const filteredDiscussions = discussions.filter((discussion) => {
    if (!categoryId) return true
    return discussion?.category?.node_id === categoryId
  })

  if (!filteredDiscussions.length) return { byPath, detailsByPath }

  if (mapping === 'specific') {
    if (!term) return { byPath, detailsByPath }
    const matched = filteredDiscussions.find((discussion) =>
      matchTitle(discussion.title || '', term, strict),
    )
    const count = Number(matched?.comments || 0)
    const sharedDetails = matched
      ? toCommentDetails(await fetchDiscussionComments(repoInfo, matched.number))
      : []
    for (const path of paths) {
      byPath[path] = count
      detailsByPath[path] = sharedDetails
    }
    return { byPath, detailsByPath }
  }

  const normalizedDiscussions = filteredDiscussions
    .map((discussion) => ({
      number: discussion.number,
      title: normalizeTitle(discussion.title || ''),
      comments: Number(discussion.comments || 0),
    }))
    .filter((discussion) => discussion.title)

  const titleMap = new Map()
  const discussionByPath = new Map()
  for (const discussion of normalizedDiscussions) {
    if (!titleMap.has(discussion.title)) {
      titleMap.set(discussion.title, discussion.comments)
    }
  }

  for (const path of paths) {
    const lookupTitle = normalizeTitle(normalizePathnameTerm(path))
    if (!lookupTitle) continue

    if (strict) {
      byPath[path] = titleMap.get(lookupTitle) || 0
      const strictMatched = normalizedDiscussions.find(
        (discussion) => discussion.title === lookupTitle,
      )
      if (strictMatched?.number) discussionByPath.set(path, strictMatched.number)
      continue
    }

    const matched = normalizedDiscussions.find((discussion) =>
      discussion.title.includes(lookupTitle),
    )
    byPath[path] = matched?.comments || 0
    if (matched?.number) discussionByPath.set(path, matched.number)
  }

  const uniqueNumbers = Array.from(new Set(Array.from(discussionByPath.values()))).filter(Boolean)
  const commentsByDiscussionNumber = new Map()
  await Promise.all(
    uniqueNumbers.map(async (number) => {
      const details = toCommentDetails(await fetchDiscussionComments(repoInfo, number))
      commentsByDiscussionNumber.set(number, details)
    }),
  )

  for (const path of paths) {
    const number = discussionByPath.get(path)
    if (!number) continue
    detailsByPath[path] = commentsByDiscussionNumber.get(number) ?? []
  }

  return { byPath, detailsByPath }
}

const main = async () => {
  const startedAt = Date.now()
  info(`开始生成 GitHub 数据，文章评论将进行构建期汇总。`)
  info(`GitHub 用户：${username}`)
  info(`GitHub 仓库：${repo}`)
  if (!token) {
    warn('未检测到 GITHUB_TOKEN，将使用匿名请求（可能触发限流）。')
  }

  const articlePaths = buildArticlePaths()
  info(`文章数量：${articlePaths.length}`)

  const [repoStats, commentsData] = await Promise.all([
    fetchRepoStats(),
    resolveCommentData(articlePaths),
  ])

  const payload = {
    github: repoStats,
    comments: {
      byPath: commentsData.byPath,
      detailsByPath: commentsData.detailsByPath,
    },
  }

  const __dirname = dirname(fileURLToPath(import.meta.url))
  const outputPath = resolve(__dirname, '../src/data/github-data.json')
  await mkdir(dirname(outputPath), { recursive: true })
  const hasWritten = await writeJsonIfChanged(outputPath, payload)

  success(
    hasWritten
      ? `GitHub 数据写入完成：${outputPath}`
      : `GitHub 数据未变化，跳过写入：${outputPath}`,
  )
  success(`总耗时：${Date.now() - startedAt}ms`)
}

try {
  await main()
} catch (mainError) {
  error('生成 GitHub 数据失败。')
  error(String(mainError))
  process.exit(1)
}
