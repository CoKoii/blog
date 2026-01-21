import Markdown from 'unplugin-vue-markdown/vite'
import { fromHighlighter } from '@shikijs/markdown-it'
import { bundledLanguages, createHighlighter } from 'shiki'

export const createShikiHighlighter = async () => {
  return createHighlighter({
    themes: ['github-dark'],
    langs: Object.keys(bundledLanguages),
  })
}

export const createMarkdownPlugin = (
  highlighter: Awaited<ReturnType<typeof createShikiHighlighter>>,
) =>
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
  })
