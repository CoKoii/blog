import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
import { loadEnv } from './utils/env.mjs'
import { loadSiteConfig } from './utils/site-config.mjs'

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

const env = loadEnv()
const siteConfig = loadSiteConfig(process.cwd())

const username = siteConfig.owner?.githubUsername || 'CoKoii'
const profileUrl = `https://github.com/${username}`
const apiUrl = `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`
const token = env.GITHUB_TOKEN

const startedAt = Date.now()
info(`开始获取 GitHub 数据... 用户：${username}`)
info(`请求地址：${apiUrl}`)
if (!token) {
  warn('未检测到 GITHUB_TOKEN，将使用匿名请求（可能触发限流）。')
}

const response = await fetch(apiUrl, {
  headers: token ? { Authorization: `Bearer ${token}` } : undefined,
})
if (!response.ok) {
  error(`请求失败：${response.status} ${response.statusText}`)
  if (response.status === 403) {
    warn('可能触发了 GitHub API 限流，请稍后再试。')
  }
  throw new Error('GitHub API 请求失败')
}

const repos = await response.json()
if (!Array.isArray(repos)) {
  warn('响应格式异常，已跳过写入。')
  process.exit(0)
}
const filtered = repos.filter((repo) => !repo.fork)
const projects = filtered.length
const stars = filtered.reduce((sum, repo) => sum + (repo.stargazers_count ?? 0), 0)
const latestUpdatedAt = filtered
  .map((repo) => repo.updated_at)
  .filter(Boolean)
  .sort()
  .at(-1)

const payload = {
  username,
  profileUrl,
  projects,
  stars,
  updatedAt: latestUpdatedAt ?? null,
}

info(`仓库总数：${repos.length}`)
info(`开源项目数（排除 fork）：${projects}`)
info(`星标总数：${stars}`)
info(`最近更新时间：${payload.updatedAt ?? '未知'}`)

const __dirname = dirname(fileURLToPath(import.meta.url))
const outputPath = resolve(__dirname, '../src/data/opensource.json')

await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
const elapsedMs = Date.now() - startedAt
success(`数据写入完成：${outputPath}`)
success(`总耗时：${elapsedMs}ms`)
