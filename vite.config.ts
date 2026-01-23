/// <reference types="./types/index" />

import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { createMarkdownPlugin, createShikiHighlighter } from './scripts/plugins/markdown'
import { createPostsMetaPlugin, getPostRoutes, getTagRoutes } from './scripts/plugins/posts-meta'
import { createSiteHeadPlugin } from './scripts/plugins/site-head'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

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
