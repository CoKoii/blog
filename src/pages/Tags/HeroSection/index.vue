<script setup lang="ts">
const { postCount, activeCategoryLabel, heroCover, heroDescription } = defineProps<{
  postCount: number
  activeCategoryLabel: string
  heroCover: string
  heroDescription: string
}>()
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
      <img v-lazy="heroCover" :alt="activeCategoryLabel" />
    </div>
  </section>
</template>

<style scoped lang="scss" src="./style.scss"></style>
