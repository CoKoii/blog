<script setup lang="ts">
import HeroSection from './HeroSection/index.vue'
import PostsGrid from './PostsGrid/index.vue'
import TabsSection from './TabsSection/index.vue'
import { useTagsPage } from './utils'

const {
  categories,
  activeTab,
  activeCategoryLabel,
  cardPosts,
  activeTagColor,
  heroCover,
  heroDescription,
  goToArticle,
} = useTagsPage()
</script>

<template>
  <div class="Tags" :style="{ '--tags-accent': activeTagColor }">
    <TabsSection v-model:activeTab="activeTab" :tabs="categories" />
    <HeroSection
      :post-count="cardPosts.length"
      :active-category-label="activeCategoryLabel"
      :hero-cover="heroCover"
      :hero-description="heroDescription"
    />
    <section class="posts-section">
      <div class="posts-head">
        <h2 class="posts-title">文章列表</h2>
        <p class="posts-subtitle">{{ activeCategoryLabel || 'All' }} · {{ cardPosts.length }} 篇</p>
      </div>
      <PostsGrid :posts="cardPosts" @select="goToArticle" />
    </section>
  </div>
</template>

<style scoped lang="scss" src="./style.scss"></style>
