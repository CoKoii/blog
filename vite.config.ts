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
import { buildArticlePath, toPinyinSlug } from './scripts/utils/slug.mjs'
import { resolveSiteMeta } from './scripts/utils/site-config.mjs'
import { listPostFiles, type PostFileEntry } from './scripts/utils/posts.mjs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const { siteName, siteDescription, siteLanguage } = resolveSiteMeta({ rootDir: __dirname })

// 辅助函数：扫描 posts 目录生成路由列表（给 SSG build 用）
function getPostRoutes() {
  return listPostFiles(__dirname).map((post: PostFileEntry) =>
    buildArticlePath(post.category, post.slug),
  )
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
          categorySlug: string
          slug: string
          path: string
          frontmatter: Record<string, unknown>
        }> = []

        for (const post of listPostFiles(__dirname)) {
          const content = fs.readFileSync(post.filePath, 'utf-8')
          const { data: frontmatter } = matter(content)
          const id = `${post.category}/${post.slug}`
          const categorySlug = toPinyinSlug(post.category)
          const nameSlug = toPinyinSlug(post.slug)

          postsData.push({
            id,
            category: post.category,
            categorySlug,
            slug: nameSlug,
            path: `/posts/${post.category}/${post.fileName}`,
            frontmatter,
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
              (match: string) =>
                `${match}\n    <meta name="description" content="${description}" />`,
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
    ssgOptions: {
      includedRoutes(paths: string[]) {
        return paths.flatMap((path) => {
          return path === '/article/:category/:id' ? getPostRoutes() : path
        })
      },
    },
  }
})
