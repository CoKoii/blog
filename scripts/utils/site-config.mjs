import fs from 'node:fs'
import path from 'node:path'

export const loadSiteConfig = (rootDir = process.cwd()) => {
  const siteConfigPath = path.join(rootDir, 'site.config.json')
  if (!fs.existsSync(siteConfigPath)) return {}
  try {
    return JSON.parse(fs.readFileSync(siteConfigPath, 'utf-8'))
  } catch (error) {
    console.warn('[site-config] Failed to parse site.config.json', error)
    return {}
  }
}

export const normalizeSiteUrl = (url) => String(url || '').replace(/\/+$/, '')

export const resolveSiteMeta = ({ env = {}, rootDir = process.cwd() } = {}) => {
  const siteConfig = loadSiteConfig(rootDir)
  const siteUrl = normalizeSiteUrl(
    env.VITE_SITE_URL || env.SITE_URL || siteConfig.url || 'https://example.com',
  )
  const siteName = env.VITE_SITE_NAME || siteConfig.name || 'CaoKai - 技术博客'
  const siteDescription =
    env.VITE_SITE_DESCRIPTION ||
    siteConfig.description ||
    '专注前端、SSG、Vue、工程化实践等技术领域的分享'
  const siteLanguage = env.VITE_SITE_LANGUAGE || siteConfig.language || 'zh-CN'
  return {
    siteConfig,
    siteUrl,
    siteName,
    siteDescription,
    siteLanguage,
  }
}
