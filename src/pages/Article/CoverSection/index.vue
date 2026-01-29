<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { ArticleMeta } from '../types'

defineProps<{
  article: ArticleMeta
  loading: boolean
}>()
</script>

<template>
  <div class="cover_info" :class="{ is_skeleton: loading }">
    <img
      v-if="!loading && article.coverImage"
      class="cover_background"
      :src="article.coverImage"
      :alt="article.title"
      loading="eager"
      decoding="async"
      fetchpriority="high"
    />
    <div class="cover_overlay"></div>
    <div v-if="!loading" class="article_header">
      <div class="tags" v-if="article.tags.length">
        <span v-for="hashTag in article.tags" :key="hashTag" class="tag hash">
          # {{ hashTag }}
        </span>
      </div>
      <h1 class="title">{{ article.title }}</h1>
      <div class="meta_info">
        <span class="meta_item" v-if="article.wordCount">
          <Icon class="icon" icon="lucide:file-text" />
          {{ article.wordCount }}
        </span>
        <span class="meta_item" v-if="article.readTime">
          <Icon class="icon" icon="lucide:clock" />
          {{ article.readTime }}分钟
        </span>
        <span class="meta_item" v-if="article.publishDate">
          <Icon class="icon" icon="lucide:calendar" />
          {{ article.publishDate }}
        </span>
        <span class="meta_item" v-if="article.location">
          <Icon class="icon" icon="lucide:map-pin" />
          {{ article.location }}
        </span>
        <span class="meta_item" v-if="article.comments">
          <Icon class="icon" icon="lucide:message-circle" />
          {{ article.comments }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./style.scss"></style>
