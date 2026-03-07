import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import { createMarkdownPlugin, createShikiHighlighter } from './scripts/plugins/markdown'
import { createPostsMetaPlugin, getPostRoutes, getTagRoutes } from './scripts/plugins/posts-meta'
import { createSiteHeadPlugin } from './scripts/plugins/site-head'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(async ({ command }) => {
  const highlighter = await createShikiHighlighter()

  return {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('/node_modules/')) {
              if (
                id.includes('/vue/') ||
                id.includes('/@vue/') ||
                id.includes('/vue-router/') ||
                id.includes('/pinia/') ||
                id.includes('/@vueuse/') ||
                id.includes('/unhead/') ||
                id.includes('/@unhead/')
              ) {
                return 'vendor'
              }
            }
          },
        },
      },
    },
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
      command === 'serve' ? vueDevTools() : null,
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
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
