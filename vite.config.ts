import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import sonda from 'sonda/vite'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import { createMarkdownPlugin, createShikiHighlighter } from './scripts/plugins/markdown'
import { createPostsMetaPlugin, getPostRoutes, getTagRoutes } from './scripts/plugins/posts-meta'
import { createSiteHeadPlugin } from './scripts/plugins/site-head'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(async ({ command, mode }) => {
  const highlighter = await createShikiHighlighter()
  const isAnalyze = command === 'build' && mode === 'analyze'

  return {
    server: {
      open: true,
    },
    plugins: [
      isAnalyze
        ? sonda({
            gzip: true,
            brotli: true,
            filename: 'report',
          })
        : null,
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
          if (path === '/:pathMatch(.*)*') return []
          if (path === '/article/:category/:id') return getPostRoutes(__dirname)
          if (path === '/tags/:category') return getTagRoutes(__dirname)
          return path
        })
      },
    },
  }
})
