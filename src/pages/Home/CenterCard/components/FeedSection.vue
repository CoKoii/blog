<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { buildArticlePath } from '@/utils/paths'
import { getAllPosts } from '@/utils/posts'
import SlidingTabs from '@/components/Tabs/SlidingTabs.vue'

defineOptions({
  name: 'CenterCardFeedSection',
})

interface Post {
  id: string | number
  title: string
  category: string
  time: string
  readTime: string
  hot: boolean
  cover: string
}

const props = defineProps<{
  tabs: string[]
  activeTab: string
  latestPosts: Post[]
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

    <div class="more-btn-wrapper">
      <button class="view-all-btn">查看全部文章</button>
    </div>
  </section>
</template>

<style scoped lang="scss">
.feed-section {
  // Header section
  .feed-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}

// Post list
.post-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-row {
  display: flex;
  align-items: stretch;
  gap: 16px;
  padding: 16px 18px;
  border: 1px solid #f0f0f0;
  border-radius: 18px;
  background: #fff;
  transition:
    transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.35s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover,
  &:focus-within {
    transform: translateY(-2px);
    border-color: rgba(59, 130, 246, 0.22);
    box-shadow:
      0 14px 30px rgba(15, 23, 42, 0.08),
      0 0 0 2px rgba(59, 130, 246, 1);

    .post-title {
      color: var(--primary-hover-color);
    }

    .read-btn {
      opacity: 1;
      transform: translate(0);
    }

    .post-cover img {
      transform: scale(1.05);
    }
  }

  .post-cover {
    position: relative;
    width: 200px;
    height: 120px;
    border-radius: 14px;
    overflow: hidden;
    flex-shrink: 0;
    background: #eef0f4;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
  }

  .post-main {
    flex: 1;
    text-align: left;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 108px;

    .post-title {
      font-size: 1.15rem;
      font-weight: 600;
      color: #333;
      transition: color 0.2s;
      line-height: 1.4;
    }

    .post-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: #5e5e5e;

      .tag-pill {
        background: #f3f4f6;
        padding: 2px 8px;
        border-radius: 4px;
        color: #555;
        font-weight: 500;
        font-size: 0.75rem;
      }

      .dot {
        font-weight: bold;
        color: #ccc;
      }
    }
  }

  .read-btn {
    opacity: 0;
    transform: translate(10px, 2px);
    transition:
      opacity 0.25s ease,
      transform 0.35s ease;
    background: #111;
    color: #fff;
    border: none;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    align-self: center;
  }
}

// More button
.more-btn-wrapper {
  margin-top: 24px;
  text-align: center;

  .view-all-btn {
    background: #f3f4f6;
    border: none;
    padding: 12px 30px;
    border-radius: 99px;
    font-weight: 600;
    color: #555;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background: #e5e7eb;
    }
  }
}

// Media queries
@media (max-width: 720px) {
  .feed-section .feed-header {
    flex-wrap: wrap;
    gap: 12px;
  }

  .post-row {
    padding: 18px;
    min-height: 130px;

    .post-cover {
      width: 42%;
      height: auto;
      aspect-ratio: 16 / 9;
    }

    .post-main {
      justify-content: space-between;
    }

    .post-meta {
      .dot + .read,
      .read {
        display: none;
      }

      .dot:has(+ .read) {
        display: none;
      }
    }

    .read-btn {
      display: none;
    }
  }
}

@media (hover: none) {
  .post-row .read-btn {
    opacity: 1;
    transform: none;
  }
}
</style>
