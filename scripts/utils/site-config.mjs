import fs from 'node:fs'
import path from 'node:path'

export const loadSiteConfig = (rootDir = process.cwd()) => {
  const siteConfigPath = path.join(rootDir, 'site.config.json')
  if (!fs.existsSync(siteConfigPath)) {
    throw new Error('[site-config] Missing site.config.json')
  }
  try {
    return JSON.parse(fs.readFileSync(siteConfigPath, 'utf-8'))
  } catch (error) {
    throw new Error(`[site-config] Failed to parse site.config.json: ${String(error)}`)
  }
}

export const normalizeSiteUrl = (url) => String(url || '').replace(/\/+$/, '')

const requireStringField = (config, keyPath) => {
  const value = keyPath.split('.').reduce((current, key) => current?.[key], config)
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`[site-config] Missing required field: ${keyPath}`)
  }
  return value.trim()
}

export const resolveSiteMeta = ({ rootDir = process.cwd() } = {}) => {
  const siteConfig = loadSiteConfig(rootDir)
  const siteUrl = normalizeSiteUrl(requireStringField(siteConfig, 'url'))
  const siteName = requireStringField(siteConfig, 'name')
  const siteDescription = requireStringField(siteConfig, 'description')
  const siteLanguage = requireStringField(siteConfig, 'language')

  return {
    siteConfig,
    siteUrl,
    siteName,
    siteDescription,
    siteLanguage,
  }
}
