<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineOptions({
  name: 'CenterCardFeedSection',
})

type Post = {
  id: number
  title: string
  category: string
  time: string
  readTime: string
  hot: boolean
}

const props = defineProps<{
  tabs: string[]
  activeTab: string
  latestPosts: Post[]
}>()

const emit = defineEmits<{
  'update:activeTab': [value: string]
}>()

const setTab = (tab: string) => {
  emit('update:activeTab', tab)
}
</script>

<template>
  <section class="feed-section">
    <div class="feed-header">
      <h2 class="section-title">
        <Icon icon="lucide:sparkles" class="title-icon" /> Latest Updates
      </h2>
      <div class="tabs">
        <button
          v-for="tab in props.tabs"
          :key="tab"
          :class="['tab-btn', { active: props.activeTab === tab }]"
          @click="setTab(tab)"
        >
          {{ tab }}
        </button>
      </div>
    </div>

    <div class="post-list">
      <div v-for="post in props.latestPosts" :key="post.id" class="post-row">
        <div class="post-marker" :class="{ hot: post.hot }"></div>
        <div class="post-main">
          <h3 class="post-title">{{ post.title }}</h3>
          <div class="post-meta">
            <span class="cat tag-pill">{{ post.category }}</span>
            <span class="dot">·</span>
            <span class="time">{{ post.time }}</span>
            <span class="dot">·</span>
            <span class="read">{{ post.readTime }} read</span>
          </div>
        </div>
        <button class="read-btn">Read</button>
      </div>
    </div>

    <div class="more-btn-wrapper">
      <button class="view-all-btn">View Archive</button>
    </div>
  </section>
</template>

<style scoped lang="scss">
.feed-section {
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
    .tabs {
      display: flex;
      gap: 8px;
      background: #eaecf0;
      padding: 4px;
      border-radius: 12px;
      .tab-btn {
        background: transparent;
        border: none;
        padding: 6px 16px;
        font-size: 0.85rem;
        font-weight: 600;
        color: #666;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s;
      }
      .tab-btn.active {
        background: #fff;
        color: #000;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }
    }
  }
}

.post-list {
  display: flex;
  flex-direction: column;
}

.post-row {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
  transition: background 0.2s;
  cursor: pointer;
  position: relative;

  &:first-child {
    padding-top: 0;
  }
  &:hover {
    .post-title {
      color: var(--primary-hover-color);
    }
    .read-btn {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .post-marker {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ddd;
    margin-right: 16px;
    &.hot {
      background: #ff4757;
      box-shadow: 0 0 8px rgba(255, 71, 87, 0.4);
    }
  }

  .post-main {
    flex: 1;
    .post-title {
      font-size: 1.15rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 6px;
      transition: color 0.2s;
    }
    .post-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: #888;
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
    transform: translateX(10px);
    transition: all 0.2s;
    background: #111;
    color: #fff;
    border: none;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 500;
  }
}

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
    transition: 0.2s;
    &:hover {
      background: #e5e7eb;
    }
  }
}
</style>
