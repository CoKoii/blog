<script setup lang="ts">
const props = defineProps<{
  postCount: number
  activeCategoryLabel: string
  heroCover: string
  heroDescription: string
}>()
</script>

<template>
  <section class="tags-hero">
    <div class="hero-text">
      <div class="hero-meta">
        <span class="count">{{ props.postCount }} posts</span>
        <span class="dot">·</span>
        <span class="label">分类</span>
      </div>
      <h1 class="hero-title">{{ props.activeCategoryLabel || 'Tags' }}</h1>
      <p class="hero-desc">{{ props.heroDescription }}</p>
    </div>
    <div v-if="props.heroCover" class="hero-media">
      <img v-lazy="props.heroCover" :alt="props.activeCategoryLabel" />
    </div>
    <div v-else class="hero-media hero-media--empty" aria-hidden="true"></div>
  </section>
</template>

<style scoped lang="scss" src="./style.scss"></style>
