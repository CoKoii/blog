import { siteDescription, siteName, siteUrl } from '@/config'
import { buildSeoMeta } from '@/utils/seo'
import { useHead } from '@vueuse/head'

export const useHomeHead = () => {
  useHead(() =>
    buildSeoMeta({
      title: siteName,
      description: siteDescription,
      url: siteUrl,
      type: 'website',
      schemaData: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName,
        url: siteUrl,
        description: siteDescription,
      },
    }),
  )
}
