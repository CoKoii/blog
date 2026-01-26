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
  heroCover,
  heroDescription,
  goToArticle,
} = useTagsPage()
</script>

<template>
  <div class="Tags">
    <TabsSection v-model:activeTab="activeTab" :tabs="categories" />
    <HeroSection
      :post-count="cardPosts.length"
      :active-category-label="activeCategoryLabel"
      :hero-cover="heroCover"
      :hero-description="heroDescription"
    />
    <PostsGrid :posts="cardPosts" @select="goToArticle" />
  </div>
</template>

<style scoped lang="scss" src="./style.scss"></style>
