import { mkdir, writeFile } from 'node:fs/promises'
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

const GITHUB_DEFAULT_API_BASE = 'https://api.github.com'
const DISCUSSION_PER_PAGE = 100
const DISCUSSION_MAX_PAGES = 10
const ROOT_DIR = process.cwd()

const env = loadEnv(ROOT_DIR)
const siteConfig = loadSiteConfig(ROOT_DIR)

const githubConfig =
  siteConfig.github && typeof siteConfig.github === 'object' ? siteConfig.github : {}
const ownerConfig = siteConfig.owner && typeof siteConfig.owner === 'object' ? siteConfig.owner : {}
const commentsConfig =
  siteConfig.comments && typeof siteConfig.comments === 'object' ? siteConfig.comments : {}
const giscusConfig =
  commentsConfig.giscus && typeof commentsConfig.giscus === 'object' ? commentsConfig.giscus : {}

const username = String(githubConfig.username || ownerConfig.githubUsername || '').trim()
const repo = String(githubConfig.repo || giscusConfig.repo || '').trim()
const apiBase = String(githubConfig.apiBase || GITHUB_DEFAULT_API_BASE).replace(/\/+$/, '')
const token = String(env.GITHUB_TOKEN || '').trim()
const commentsEnabled = Boolean(commentsConfig.enabled)
const categoryId = String(giscusConfig.categoryId || '').trim()
const mapping = String(giscusConfig.mapping || 'pathname').trim()
const term = String(giscusConfig.term || '').trim()
const strict = giscusConfig.strict === undefined ? true : Boolean(giscusConfig.strict)

const decodeSafe = (value) => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const normalizeTitle = (value) => decodeSafe(String(value || '')).trim().toLowerCase()

const normalizePathnameTerm = (pathname) => {
  const cleanPath = String(pathname || '').split(/[?#]/, 1)[0] || ''
  if (cleanPath.length < 2) return 'index'
  return cleanPath.replace(/^\/+/, '').replace(/\.\w+$/, '')
}

const parseRepo = (value) => {
  const [owner, name] = String(value || '').split('/')
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

const matchTitle = (discussionTitle, expectedTitle, strictMode) => {
  const left = normalizeTitle(discussionTitle)
  const right = normalizeTitle(expectedTitle)
  return strictMode ? left === right : left.includes(right)
}

const fetchRepoStats = async () => {
  if (!username) {
    warn('未配置 github.username，仓库统计将为空。')
    return {
      username: '',
      profileUrl: '',
      repo,
      repoUrl: repo ? `https://github.com/${repo}` : '',
      projects: 0,
      stars: 0,
      updatedAt: null,
    }
  }

  const apiUrl = `${apiBase}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`
  const repos = await requestJson(apiUrl)
  if (!Array.isArray(repos)) {
    return {
      username,
      profileUrl: `https://github.com/${username}`,
      repo,
      repoUrl: repo ? `https://github.com/${repo}` : `https://github.com/${username}`,
      projects: 0,
      stars: 0,
      updatedAt: null,
    }
  }

  const filtered = repos.filter((item) => !item.fork)
  const stars = filtered.reduce((sum, item) => sum + (item.stargazers_count ?? 0), 0)
  const updatedList = filtered
    .map((item) => item.updated_at)
    .filter(Boolean)
    .sort()
  const latestUpdatedAt = updatedList[updatedList.length - 1] ?? null

  return {
    username,
    profileUrl: `https://github.com/${username}`,
    repo,
    repoUrl: repo ? `https://github.com/${repo}` : `https://github.com/${username}`,
    projects: filtered.length,
    stars,
    updatedAt: latestUpdatedAt,
  }
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

const resolveCommentCounts = async (paths) => {
  const byPath = toPathCommentsMap(paths, 0)

  if (!commentsEnabled) return byPath

  const repoInfo = parseRepo(repo)
  if (!repoInfo) {
    warn('comments.giscus.repo 与 github.repo 均未配置有效仓库，评论统计将为空。')
    return byPath
  }

  if (mapping === 'number') {
    if (!/^\d+$/.test(term)) {
      warn('giscus.mapping=number 但 term 非数字，评论统计将为空。')
      return byPath
    }
    const count = await fetchCommentsByNumber(repoInfo, term)
    return toPathCommentsMap(paths, count)
  }

  if (mapping !== 'pathname' && mapping !== 'specific') {
    warn(`当前 mapping=${mapping} 不支持构建期批量统计，评论数将默认为 0。`)
    return byPath
  }

  const discussions = await fetchDiscussions(repoInfo)
  if (!discussions.length) return byPath

  const filteredDiscussions = discussions.filter((discussion) => {
    if (!categoryId) return true
    return discussion?.category?.node_id === categoryId
  })

  if (!filteredDiscussions.length) return byPath

  if (mapping === 'specific') {
    if (!term) return byPath
    const matched = filteredDiscussions.find((discussion) =>
      matchTitle(discussion.title || '', term, strict),
    )
    const count = Number(matched?.comments || 0)
    return toPathCommentsMap(paths, count)
  }

  const titleMap = new Map()
  filteredDiscussions.forEach((discussion) => {
    const title = normalizeTitle(discussion.title || '')
    if (!title) return
    if (!titleMap.has(title)) {
      titleMap.set(title, Number(discussion.comments || 0))
    }
  })

  for (const path of paths) {
    const lookupTitle = normalizeTitle(normalizePathnameTerm(path))
    if (!lookupTitle) continue

    if (strict) {
      byPath[path] = titleMap.get(lookupTitle) || 0
      continue
    }

    const matched = filteredDiscussions.find((discussion) =>
      matchTitle(discussion.title || '', lookupTitle, false),
    )
    byPath[path] = Number(matched?.comments || 0)
  }

  return byPath
}

const main = async () => {
  const startedAt = Date.now()
  info(`开始生成 GitHub 数据，文章评论将进行构建期汇总。`)
  info(`GitHub 用户：${username || '未配置'}`)
  info(`GitHub 仓库：${repo || '未配置'}`)
  if (!token) {
    warn('未检测到 GITHUB_TOKEN，将使用匿名请求（可能触发限流）。')
  }

  const articlePaths = buildArticlePaths()
  info(`文章数量：${articlePaths.length}`)

  const [repoStats, commentsByPath] = await Promise.all([
    fetchRepoStats(),
    resolveCommentCounts(articlePaths),
  ])

  const payload = {
    generatedAt: new Date().toISOString(),
    github: repoStats,
    comments: {
      repo,
      categoryId,
      mapping,
      strict,
      byPath: commentsByPath,
    },
  }

  const __dirname = dirname(fileURLToPath(import.meta.url))
  const outputPath = resolve(__dirname, '../src/data/github-data.json')
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

  success(`GitHub 数据写入完成：${outputPath}`)
  success(`总耗时：${Date.now() - startedAt}ms`)
}

try {
  await main()
} catch (mainError) {
  error('生成 GitHub 数据失败。')
  error(String(mainError))
  process.exit(1)
}
