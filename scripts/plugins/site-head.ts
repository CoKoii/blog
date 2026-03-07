import { resolveSiteMeta } from '../utils/site-config.mjs'

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const getOrigin = (url: string): string => {
  if (!url) return ''
  try {
    return new URL(url).origin
  } catch {
    return ''
  }
}

export const createSiteHeadPlugin = (rootDir: string) => {
  const { siteConfig, siteName, siteDescription, siteLanguage } = resolveSiteMeta({ rootDir })
  const imageCdnOrigin = getOrigin(siteConfig.site.image)

  return {
    name: 'site-config-index-html',
    transformIndexHtml(html: string) {
      const title = escapeHtml(siteName)
      const description = escapeHtml(siteDescription)
      const language = escapeHtml(siteLanguage)

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

      if (imageCdnOrigin) {
        nextHtml = nextHtml.replace(
          /(<meta charset="[^"]*"\s*\/?>)/,
          `$1\n    <link rel="preconnect" href="${imageCdnOrigin}" />\n    <link rel="dns-prefetch" href="${imageCdnOrigin}" />`,
        )
      }

      return nextHtml
    },
  }
}
