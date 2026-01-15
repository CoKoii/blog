<script setup lang="ts">
import { ref, shallowRef, watchEffect, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useHead } from '@vueuse/head'
import { Skeleton, SkeletonImage } from 'ant-design-vue'
import { getPostContent } from '@/utils/posts'
import { formatDate } from '@/utils/date'
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
const canUseDOM = typeof window !== 'undefined' && typeof document !== 'undefined'
const HEADING_SELECTOR = '.markdown-content h1, .markdown-content h2, .markdown-content h3'
const SCROLL_OFFSET = 400

// 文章元数据（带默认值）
const DEFAULT_FRONTMATTER: PostFrontmatter = {
  title: '',
  coverImage: '',
  tags: [],
  wordCount: 0,
  readTime: 0,
  publishDate: '',
  location: '',
  comments: 0,
}
const frontmatter = ref<PostFrontmatter>({ ...DEFAULT_FRONTMATTER })

const getTitleFromSlug = (slug?: string): string => {
  if (!slug) return 'Untitled'
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}

const fallbackTitle = computed(() => getTitleFromSlug(route.params.id as string | undefined))

// 计算显示数据
const article = computed(() => ({
  title: frontmatter.value.title || fallbackTitle.value,
  coverImage: frontmatter.value.coverImage || '',
  tags: frontmatter.value.tags || [],
  wordCount: frontmatter.value.wordCount || 0,
  readTime: frontmatter.value.readTime || 0,
  publishDate: formatDate(frontmatter.value.publishDate || frontmatter.value.date),
  location: frontmatter.value.location || '',
  comments: frontmatter.value.comments || 0,
}))

const getHeadings = (): HTMLElement[] => {
  if (!canUseDOM) return []
  return Array.from(document.querySelectorAll(HEADING_SELECTOR)) as HTMLElement[]
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
  const headings = getHeadings()
  const tocItems: TocItem[] = []

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1), 10)
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
  const headings = getHeadings()
  const scrollPosition = window.scrollY + SCROLL_OFFSET

  let activeId = ''

  headings.forEach((heading) => {
    if (heading.offsetTop <= scrollPosition) {
      activeId = heading.id
    }
  })

  if (!activeId) {
    const firstHeading = headings[0]
    if (firstHeading) {
      activeId = firstHeading.id
    }
  }

  activeHeadingId.value = activeId
}

// 跳转到指定章节
const scrollToHeading = (id: string) => {
  if (!canUseDOM) return

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
  if (!canUseDOM) return
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  if (!canUseDOM) return
  window.removeEventListener('scroll', handleScroll)
})

watchEffect(async () => {
  const category = route.params.category as string
  const slug = route.params.id as string
  if (!category || !slug) return
  const id = `${category}/${slug}`

  ContentComponent.value = null
  frontmatter.value = { ...DEFAULT_FRONTMATTER }
  toc.value = []
  activeHeadingId.value = ''

  try {
    const module = await getPostContent(id)

    if (!module) return

    ContentComponent.value = module.default
    frontmatter.value = { ...DEFAULT_FRONTMATTER, ...module.frontmatter }

    if (!canUseDOM) return
    await nextTick()
    const schedule =
      window.requestAnimationFrame?.bind(window) ||
      ((cb: FrameRequestCallback) => window.setTimeout(cb, 0))
    schedule(() => {
      generateToc()
      handleScroll()
    })
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
        <img
          v-if="article.coverImage"
          class="cover_background"
          v-lazy="article.coverImage"
          :alt="article.title"
        />
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
    <template v-else>
      <div class="cover_info is_skeleton">
        <SkeletonImage class="cover_skeleton_image" />
        <div class="cover_overlay"></div>
        <div class="article_header">
          <Skeleton
            active
            :title="{ width: '60%' }"
            :paragraph="{ rows: 2, width: ['90%', '70%'] }"
          />
        </div>
      </div>
      <div class="content is_skeleton">
        <article class="article markdown-content">
          <Skeleton active :paragraph="{ rows: 14 }" />
        </article>
        <aside class="menus">
          <div class="toc">
            <Skeleton active :title="{ width: '40%' }" :paragraph="{ rows: 6 }" />
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
      object-fit: cover;
      object-position: center;
      transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      z-index: 0;
      display: block;
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

  .cover_info.is_skeleton {
    background: #ffffff;
  }

  .cover_skeleton_image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;

    :deep(.ant-skeleton-image) {
      width: 100%;
      height: 100%;
    }
  }

  .content {
    display: flex;
    margin: 0 auto;
    padding: var(--space-5) 0px;
    gap: var(--space-5);

    .article {
      flex: 4;
      min-height: 400px;
      border-radius: var(--radius-md);
      padding: 48px 24px;
      transition: var(--transition-base);
      font-family: LXGWWenKai-Regular;
    }

    .menus {
      flex: 1;
      min-height: 400px;
      border-radius: var(--radius-md);
      position: sticky;
      top: calc(var(--layout-topbar-height) + var(--space-5) - 48px);
      align-self: flex-start;

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
            filter: blur(1px);
            opacity: 0.6;

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
              color: #3661df;
              background-color: #f5f6fd;
              transform: translateY(-1px);
              opacity: 1;
              filter: blur(0);
            }

            &.toc_level_1 {
              font-weight: 500;
              margin-top: 4px;
              font-size: 15px;
            }

            &.toc_level_2 {
              padding-left: 28px;
              font-size: 14px;
            }

            &.toc_level_3 {
              padding-left: 40px;
              font-size: 13px;
            }

            &.active {
              color: #3661df;
              background-color: #f5f6fd;
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

  .content.is_skeleton {
    .article {
      background: #ffffff;
    }

    .toc {
      background-color: #ffffff;
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
