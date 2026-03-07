<script setup lang="ts">
import { createResponsiveImageSource } from '@/utils/image'
import { computed } from 'vue'

const { postCount, activeCategoryLabel, heroCover, heroDescription } = defineProps<{
  postCount: number
  activeCategoryLabel: string
  heroCover: string
  heroDescription: string
}>()

const heroCoverImage = computed(() =>
  createResponsiveImageSource(heroCover, {
    srcWidth: 900,
    quality: 80,
  }),
)
</script>

<template>
  <section class="tags-hero">
    <div class="hero-text">
      <span class="hero-kicker">分类导览</span>
      <div class="hero-meta">
        <span class="count">{{ postCount }} posts</span>
        <span class="dot">·</span>
        <span class="label">分类</span>
      </div>
      <h1 class="hero-title">{{ activeCategoryLabel || 'Tags' }}</h1>
      <p class="hero-desc">
        {{ heroDescription }}
      </p>
    </div>
    <div v-if="heroCover" class="hero-media">
      <img v-lazy="heroCoverImage" :alt="activeCategoryLabel" />
    </div>
  </section>
</template>

<style scoped lang="scss" src="./style.scss"></style>
