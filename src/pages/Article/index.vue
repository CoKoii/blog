<script setup lang="ts">
import { computed } from 'vue'
import ContentSection from './ContentSection/index.vue'
import CoverSection from './CoverSection/index.vue'
import { useArticlePage } from './utils'

const { ContentComponent, toc, activeHeadingId, article, scrollToHeading } = useArticlePage()
const isLoading = computed(() => !ContentComponent.value)
</script>

<template>
  <div class="Article">
    <CoverSection :article="article" :loading="isLoading" />
    <ContentSection
      :content-component="ContentComponent"
      :toc="toc"
      :active-heading-id="activeHeadingId"
      :loading="isLoading"
      :on-scroll-to-heading="scrollToHeading"
    />
  </div>
</template>

<style scoped lang="scss" src="./style.scss"></style>

<style lang="scss" src="@/styles/markdown.scss"></style>
