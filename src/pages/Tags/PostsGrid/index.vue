<script setup lang="ts">
import { createResponsiveImageSource } from '@/utils/image'
import type { PostListItem } from '@/utils/posts'

const { posts } = defineProps<{
  posts: PostListItem[]
}>()

const emit = defineEmits<{
  select: [id: string | number]
}>()

const getPostCover = (cover: string) =>
  createResponsiveImageSource(cover, {
    srcWidth: 560,
    widths: [360, 560, 720],
    sizes: '(max-width: 720px) 42vw, 25vw',
    quality: 80,
  })
</script>

<template>
  <section class="tags-grid">
    <article
      v-for="post in posts"
      :key="post.id"
      class="post-card"
      @click="emit('select', post.id)"
    >
      <div class="card-cover">
        <img v-lazy="getPostCover(post.cover)" :alt="post.title" />
        <span class="read-badge">{{ post.readTime }} read</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">{{ post.title }}</h3>
        <div class="card-meta">
          <span class="tag-pill">{{ post.category }}</span>
          <span class="dot">·</span>
          <span class="time">{{ post.time }}</span>
        </div>
      </div>
    </article>
  </section>
</template>

<style scoped lang="scss" src="./style.scss"></style>
