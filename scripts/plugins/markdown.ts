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
        const hasAttr = (name: string) => attrs.some(([key]) => key === name)
        if (!hasAttr('loading')) attrs.push(['loading', 'lazy'])
        if (!hasAttr('decoding')) attrs.push(['decoding', 'async'])
        token.attrs = attrs
        return defaultImage(tokens, idx, options, env, self)
      }
    },
  })
