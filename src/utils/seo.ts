import { siteImage, siteName, siteUrl } from '@/config'
import type { HeadConfig, MetaTag, SeoMetaConfig } from '@/types/seo'

export type { HeadConfig, MetaTag, SeoMetaConfig } from '@/types/seo'

export const buildSeoMeta = (config: SeoMetaConfig): HeadConfig => {
  const {
    title,
    description,
    image,
    url,
    type,
    author,
    publishDate,
    modifiedDate,
    keywords,
    schemaData,
  } = config
  const finalImage = image ?? siteImage
  const fullImageUrl = finalImage?.startsWith('http') ? finalImage : `${siteUrl}${finalImage}`

  const meta: MetaTag[] = [
    { name: 'robots', content: 'index, follow' },
    { name: 'description', content: description },
  ]

  if (author) meta.push({ name: 'author', content: author })
  if (keywords?.length) meta.push({ name: 'keywords', content: keywords.join(', ') })

  // Open Graph
  meta.push(
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: type },
    { property: 'og:url', content: url },
    { property: 'og:site_name', content: siteName },
    { property: 'og:locale', content: 'zh_CN' },
    { name: 'twitter:card', content: finalImage ? 'summary_large_image' : 'summary' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
  )

  if (finalImage) {
    meta.push(
      { property: 'og:image', content: fullImageUrl },
      { property: 'og:image:alt', content: title },
      { name: 'twitter:image', content: fullImageUrl },
    )
  }

  // Article-specific meta
  if (type === 'article') {
    if (publishDate) meta.push({ property: 'article:published_time', content: publishDate })
    if (modifiedDate) meta.push({ property: 'article:modified_time', content: modifiedDate })
    keywords?.forEach((tag) => meta.push({ property: 'article:tag', content: tag }))
  }

  return {
    title,
    htmlAttrs: { lang: 'zh-CN' },
    link: [
      { rel: 'canonical', href: url },
      { rel: 'alternate', hreflang: 'zh-CN', href: url },
      { rel: 'alternate', hreflang: 'x-default', href: url },
    ],
    meta,
    script: schemaData
      ? [
          {
            type: 'application/ld+json',
            children: JSON.stringify(schemaData),
          },
        ]
      : undefined,
  }
}
