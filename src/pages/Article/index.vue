<script setup lang="ts">
import { computed } from 'vue'
import ContentSection from './ContentSection/index.vue'
import CoverSection from './CoverSection/index.vue'
import { useArticlePage } from './hooks/useArticlePage'

const { ContentComponent, toc, activeHeadingId, article, scrollToHeading } = useArticlePage()
const isLoading = computed(() => !ContentComponent.value)
</script>

<template>
  <main>
    <CoverSection :article="article" :loading="isLoading" />
    <ContentSection
      :content-component="ContentComponent"
      :toc="toc"
      :active-heading-id="activeHeadingId"
      :loading="isLoading"
      :on-scroll-to-heading="scrollToHeading"
    />
  </main>
</template>

<style lang="scss" src="@/styles/markdown.scss"></style>
