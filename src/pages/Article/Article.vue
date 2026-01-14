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
  const headings = document.querySelectorAll(
    '.markdown-content h1, .markdown-content h2, .markdown-content h3',
  )
  const tocItems: TocItem[] = []

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1))
    const text = heading.textContent || ''
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
  const headings = document.querySelectorAll(
    '.markdown-content h1, .markdown-content h2, .markdown-content h3',
  )
  const scrollPosition = window.scrollY + 100

  let activeId = ''

  headings.forEach((heading) => {
    const element = heading as HTMLElement
    if (element.offsetTop <= scrollPosition) {
      activeId = element.id
    }
  })

  activeHeadingId.value = activeId
}

// 跳转到指定章节
const scrollToHeading = (id: string) => {
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
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
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

      // 等待DOM更新后生成目录
      await nextTick()
      setTimeout(() => {
        generateToc()
        handleScroll()
      }, 100)
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
              <Icon icon="lucide:list" class="toc_icon" />
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
      top: calc(var(--layout-topbar-height) + var(--space-5));
      align-self: flex-start;
      max-height: calc(100vh - var(--layout-topbar-height) - var(--space-5) * 2);
      overflow-y: auto;

      .toc {
        background-color: var(--color-bg-softer);
        border-radius: var(--radius-md);
        padding: var(--space-4);
        box-shadow: var(--shadow-panel);

        .toc_header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
          padding-bottom: var(--space-2);
          border-bottom: 2px solid var(--color-border-subtle);

          .toc_icon {
            width: 18px;
            height: 18px;
            color: #667eea;
          }

          .toc_title {
            font-size: 16px;
            font-weight: 700;
            color: var(--color-text-primary);
          }
        }

        .toc_nav {
          display: flex;
          flex-direction: column;
          gap: 2px;

          .toc_item {
            display: block;
            padding: 6px var(--space-2);
            font-size: 13px;
            line-height: 1.5;
            color: var(--color-text-secondary);
            text-decoration: none;
            border-radius: var(--radius-xs);
            transition: all 0.2s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            &::before {
              content: '';
              position: absolute;
              left: 0;
              top: 50%;
              transform: translateY(-50%);
              width: 3px;
              height: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 2px;
              transition: height 0.2s ease;
            }

            &:hover {
              color: #667eea;
              background-color: var(--color-bg-hover);
              padding-left: var(--space-3);

              &::before {
                height: 60%;
              }
            }

            &.active {
              color: #667eea;
              background-color: rgba(103, 126, 234, 0.08);
              font-weight: 600;
              padding-left: var(--space-3);

              &::before {
                height: 70%;
              }
            }

            &.toc_level_1 {
              font-weight: 600;
              font-size: 14px;
              margin-top: 6px;
            }

            &.toc_level_2 {
              padding-left: 20px;
            }

            &.toc_level_3 {
              padding-left: 32px;
              font-size: 12px;
              color: var(--color-text-tertiary);
            }
          }
        }

        /* 滚动条样式 */
        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          background: transparent;
        }

        &::-webkit-scrollbar-thumb {
          background: var(--color-border-subtle);
          border-radius: 3px;

          &:hover {
            background: var(--color-text-tertiary);
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
