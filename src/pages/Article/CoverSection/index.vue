<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { ArticleMeta } from '../types'

const props = defineProps<{ article: ArticleMeta; loading: boolean }>()
</script>

<template>
  <div class="cover_info" :class="{ is_skeleton: props.loading }">
    <img
      v-if="!props.loading && props.article.coverImage"
      class="cover_background"
      :src="props.article.coverImage"
      :alt="props.article.title"
      loading="eager"
      decoding="async"
      fetchpriority="high"
    />
    <div class="cover_overlay"></div>
    <div v-if="!props.loading" class="article_header">
      <div class="tags" v-if="props.article.tags.length">
        <span v-for="tag in props.article.tags" :key="tag" class="tag hash"># {{ tag }}</span>
      </div>
      <h1 class="title">{{ props.article.title }}</h1>
      <div class="meta_info">
        <span class="meta_item" v-if="props.article.wordCount">
          <Icon class="icon" icon="lucide:file-text" />{{ props.article.wordCount }}
        </span>
        <span class="meta_item" v-if="props.article.readTime">
          <Icon class="icon" icon="lucide:clock" />{{ props.article.readTime }}分钟
        </span>
        <span class="meta_item" v-if="props.article.publishDate">
          <Icon class="icon" icon="lucide:calendar" />{{ props.article.publishDate }}
        </span>
        <span class="meta_item" v-if="props.article.location">
          <Icon class="icon" icon="lucide:map-pin" />{{ props.article.location }}
        </span>
        <span class="meta_item" v-if="props.article.comments !== null">
          <Icon class="icon" icon="lucide:message-circle" />{{ props.article.comments }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./style.scss"></style>
