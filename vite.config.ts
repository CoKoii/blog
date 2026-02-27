import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import { createMarkdownPlugin, createShikiHighlighter } from './scripts/plugins/markdown'
import { createPostsMetaPlugin, getPostRoutes, getTagRoutes } from './scripts/plugins/posts-meta'
import { createSiteHeadPlugin } from './scripts/plugins/site-head'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const FRAMEWORK_MODULE_RE =
  /\/node_modules\/(?:vue\/|@vue\/|vue-router\/|pinia\/|vite-ssg\/|@unhead\/|unhead\/)/

// https://vite.dev/config/
export default defineConfig(async () => {
  const highlighter = await createShikiHighlighter()

  return {
    server: {
      open: true,
    },
    plugins: [
      createSiteHeadPlugin(__dirname),
      vue({
        include: [/\.vue$/, /\.md$/],
      }),
      createMarkdownPlugin(highlighter),
      createPostsMetaPlugin(__dirname),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            const normalizedId = id.replace(/\\/g, '/')
            if (!normalizedId.includes('/node_modules/')) return undefined
            if (FRAMEWORK_MODULE_RE.test(normalizedId)) return 'framework'
            if (normalizedId.includes('/node_modules/@iconify/vue/')) return 'iconify'
            return 'vendor'
          },
        },
      },
    },
    ssgOptions: {
      includedRoutes(paths: string[]) {
        return paths.flatMap((path) => {
          if (path === '/article/:category/:id') return getPostRoutes(__dirname)
          if (path === '/tags/:category') return getTagRoutes(__dirname)
          return path
        })
      },
    },
  }
})
