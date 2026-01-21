import fs from 'node:fs'
import path from 'node:path'

import type { HmrContext, ViteDevServer } from 'vite'
import matter from 'gray-matter'

import { buildArticlePath, toPinyinSlug } from '../utils/slug.mjs'
import { listPostFiles } from '../utils/posts.mjs'

type PostFileEntry = {
  category: string
  slug: string
  fileName: string
  filePath: string
}

export const getPostRoutes = (rootDir: string) => {
  return listPostFiles(rootDir).map((post: PostFileEntry) =>
    buildArticlePath(post.category, post.slug),
  )
}

export const createPostsMetaPlugin = (rootDir: string) => {
  const postsDir = path.resolve(rootDir, 'posts')
  const virtualModuleId = 'virtual:posts-meta'
  const resolvedVirtualModuleId = `\0${virtualModuleId}`

  return {
    name: 'posts-meta-plugin',
    resolveId(id: string) {
      if (id === virtualModuleId) return resolvedVirtualModuleId
      return undefined
    },
    load(id: string) {
      if (id !== resolvedVirtualModuleId) return undefined

      const postsData: Array<{
        id: string
        category: string
        categorySlug: string
        slug: string
        path: string
        frontmatter: Record<string, unknown>
      }> = []

      for (const post of listPostFiles(rootDir)) {
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
    },
    configureServer(server: ViteDevServer) {
      server.watcher.add(postsDir)
    },
    handleHotUpdate(ctx: HmrContext) {
      if (!ctx.file.startsWith(postsDir) || !ctx.file.endsWith('.md')) return undefined
      const mod = ctx.server.moduleGraph.getModuleById(resolvedVirtualModuleId)
      if (mod) ctx.server.moduleGraph.invalidateModule(mod)
      ctx.server.ws.send({ type: 'full-reload' })
      return []
    },
  }
}
