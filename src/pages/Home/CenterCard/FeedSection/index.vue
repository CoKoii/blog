<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { buildArticlePath } from '@/utils/paths'
import { getAllPosts } from '@/utils/posts'
import SlidingTabs from '@/components/Tabs/SlidingTabs.vue'
import type { PostListItem } from '@/composables/usePost'

type TabItem = string | { label: string; value: string }

const props = defineProps<{
  tabs: TabItem[]
  activeTab: string
  latestPosts: PostListItem[]
}>()

const emit = defineEmits<{
  'update:activeTab': [value: string]
}>()

const router = useRouter()

const activeTab = computed({
  get: () => props.activeTab,
  set: (value: string) => emit('update:activeTab', value),
})

const goToArticle = (postId: string | number) => {
  const allPosts = getAllPosts()
  const post = allPosts.find((p) => p.id === String(postId))
  if (!post) return
  router.push(buildArticlePath(post))
}
</script>

<template>
  <section class="feed-section">
    <div class="feed-header">
      <h2 class="section-title">
        <Icon icon="lucide:sparkles" class="title-icon" />
        最新文章
      </h2>
      <SlidingTabs v-model:activeTab="activeTab" :tabs="tabs" />
    </div>

    <div class="post-list">
      <article
        v-for="post in latestPosts"
        :key="post.id"
        class="post-row"
        @click="goToArticle(post.id)"
      >
        <div class="post-cover">
          <img v-lazy="post.cover" :alt="post.title" />
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
        <button class="read-btn" aria-label="阅读文章" @click.stop="goToArticle(post.id)">
          Read
        </button>
      </article>
    </div>

  </section>
</template>

<style scoped lang="scss" src="./style.scss"></style>
