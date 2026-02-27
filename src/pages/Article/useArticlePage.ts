import { formatDate } from '@/utils/date'
import { resolveTitleFromSlug } from '@/utils/strings'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useArticleComments } from './hooks/useArticleComments'
import { useArticleContent } from './hooks/useArticleContent'
import { useArticleHead } from './hooks/useArticleHead'
import { useArticleToc } from './hooks/useArticleToc'
import type { ArticleMeta } from './types'

export const useArticlePage = () => {
  const route = useRoute()
  const { comments } = useArticleComments(route)
  const { toc, activeHeadingId, resetTocState, refreshArticleDecorations, scrollToHeading } =
    useArticleToc()
  const { ContentComponent, frontmatter, resolvedTitle } = useArticleContent(route, {
    onBeforeContentChange: resetTocState,
    onAfterContentReady: refreshArticleDecorations,
  })

  const article = computed<ArticleMeta>(() => ({
    title:
      frontmatter.value.title ||
      resolvedTitle.value ||
      resolveTitleFromSlug(String(route.params.id || '')),
    coverImage: frontmatter.value.coverImage || '',
    tags: frontmatter.value.tags || [],
    wordCount: frontmatter.value.wordCount || 0,
    readTime: frontmatter.value.readTime || 0,
    publishDate: formatDate(frontmatter.value.publishDate || frontmatter.value.date),
    location: frontmatter.value.location || '',
    comments: comments.value,
  }))

  useArticleHead({ route, article, frontmatter })

  return { ContentComponent, toc, activeHeadingId, article, scrollToHeading }
}
