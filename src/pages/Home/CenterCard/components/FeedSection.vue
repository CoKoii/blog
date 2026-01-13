<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'

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

const activeIndex = computed(() => {
  const index = props.tabs.indexOf(props.activeTab)
  return index === -1 ? 0 : index
})

const tabsStyle = computed(() => ({
  '--active-index': String(activeIndex.value),
  '--tab-count': String(props.tabs.length),
}))

const setTab = (tab: string) => {
  emit('update:activeTab', tab)
}
</script>

<template>
  <section class="feed-section">
    <div class="feed-header">
      <h2 class="section-title"><Icon icon="lucide:sparkles" class="title-icon" /> 最新文章</h2>
      <div class="tabs" :style="tabsStyle">
        <span class="tab-indicator" aria-hidden="true">
          <span :key="props.activeTab" class="tab-indicator-inner"></span>
        </span>
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
        <div class="post-cover">
          <img :src="post.cover" :alt="post.title" loading="lazy" />
          <div class="post-marker" :class="{ hot: post.hot }"></div>
        </div>
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
      display: grid;
      grid-template-columns: repeat(var(--tab-count), minmax(0, 1fr));
      gap: var(--tabs-gap);
      background: #eaecf0;
      padding: var(--tabs-padding);
      border-radius: 14px;
      position: relative;
      overflow: hidden;
      isolation: isolate;
      --tabs-gap: 6px;
      --tabs-padding: 3px;
      .tab-indicator {
        position: absolute;
        top: var(--tabs-padding);
        bottom: var(--tabs-padding);
        left: var(--tabs-padding);
        width: calc(
          (100% - (var(--tabs-padding) * 2) - (var(--tabs-gap) * (var(--tab-count) - 1))) /
            var(--tab-count)
        );
        transform: translateX(calc(var(--active-index) * (100% + var(--tabs-gap))));
        transition: transform 0.55s cubic-bezier(0.16, 1.35, 0.3, 1);
        will-change: transform;
        z-index: 0;
      }
      .tab-indicator-inner {
        position: absolute;
        inset: 0;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 6px 14px rgba(17, 24, 39, 0.12);
        animation: jelly 0.55s ease-out;
      }
      .tab-btn {
        background: transparent;
        border: none;
        padding: 6px 12px;
        font-size: 0.85rem;
        font-weight: 600;
        color: #666;
        cursor: pointer;
        border-radius: 10px;
        transition: color 0.2s ease;
        position: relative;
        z-index: 1;
        width: 100%;
      }
      .tab-btn.active {
        color: #000;
      }
    }
  }
}

@keyframes jelly {
  0% {
    transform: scaleX(0.9) scaleY(0.9);
  }
  45% {
    transform: scaleX(1.08) scaleY(0.92);
  }
  70% {
    transform: scaleX(0.98) scaleY(1.04);
  }
  100% {
    transform: scaleX(1) scaleY(1);
  }
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 14px;
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
      transform: translateX(0) translateY(0);
    }
    .post-cover img {
      transform: scale(1.05);
    }
  }

  .post-cover {
    position: relative;
    width: 140px;
    height: 88px;
    border-radius: 14px;
    overflow: hidden;
    flex: 0 0 auto;
    background: #eef0f4;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7);
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scale(1);
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .post-marker {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.85);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      &.hot {
        background: #ff4757;
        box-shadow: 0 0 10px rgba(255, 71, 87, 0.6);
      }
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
    transform: translateX(10px) translateY(2px);
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
  }
}

@media (max-width: 720px) {
  .post-row {
    flex-direction: column;
    align-items: stretch;
    .post-cover {
      width: 100%;
      height: 160px;
    }
    .read-btn {
      align-self: flex-end;
    }
  }
}

@media (hover: none) {
  .post-row {
    transform: none;
    .read-btn {
      opacity: 1;
      transform: none;
    }
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
