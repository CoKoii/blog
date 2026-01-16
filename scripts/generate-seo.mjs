import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { loadEnv } from './utils/env.mjs'

const rootDir = process.cwd()
const distDir = path.join(rootDir, 'dist')
const postsDir = path.join(rootDir, 'posts')
const siteConfigPath = path.join(rootDir, 'site.config.json')

const normalizeSiteUrl = (url) => url.replace(/\/+$/, '')

const env = loadEnv(rootDir)
const rawSiteConfig = fs.existsSync(siteConfigPath)
  ? JSON.parse(fs.readFileSync(siteConfigPath, 'utf-8'))
  : {}
const siteConfig = rawSiteConfig || {}

const siteUrl = normalizeSiteUrl(
  env.VITE_SITE_URL || env.SITE_URL || siteConfig.url || 'https://example.com',
)
const siteName = env.VITE_SITE_NAME || siteConfig.name || 'CaoKai - 技术博客'
const siteDescription =
  env.VITE_SITE_DESCRIPTION ||
  siteConfig.description ||
  '专注前端、SSG、Vue、工程化实践等技术领域的分享'
const siteLanguage = env.VITE_SITE_LANGUAGE || siteConfig.language || 'zh-CN'

const ensureDist = () => {
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found, run build first.')
  }
}

const collectPosts = () => {
  const posts = []
  if (!fs.existsSync(postsDir)) return posts
  const categories = fs.readdirSync(postsDir)
  for (const category of categories) {
    const categoryDir = path.join(postsDir, category)
    if (!fs.statSync(categoryDir).isDirectory()) continue
    const files = fs.readdirSync(categoryDir)
    for (const file of files) {
      if (!file.endsWith('.md')) continue
      const filePath = path.join(categoryDir, file)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { data: frontmatter } = matter(raw)
      const slug = file.replace(/\.md$/, '')
      posts.push({
        category,
        slug,
        frontmatter,
      })
    }
  }
  return posts
}

const buildArticlePath = (category, slug) =>
  `/article/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`

const toIso = (value) => {
  if (!value) return ''
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return ''
  return new Date(parsed).toISOString()
}

const getFrontmatterDate = (frontmatter) =>
  frontmatter?.date || frontmatter?.publishDate || ''

const buildSitemap = (entries) => {
  const urls = entries
    .map((entry) => {
      const lastmod = entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''
      return `  <url><loc>${entry.loc}</loc>${lastmod}</url>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

const buildRobots = () => `User-agent: *
Allow: /
Sitemap: ${siteUrl}/sitemap.xml
`

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const buildRss = (items) => {
  const rssItems = items
    .map((item) => {
      const description = item.description ? `<![CDATA[${item.description}]]>` : ''
      const pubDate = item.date ? new Date(item.date).toUTCString() : ''
      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.url}</link>
      <guid>${item.url}</guid>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ''}
      ${description ? `<description>${description}</description>` : ''}
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>${siteLanguage}</language>
${rssItems}
  </channel>
</rss>
`
}

const buildAtom = (items) => {
  const updated =
    items.find((item) => item.date)?.date || new Date().toISOString()
  const entries = items
    .map((item) => {
      const updatedAt = item.date || new Date().toISOString()
      return `  <entry>
    <title>${escapeXml(item.title)}</title>
    <link href="${item.url}" />
    <id>${item.url}</id>
    <updated>${updatedAt}</updated>
    ${item.description ? `<summary>${escapeXml(item.description)}</summary>` : ''}
  </entry>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(siteName)}</title>
  <link href="${siteUrl}" />
  <link href="${siteUrl}/atom.xml" rel="self" type="application/atom+xml" />
  <updated>${updated}</updated>
  <id>${siteUrl}</id>
${entries}
</feed>
`
}

const writeFile = (filename, content) => {
  fs.writeFileSync(path.join(distDir, filename), content, 'utf-8')
}

const listHtmlFiles = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...listHtmlFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath)
    }
  }
  return files
}

const injectNoscriptImages = (html) => {
  const imgRegex = /<img\b([^>]*\sdata-src="([^"]+)"[^>]*)>/g
  return html.replace(imgRegex, (match, attrs, src, offset, full) => {
    if (/(^|\s)src=/.test(attrs)) return match
    const after = full.slice(offset + match.length, offset + match.length + 200)
    if (after.includes(`<noscript><img src="${src}"`)) return match
    return `${match}<noscript><img src="${src}" /></noscript>`
  })
}

const patchHtmlForSeoImages = () => {
  const htmlFiles = listHtmlFiles(distDir)
  htmlFiles.forEach((filePath) => {
    const html = fs.readFileSync(filePath, 'utf-8')
    const patched = injectNoscriptImages(html)
    if (patched !== html) {
      fs.writeFileSync(filePath, patched, 'utf-8')
    }
  })
}

const main = () => {
  ensureDist()
  const posts = collectPosts()
  const sitemapEntries = [
    {
      loc: siteUrl,
    },
  ]

  for (const post of posts) {
    const pathName = buildArticlePath(post.category, post.slug)
    const loc = `${siteUrl}${pathName}`
    const lastmod = toIso(getFrontmatterDate(post.frontmatter))
    sitemapEntries.push({ loc, lastmod })
  }

  writeFile('sitemap.xml', buildSitemap(sitemapEntries))
  writeFile('robots.txt', buildRobots())

  const feedItems = posts
    .map((post) => {
      const title = post.frontmatter?.title || post.slug
      const description = post.frontmatter?.description || ''
      const date = toIso(getFrontmatterDate(post.frontmatter))
      return {
        title,
        description,
        date,
        url: `${siteUrl}${buildArticlePath(post.category, post.slug)}`,
      }
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  writeFile('feed.xml', buildRss(feedItems))
  writeFile('atom.xml', buildAtom(feedItems))
  patchHtmlForSeoImages()
}

main()
