import { siteImage, siteName, siteOwner, siteUrl } from '@/config'
import type { PostFrontmatter } from '@/types/post'
import { useHead } from '@vueuse/head'
import type { ComputedRef, Ref } from 'vue'
import { computed } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { ArticleMeta } from '../types'

type UseArticleHeadOptions = {
  route: RouteLocationNormalizedLoaded
  article: ComputedRef<ArticleMeta>
  frontmatter: Ref<PostFrontmatter>
}

const toIso = (d?: string) => (d ? new Date(d).toISOString() : '')

export const useArticleHead = ({ route, article, frontmatter }: UseArticleHeadOptions) => {
  const path = computed(() => {
    const cat = String(route.params.category || '')
    const id = String(route.params.id || '')
    return cat && id ? `/article/${cat}/${id}` : ''
  })

  const canonical = computed(() => (path.value ? `${siteUrl}${path.value}` : siteUrl))

  useHead(() => {
    const fm = frontmatter.value
    const art = article.value
    const desc = fm.description || art.title
    const cover = art.coverImage || siteImage
    const pubDate = toIso(fm.publishDate || fm.date)
    const modDate = toIso(
      (typeof fm.updated === 'string' && fm.updated) ||
        (typeof fm.modified === 'string' && fm.modified) ||
        '',
    )
    const fullCover = cover?.startsWith('http') ? cover : `${siteUrl}${cover}`

    const meta: Array<Record<string, string>> = [
      { name: 'robots', content: 'index, follow' },
      { name: 'description', content: desc },
      { name: 'author', content: String(fm.author || siteOwner.name) },
      { property: 'og:title', content: art.title },
      { property: 'og:description', content: desc },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: canonical.value },
      { property: 'og:locale', content: 'zh_CN' },
      { property: 'og:site_name', content: siteName },
      { name: 'twitter:card', content: cover ? 'summary_large_image' : 'summary' },
      { name: 'twitter:title', content: art.title },
      { name: 'twitter:description', content: desc },
    ]

    if (cover) {
      meta.push({ property: 'og:image', content: fullCover })
      meta.push({ property: 'og:image:alt', content: art.title })
      meta.push({ name: 'twitter:image', content: fullCover })
    }

    if (pubDate) meta.push({ property: 'article:published_time', content: pubDate })
    if (modDate) meta.push({ property: 'article:modified_time', content: modDate })

    if (art.tags.length) {
      meta.push({ name: 'keywords', content: art.tags.join(', ') })
      art.tags.forEach((t) => meta.push({ property: 'article:tag', content: t }))
    }

    if (fm.category) meta.push({ property: 'article:section', content: String(fm.category) })

    return {
      title: art.title,
      htmlAttrs: { lang: 'zh-CN' },
      link: [
        { rel: 'canonical', href: canonical.value },
        { rel: 'alternate', hreflang: 'zh-CN', href: canonical.value },
        { rel: 'alternate', hreflang: 'x-default', href: canonical.value },
      ],
      meta,
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: art.title,
            mainEntityOfPage: { '@type': 'WebPage', '@id': canonical.value },
            ...(cover && { image: fullCover }),
            ...(pubDate && { datePublished: pubDate }),
            ...(modDate && { dateModified: modDate }),
            ...(art.wordCount && { wordCount: art.wordCount }),
            ...(art.tags.length && { keywords: art.tags.join(', ') }),
            author: { '@type': 'Person', name: siteOwner.name },
            description: desc,
          }),
        },
      ],
    }
  })
}
