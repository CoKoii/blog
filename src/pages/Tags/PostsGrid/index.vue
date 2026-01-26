<script setup lang="ts">
import type { PostListItem } from '@/composables/usePost'

const props = defineProps<{
  posts: PostListItem[]
}>()

const emit = defineEmits<{
  select: [id: string | number]
}>()

const handleSelect = (id: string | number) => {
  emit('select', id)
}
</script>

<template>
  <section class="tags-grid">
    <article
      v-for="post in props.posts"
      :key="post.id"
      class="post-card"
      @click="handleSelect(post.id)"
    >
      <div class="card-cover">
        <img v-lazy="post.cover" :alt="post.title" />
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
