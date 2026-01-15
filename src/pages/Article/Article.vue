<script setup lang="ts">
import { ref, shallowRef, watchEffect, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useHead } from '@vueuse/head'
import { getPostContent } from '@/utils/posts'
import type { PostFrontmatter } from '@/types/post'
import type { Component } from 'vue'

interface TocItem {
  id: string
  text: string
  level: number
}

const route = useRoute()
const ContentComponent = shallowRef<Component | null>(null)
const toc = ref<TocItem[]>([])
const activeHeadingId = ref<string>('')

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

// 生成目录
const generateToc = () => {
  if (typeof document === 'undefined') return

  const headings = document.querySelectorAll(
    '.markdown-content h1, .markdown-content h2, .markdown-content h3',
  )
  const tocItems: TocItem[] = []

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1))
    let text = heading.textContent || ''
    text = text.replace(/^[\d\.]+\s+/, '')
    let id = heading.id

    // 如果没有id，自动生成一个
    if (!id) {
      id = `heading-${index}`
      heading.id = id
    }

    tocItems.push({ id, text, level })
  })

  toc.value = tocItems
}

// 滚动监听
const handleScroll = () => {
  if (typeof document === 'undefined') return

  const headings = document.querySelectorAll(
    '.markdown-content h1, .markdown-content h2, .markdown-content h3',
  )
  const scrollPosition = window.scrollY + 400

  let activeId = ''

  headings.forEach((heading) => {
    const element = heading as HTMLElement
    if (element.offsetTop <= scrollPosition) {
      activeId = element.id
    }
  })

  if (!activeId && headings.length > 0) {
    activeId = (headings[0] as HTMLElement).id
  }

  activeHeadingId.value = activeId
}

// 跳转到指定章节
const scrollToHeading = (id: string) => {
  if (typeof document === 'undefined') return

  const element = document.getElementById(id)
  if (element) {
    const offsetTop = element.offsetTop - 80
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth',
    })
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', handleScroll)
  }
})

watchEffect(async () => {
  const id = route.params.id as string
  if (!id) return

  ContentComponent.value = null

  try {
    const module = await getPostContent(id)

    if (module) {
      ContentComponent.value = module.default
      frontmatter.value = { ...frontmatter.value, ...module.frontmatter }

      if (typeof document !== 'undefined') {
        await nextTick()
        setTimeout(() => {
          generateToc()
          handleScroll()
        }, 100)
      }
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
          <div class="toc" v-if="toc.length > 0">
            <div class="toc_header">
              <Icon icon="lucide:align-justify" class="toc_icon" />
              <span class="toc_title">目录</span>
            </div>
            <nav class="toc_nav">
              <a
                v-for="item in toc"
                :key="item.id"
                :class="[
                  'toc_item',
                  `toc_level_${item.level}`,
                  { active: activeHeadingId === item.id },
                ]"
                @click.prevent="scrollToHeading(item.id)"
                :href="`#${item.id}`"
              >
                {{ item.text }}
              </a>
            </nav>
          </div>
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
    padding: var(--space-5) 0px;
    gap: var(--space-5);

    .article {
      flex: 3;
      min-height: 400px;
      border-radius: var(--radius-md);
      padding: 48px 24px;
      transition: var(--transition-base);
    }

    .menus {
      flex: 1;
      min-height: 400px;
      border-radius: var(--radius-md);
      position: sticky;
      top: calc(var(--layout-topbar-height) + var(--space-5) - 48px);
      align-self: flex-start;
      max-height: calc(100vh - var(--layout-topbar-height) - var(--space-5) * 2);
      overflow-y: auto;

      scrollbar-width: none; /* Firefox */
      &::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
      }

      .toc {
        background-color: #ffffff;
        border-radius: 16px;
        padding: 48px 0;
        transition: all 0.3s ease;

        &:hover .toc_nav .toc_item {
          filter: blur(0);
          opacity: 1;
        }

        .toc_header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          padding-left: 4px;

          .toc_icon {
            display: block;
            width: 20px;
            height: 20px;
            color: rgba(59, 130, 246, 1);
          }

          .toc_title {
            font-size: 18px;
            font-weight: 700;
            color: #1a1a1a;
            letter-spacing: 0.5px;
          }
        }

        .toc_nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
          position: relative;

          /* Remove previous timeline rails */
          &::before {
            display: none;
          }

          .toc_item {
            display: block;
            padding: 8px 12px;
            font-size: 14px;
            line-height: 1.5;
            color: #9ca3af;
            text-decoration: none;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            cursor: pointer;
            position: relative;
            border-radius: 8px;
            border-left: none;

            /* Default: clear blur for active, blurred for others (unless hovered) */
            filter: blur(1.5px);
            opacity: 0.6;

            /* Active Indicator Bar - Hidden by default */
            &::before {
              content: '';
              position: absolute;
              left: 0;
              top: 50%;
              transform: translateY(-50%);
              width: 3px;
              height: 14px;
              background-color: rgba(59, 130, 246, 1);
              border-radius: 0 4px 4px 0;
              opacity: 0;
              transition: all 0.2s ease;
            }

            &:hover {
              color: rgb(59, 130, 246);
              background-color: rgba(59, 130, 246, 0.04);
              transform: translateY(-1px);
              opacity: 1;
              filter: blur(0);
            }

            &.toc_level_1 {
              font-weight: 500;
              margin-top: 4px;
              font-size: 16px;
            }

            &.toc_level_2 {
              padding-left: 32px;
              font-size: 15px;
            }

            &.toc_level_3 {
              padding-left: 48px;
              font-size: 14px;
            }

            &.active {
              color: rgb(59, 130, 246);
              background-color: rgba(59, 130, 246, 0.08);
              font-weight: 700;
              opacity: 1;
              filter: blur(0);
              transform: scale(1.05);
              transform-origin: left center;
              font-size: 18px !important;
              &::before {
                opacity: 1;
                left: 0;
                height: 22px;
              }
            }
          }
        }
      }
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
      padding: var(--space-4) 0;

      .article {
        padding: var(--space-5) var(--space-4);
      }

      .menus {
        position: static;
        max-height: none;

        .toc {
          margin-top: var(--space-4);
        }
      }
    }
  }
}
</style>

<style lang="scss">
@use '@/styles/markdown.scss';
</style>
