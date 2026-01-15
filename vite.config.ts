import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

import { defineConfig } from 'vite'
import type { HmrContext, ViteDevServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Markdown from 'unplugin-vue-markdown/vite'
import matter from 'gray-matter'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

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
export default defineConfig({
  base: '/blog/',
  server: {
    open: true,
  },
  plugins: [
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
})
