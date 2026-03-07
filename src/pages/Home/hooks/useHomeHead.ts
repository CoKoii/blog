import { siteDescription, siteName, siteOwner, siteUrl } from '@/config'
import { createResponsiveImageSource, getImageOrigin } from '@/utils/image'
import { buildSeoMeta } from '@/utils/seo'
import { useHead } from '@vueuse/head'

export const useHomeHead = () => {
  const wallpaperOrigin = getImageOrigin(siteOwner.wallpaper)
  const wallpaperPreloadHref = createResponsiveImageSource(siteOwner.wallpaper, {
    srcWidth: 960,
    quality: 80,
    format: 'webp',
  }).src

  useHead(() => {
    const head = buildSeoMeta({
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
    })

    return {
      ...head,
      link: [
        ...head.link,
        ...(wallpaperOrigin
          ? [{ rel: 'preconnect', href: wallpaperOrigin, crossorigin: 'anonymous' }]
          : []),
        ...(wallpaperPreloadHref
          ? [{ rel: 'preload', as: 'image', href: wallpaperPreloadHref }]
          : []),
      ],
    }
  })
}
