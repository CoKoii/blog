import { siteOwner, siteUrl } from '@/config'
import type { PostFrontmatter } from '@/types/post'
import { buildSeoMeta } from '@/utils/seo'
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
const getPublishDate = (fm: PostFrontmatter) => toIso(fm.publishDate || fm.date)
const getModifiedDate = (fm: PostFrontmatter) =>
  toIso(
    (typeof fm.updated === 'string' && fm.updated) ||
      (typeof fm.modified === 'string' && fm.modified) ||
      '',
  )

export const useArticleHead = ({ route, article, frontmatter }: UseArticleHeadOptions) => {
  const canonical = computed(() => {
    const cat = String(route.params.category || '')
    const id = String(route.params.id || '')
    return cat && id ? `${siteUrl}/article/${cat}/${id}` : siteUrl
  })

  useHead(() => {
    const fm = frontmatter.value
    const art = article.value
    const desc = fm.description || art.title
    const pubDate = getPublishDate(fm)
    const modDate = getModifiedDate(fm)

    return buildSeoMeta({
      title: art.title,
      description: desc,
      image: art.coverImage,
      url: canonical.value,
      type: 'article',
      author: String(fm.author || siteOwner.name),
      publishDate: pubDate,
      modifiedDate: modDate,
      keywords: art.tags,
      schemaData: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: art.title,
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical.value },
        ...(art.coverImage && {
          image: art.coverImage.startsWith('http') ? art.coverImage : `${siteUrl}${art.coverImage}`,
        }),
        ...(pubDate && { datePublished: pubDate }),
        ...(modDate && { dateModified: modDate }),
        ...(art.wordCount && { wordCount: art.wordCount }),
        ...(art.tags.length && { keywords: art.tags.join(', ') }),
        author: { '@type': 'Person', name: siteOwner.name },
        description: desc,
      },
    })
  })
}
