import { useHead } from '@vueuse/head'
import type { ComputedRef, Ref } from 'vue'
import { computed } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { siteImage, siteName, siteOwner, siteUrl } from '@/config'
import type { PostFrontmatter } from '@/types/post'
import type { ArticleMeta } from '../types'

type UseArticleHeadOptions = {
  route: RouteLocationNormalizedLoaded
  article: ComputedRef<ArticleMeta>
  frontmatter: Ref<PostFrontmatter>
}

export const useArticleHead = ({ route, article, frontmatter }: UseArticleHeadOptions) => {
  const articlePath = computed(() => {
    const categorySlug = String(route.params.category || '')
    const articleSlug = String(route.params.id || '')
    if (!categorySlug || !articleSlug) return ''

    return `/article/${categorySlug}/${articleSlug}`
  })

  const canonicalUrl = computed(() => {
    const path = articlePath.value
    return path ? `${siteUrl}${path}` : siteUrl
  })

  useHead(() => {
    const description = frontmatter.value.description || article.value.title
    const coverImage = article.value.coverImage || siteImage
    const publishDateRaw = frontmatter.value.publishDate || frontmatter.value.date
    const modifiedDateRaw =
      (typeof frontmatter.value.updated === 'string' && frontmatter.value.updated) ||
      (typeof frontmatter.value.modified === 'string' && frontmatter.value.modified) ||
      ''
    const publishDateIso = publishDateRaw ? new Date(publishDateRaw).toISOString() : ''
    const modifiedDateIso = modifiedDateRaw ? new Date(modifiedDateRaw).toISOString() : ''

    const fullCoverImage = coverImage?.startsWith('http') ? coverImage : `${siteUrl}${coverImage}`

    const meta: Array<Record<string, string>> = [
      { name: 'robots', content: 'index, follow' },
      { name: 'description', content: description },
      { property: 'og:title', content: article.value.title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: canonicalUrl.value },
      { property: 'og:locale', content: 'zh_CN' },
      { property: 'og:site_name', content: siteName },
      { name: 'twitter:card', content: coverImage ? 'summary_large_image' : 'summary' },
      { name: 'twitter:title', content: article.value.title },
      { name: 'twitter:description', content: description },
      { name: 'author', content: String(frontmatter.value.author || siteOwner.name) },
    ]

    if (coverImage) {
      meta.push({ property: 'og:image', content: fullCoverImage })
      meta.push({ property: 'og:image:alt', content: article.value.title })
      meta.push({ name: 'twitter:image', content: fullCoverImage })
    }

    if (publishDateIso) {
      meta.push({ property: 'article:published_time', content: publishDateIso })
    }

    if (modifiedDateIso) {
      meta.push({ property: 'article:modified_time', content: modifiedDateIso })
    }

    if (article.value.tags.length > 0) {
      meta.push({ name: 'keywords', content: article.value.tags.join(', ') })
      article.value.tags.forEach((tag) => {
        meta.push({ property: 'article:tag', content: tag })
      })
    }

    if (frontmatter.value.category) {
      meta.push({ property: 'article:section', content: String(frontmatter.value.category) })
    }

    return {
      title: article.value.title,
      htmlAttrs: {
        lang: 'zh-CN',
      },
      link: [
        { rel: 'canonical', href: canonicalUrl.value },
        { rel: 'alternate', hreflang: 'zh-CN', href: canonicalUrl.value },
        { rel: 'alternate', hreflang: 'x-default', href: canonicalUrl.value },
      ],
      meta,
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: article.value.title,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': canonicalUrl.value,
            },
            ...(coverImage && { image: fullCoverImage }),
            ...(publishDateIso && { datePublished: publishDateIso }),
            ...(modifiedDateIso && { dateModified: modifiedDateIso }),
            ...(article.value.wordCount ? { wordCount: article.value.wordCount } : {}),
            ...(article.value.tags.length ? { keywords: article.value.tags.join(', ') } : {}),
            author: { '@type': 'Person', name: siteOwner.name },
            description,
          }),
        },
      ],
    }
  })
}
