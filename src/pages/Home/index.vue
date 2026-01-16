<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { siteDescription, siteImage, siteName, siteUrl } from '@/config/site'
import TopCard from './TopCard/TopCard.vue'
import CenterCard from './CenterCard/CenterCard.vue'

const canonicalUrl = siteUrl

useHead(() => {
  const meta = [
    {
      name: 'description',
      content: siteDescription,
    },
    {
      property: 'og:title',
      content: siteName,
    },
    {
      property: 'og:description',
      content: siteDescription,
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:url',
      content: canonicalUrl,
    },
    {
      property: 'og:site_name',
      content: siteName,
    },
    {
      name: 'twitter:card',
      content: siteImage ? 'summary_large_image' : 'summary',
    },
    {
      name: 'twitter:title',
      content: siteName,
    },
    {
      name: 'twitter:description',
      content: siteDescription,
    },
  ] as Array<Record<string, string>>

  if (siteImage) {
    meta.push(
      {
        property: 'og:image',
        content: siteImage,
      },
      {
        name: 'twitter:image',
        content: siteImage,
      },
    )
  }

  return {
    title: siteName,
    link: [
      {
        rel: 'canonical',
        href: canonicalUrl,
      },
    ],
    meta,
  }
})
</script>

<template>
  <div class="Home">
    <TopCard />
    <CenterCard />
  </div>
</template>

<style scoped lang="scss">
.Home {
  display: flex;
  flex-direction: column;
  gap: 48px;
}
</style>
