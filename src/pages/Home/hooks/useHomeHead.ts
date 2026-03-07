import { siteDescription, siteName, siteOwner, siteUrl } from '@/config'
import { createResponsiveImageSource, getImageOrigin } from '@/utils/image'
import { buildSeoMeta } from '@/utils/seo'
import { useHead } from '@vueuse/head'

export const useHomeHead = () => {
  const wallpaperOrigin = getImageOrigin(siteOwner.wallpaper)
  const wallpaperImage = createResponsiveImageSource(siteOwner.wallpaper, {
    srcWidth: 960,
    widths: [640, 960, 1280, 1600],
    sizes: '(max-width: 1000px) 100vw, 50vw',
    quality: 80,
    format: 'webp',
  })

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
        ...(wallpaperImage.src
          ? [
              {
                rel: 'preload',
                as: 'image',
                href: wallpaperImage.src,
                crossorigin: 'anonymous',
                fetchpriority: 'high',
                ...(wallpaperImage.srcset ? { imagesrcset: wallpaperImage.srcset } : {}),
                ...(wallpaperImage.sizes ? { imagesizes: wallpaperImage.sizes } : {}),
              },
            ]
          : []),
      ],
    }
  })
}
