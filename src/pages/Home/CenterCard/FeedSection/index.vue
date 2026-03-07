<script setup lang="ts">
import SlidingTabs from '@/components/Tabs/SlidingTabs.vue'
import { Icon } from '@/components/Icon'
import type { TabItem } from '@/types/tab'
import { createResponsiveImageSource } from '@/utils/image'
import { buildArticlePath } from '@/utils/paths'
import { findPostById, type PostListItem } from '@/utils/posts'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  tabs: TabItem[]
  activeTab: string
  latestPosts: PostListItem[]
}>()

const emit = defineEmits<{ 'update:activeTab': [value: string] }>()
const router = useRouter()

const activeTabModel = computed({
  get: () => props.activeTab,
  set: (v: string) => emit('update:activeTab', v),
})

const goTo = (id: string | number) => {
  const post = findPostById(id)
  if (!post) return
  router.push(buildArticlePath(post))
}

const getPostCover = (cover: string) =>
  createResponsiveImageSource(cover, {
    srcWidth: 480,
    widths: [320, 480, 640],
    sizes: '(max-width: 720px) 42vw, 200px',
    quality: 80,
  })
</script>

<template>
  <section class="feed-section">
    <div class="feed-header">
      <h2 class="section-title">
        <Icon icon="lucide:sparkles" class="title-icon" />
        最新文章
      </h2>
      <SlidingTabs v-model:activeTab="activeTabModel" :tabs="tabs" />
    </div>

    <div class="post-list">
      <article v-for="post in latestPosts" :key="post.id" class="post-row" @click="goTo(post.id)">
        <div class="post-cover">
          <img v-lazy="getPostCover(post.cover)" :alt="post.title" />
        </div>
        <div class="post-main">
          <h3 class="post-title">{{ post.title }}</h3>
          <div class="post-meta">
            <span class="tag-pill">{{ post.category }}</span>
            <span class="dot">·</span>
            <span class="time">{{ post.time }}</span>
            <span class="dot">·</span>
            <span class="read">{{ post.readTime }} read</span>
          </div>
        </div>
        <button class="read-btn" aria-label="阅读文章" @click.stop="goTo(post.id)">Read</button>
      </article>
    </div>
  </section>
</template>

<style scoped lang="scss" src="./style.scss"></style>
