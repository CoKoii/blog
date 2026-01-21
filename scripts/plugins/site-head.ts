import { resolveSiteMeta } from '../utils/site-config.mjs'

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export const createSiteHeadPlugin = (rootDir: string) => {
  const { siteName, siteDescription, siteLanguage } = resolveSiteMeta({ rootDir })

  return {
    name: 'site-config-index-html',
    transformIndexHtml(html: string) {
      const title = escapeHtml(siteName || 'CaoKai - 技术博客')
      const description = escapeHtml(
        siteDescription || '专注前端、SSG、Vue、工程化实践等技术领域的分享',
      )
      const language = escapeHtml(siteLanguage || 'zh-CN')

      let nextHtml = html.replace(/<title>.*<\/title>/, `<title>${title}</title>`)
      if (nextHtml.includes('name="description"')) {
        nextHtml = nextHtml.replace(
          /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
          `<meta name="description" content="${description}" />`,
        )
      } else {
        nextHtml = nextHtml.replace(
          /<meta charset="[^"]*"\s*\/?>/,
          (match: string) => `${match}\n    <meta name="description" content="${description}" />`,
        )
      }

      nextHtml = nextHtml.replace(/<html[^>]*>/, `<html lang="${language}">`)

      return nextHtml
    },
  }
}
