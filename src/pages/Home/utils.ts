import { siteDescription, siteImage, siteName, siteUrl } from '@/config'
import { useHead } from '@vueuse/head'

export const useHomeHead = () => {
  useHead(() => {
    const meta: Array<Record<string, string>> = [
      { name: 'robots', content: 'index, follow' },
      { name: 'description', content: siteDescription },
      { property: 'og:title', content: siteName },
      { property: 'og:description', content: siteDescription },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: siteUrl },
      { property: 'og:site_name', content: siteName },
      { property: 'og:locale', content: 'zh_CN' },
      { name: 'twitter:card', content: siteImage ? 'summary_large_image' : 'summary' },
      { name: 'twitter:title', content: siteName },
      { name: 'twitter:description', content: siteDescription },
    ]

    if (siteImage) {
      meta.push(
        { property: 'og:image', content: siteImage },
        { name: 'twitter:image', content: siteImage },
      )
    }

    return {
      title: siteName,
      htmlAttrs: { lang: 'zh-CN' },
      link: [
        { rel: 'canonical', href: siteUrl },
        { rel: 'alternate', hreflang: 'zh-CN', href: siteUrl },
        { rel: 'alternate', hreflang: 'x-default', href: siteUrl },
      ],
      meta,
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: siteName,
            url: siteUrl,
            description: siteDescription,
          }),
        },
      ],
    }
  })
}
