<script setup lang="ts">
import { ref, shallowRef, watchEffect, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useHead } from '@vueuse/head'
import { getPostContent } from '@/utils/posts'
import type { PostFrontmatter } from '@/types/post'
import type { Component } from 'vue'

const route = useRoute()
const ContentComponent = shallowRef<Component | null>(null)

// 文章元数据（带默认值）
const frontmatter = ref<PostFrontmatter>({
  title: '',
  coverImage: '',
  tags: [],
  wordCount: 0,
  readTime: 0,
  publishDate: '',
  views: 0,
  location: '',
  comments: 0,
})

// 计算显示数据
const article = computed(() => ({
  title: frontmatter.value.title || 'Untitled',
  coverImage: frontmatter.value.coverImage || '',
  tags: frontmatter.value.tags || [],
  wordCount: frontmatter.value.wordCount || 0,
  readTime: frontmatter.value.readTime || 0,
  publishDate: formatDate(frontmatter.value.publishDate || frontmatter.value.date),
  views: frontmatter.value.views || 0,
  location: frontmatter.value.location || '',
  comments: frontmatter.value.comments || 0,
}))

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 动态设置页面 head
useHead(() => ({
  title: article.value.title,
  meta: [
    {
      name: 'description',
      content: frontmatter.value.description || article.value.title,
    },
    {
      property: 'og:title',
      content: article.value.title,
    },
    {
      property: 'og:description',
      content: frontmatter.value.description || article.value.title,
    },
    {
      name: 'keywords',
      content: article.value.tags.join(', '),
    },
  ],
}))

watchEffect(async () => {
  const id = route.params.id as string
  if (!id) return

  ContentComponent.value = null

  try {
    const module = await getPostContent(id)

    if (module) {
      ContentComponent.value = module.default
      frontmatter.value = { ...frontmatter.value, ...module.frontmatter }
    }
  } catch (error) {
    console.error('Failed to load article:', error)
  }
})
</script>

<template>
  <div class="Article">
    <!-- 文章内容 -->
    <template v-if="ContentComponent">
      <div class="cover_info">
        <!-- 背景图层 -->
        <div
          class="cover_background"
          :style="{
            backgroundImage: article.coverImage ? `url(${article.coverImage})` : 'none',
          }"
        ></div>
        <!-- 模糊遮罩 -->
        <div class="cover_overlay"></div>
        <!-- 文章信息 -->
        <div class="article_header">
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
            <span class="meta_item" v-if="article.views">
              <Icon class="icon" icon="lucide:eye" />
              {{ article.views }}
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

      <div class="content">
        <article class="article markdown-content">
          <component :is="ContentComponent" />
        </article>
        <aside class="menus">
          <!-- TODO: 目录/相关文章 -->
        </aside>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.Article {
  .cover_info {
    position: relative;
    width: 100%;
    height: 500px;
    overflow: hidden;
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    .cover_background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      z-index: 0;
    }

    &:hover .cover_background {
      transform: scale(1.05);
    }

    .cover_overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.2) 40%,
        rgba(0, 0, 0, 0.6) 80%,
        rgba(0, 0, 0, 0.85) 100%
      );
      z-index: 1;
    }

    .article_header {
      position: relative;
      width: 100%;
      padding: 40px;
      color: white;
      z-index: 2;
      box-sizing: border-box;

      .tags {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        flex-wrap: wrap;

        .tag {
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.5px;
          backdrop-filter: blur(12px);
          transition: all 0.3s ease;

          &.hash {
            background-color: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.9);
          }

          &:hover {
            background-color: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
          }
        }
      }

      .title {
        font-size: 42px;
        font-weight: 700;
        line-height: 1.3;
        margin: 0 0 24px 0;
        text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        max-width: 900px;
      }

      .meta_info {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
        font-size: 15px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.9);

        .meta_item {
          display: flex;
          align-items: center;
          gap: 6px;

          .icon {
            width: 18px;
            height: 18px;
            opacity: 0.9;
          }
        }
      }
    }
  }

  .content {
    display: flex;
    margin: 0 auto;
    padding: 24px 0px;
    gap: 20px;

    .article {
      flex: 3;
      min-height: 400px;
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 20px;
    }

    .menus {
      flex: 1;
      min-height: 400px;
      background-color: #f0f0f0;
      border-radius: 8px;
      padding: 20px;
    }
  }
}

@media (max-width: 768px) {
  .Article {
    .cover_info {
      height: auto;
      min-height: 300px;

      .article_header {
        padding: 40px 20px;

        .title {
          font-size: 32px;
        }

        .meta_info {
          gap: 20px;
          font-size: 14px;
        }
      }
    }

    .content {
      flex-direction: column;
      padding: 20px 15px;
    }
  }
}
</style>
