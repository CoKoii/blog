import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

import { defineConfig } from 'vite'
import type { HmrContext, ViteDevServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Markdown from 'unplugin-vue-markdown/vite'
import matter from 'gray-matter'
import { fromHighlighter } from '@shikijs/markdown-it'
import { createHighlighter, bundledLanguages } from 'shiki'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const siteConfigPath = fileURLToPath(new URL('./site.config.json', import.meta.url))

type SiteConfig = {
  url?: string
  name?: string
  description?: string
  image?: string
  language?: string
}

const loadSiteConfig = (): SiteConfig => {
  if (!fs.existsSync(siteConfigPath)) return {}
  try {
    const raw = fs.readFileSync(siteConfigPath, 'utf-8')
    return JSON.parse(raw) as SiteConfig
  } catch (error) {
    console.warn('[site-config] Failed to parse site.config.json', error)
    return {}
  }
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const siteConfig = loadSiteConfig()

// 辅助函数：扫描 posts 目录生成路由列表（给 SSG build 用）
function getPostRoutes() {
  const postsDir = path.resolve(__dirname, 'posts')
  const routes: string[] = []

  if (fs.existsSync(postsDir)) {
    const categories = fs.readdirSync(postsDir)
    categories.forEach((cat) => {
      const catPath = path.join(postsDir, cat)
      if (fs.statSync(catPath).isDirectory()) {
        const files = fs.readdirSync(catPath)
        files.forEach((file) => {
          if (file.endsWith('.md')) {
            const name = file.replace(/\.md$/, '')
            routes.push(`/article/${cat}/${name}`)
          }
        })
      }
    })
  }
  return routes
}

// 插件：生成文章元数据虚拟模块
function postsMetaPlugin() {
  const virtualModuleId = 'virtual:posts-meta'
  const resolvedVirtualModuleId = '\0' + virtualModuleId
  const postsDir = path.resolve(__dirname, 'posts')

  return {
    name: 'posts-meta-plugin',
    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        const postsData: Array<{
          id: string
          category: string
          path: string
          frontmatter: Record<string, unknown>
        }> = []

        if (fs.existsSync(postsDir)) {
          const categories = fs.readdirSync(postsDir)
          categories.forEach((cat) => {
            const catPath = path.join(postsDir, cat)
            if (fs.statSync(catPath).isDirectory()) {
              const files = fs.readdirSync(catPath)
              files.forEach((file) => {
                if (file.endsWith('.md')) {
                  const filePath = path.join(catPath, file)
                  const content = fs.readFileSync(filePath, 'utf-8')
                  const { data: frontmatter } = matter(content)
                  const id = `${cat}/${file.replace(/\.md$/, '')}`

                  postsData.push({
                    id,
                    category: cat,
                    path: `/posts/${cat}/${file}`,
                    frontmatter,
                  })
                }
              })
            }
          })
        }

        return `export const postsMeta = ${JSON.stringify(postsData, null, 2)}`
      }
    },
    configureServer(server: ViteDevServer) {
      server.watcher.add(postsDir)
    },
    handleHotUpdate(ctx: HmrContext) {
      if (!ctx.file.startsWith(postsDir) || !ctx.file.endsWith('.md')) return
      const mod = ctx.server.moduleGraph.getModuleById(resolvedVirtualModuleId)
      if (mod) {
        ctx.server.moduleGraph.invalidateModule(mod)
      }
      ctx.server.ws.send({ type: 'full-reload' })
      return []
    },
  }
}

// https://vite.dev/config/
export default defineConfig(async () => {
  const highlighter = await createHighlighter({
    themes: ['github-dark'],
    langs: Object.keys(bundledLanguages),
  })

  return {
  server: {
    open: true,
  },
  plugins: [
    {
      name: 'site-config-index-html',
      transformIndexHtml(html) {
        const title = escapeHtml(siteConfig.name || 'CaoKai - 技术博客')
        const description = escapeHtml(
          siteConfig.description || '专注前端、SSG、Vue、工程化实践等技术领域的分享',
        )
        const language = escapeHtml(siteConfig.language || 'zh-CN')

        let nextHtml = html.replace(/<title>.*<\/title>/, `<title>${title}</title>`)
        if (nextHtml.includes('name="description"')) {
          nextHtml = nextHtml.replace(
            /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
            `<meta name="description" content="${description}" />`,
          )
        } else {
          nextHtml = nextHtml.replace(
            /<meta charset="[^"]*"\s*\/?>/,
            (match) => `${match}\n    <meta name="description" content="${description}" />`,
          )
        }

        nextHtml = nextHtml.replace(/<html[^>]*>/, `<html lang="${language}">`)

        return nextHtml
      },
    },
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    Markdown({
      headEnabled: true,
      markdownItOptions: {
        html: true,
        linkify: true,
        typographer: true,
      },
      markdownItSetup(md) {
        md.use(fromHighlighter(highlighter, { theme: 'github-dark' }))
        const defaultImage =
          md.renderer.rules.image ||
          ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))

        md.renderer.rules.image = (tokens, idx, options, env, self) => {
          const token = tokens[idx]
          const attrs = token.attrs ? [...token.attrs] : []
          const srcIndex = attrs.findIndex(([name]) => name === 'src')
          const src = srcIndex >= 0 ? attrs[srcIndex][1] : ''
          if (srcIndex >= 0) attrs.splice(srcIndex, 1)
          if (src) attrs.push(['data-src', src])
          attrs.push(['v-lazy', ''])
          token.attrs = attrs
          return defaultImage(tokens, idx, options, env, self)
        }
      },
    }),
    postsMetaPlugin(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // @ts-expect-error ssgOptions is recognized by vite-ssg but not standard vite config
  ssgOptions: {
    includedRoutes(paths: string[]) {
      return paths.flatMap((path) => {
        return path === '/article/:category/:id' ? getPostRoutes() : path
      })
    },
  },
  }
})
